'use client';

import React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAnime, getAnimeFilters } from '../lib/api';
import { addToWatchlist as addToWatchlistApi, removeFromWatchlist, getWatchlist } from '../lib/watchlist';
import LoadingSpinner from '../components/LoadingSpinner';
import Image from 'next/image';

// Define the Anime type for type safety
type Anime = {
  id: number;
  title: string;
  englishTitle?: string;
  coverImage: string;
  episodes?: number;
  status: string;
  format: string;
  genres: string[];
  averageScore?: number;
  year?: number;
  nextAiring?: {
    episode: number;
    timeUntilAiring: number;
  };
};

export default function AnimePage() {
  const router = useRouter();
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [addingToWatchlist, setAddingToWatchlist] = useState<number | null>(null);
  const [watchlistItems, setWatchlistItems] = useState<Record<string, string>>({});
  const [watchlistFeedback, setWatchlistFeedback] = useState<number | null>(null);
  
  // Header visibility state
  const [headerVisible, setHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filters state
  const [sort, setSort] = useState('TRENDING_DESC');
  const [format, setFormat] = useState('');
  const [status, setStatus] = useState('');
  const [genre, setGenre] = useState('');
  
  // Get filter options
  const { formats, statuses, sorts, genres } = getAnimeFilters();
  
  // Observer for infinite scrolling
  const observer = useRef<IntersectionObserver>();
  const lastAnimeElementRef = useCallback((node) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // Load anime data
  const loadAnime = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      
      // If reset is true, we're applying new filters or search, so reset page to 1
      const currentPage = reset ? 1 : page;
      if (reset) {
        setPage(1);
      }
      
      const data = await fetchAnime({
        sort: sort,
        format: format || undefined,
        status: status || undefined,
        search: search || undefined,
        genre: genre || undefined,
        page: currentPage
      });
      
      setAnimeList(prev => reset ? data.results : [...prev, ...data.results]);
      setHasMore(data.hasNextPage);
      setError('');
    } catch (err) {
      setError('Failed to load anime. Please try again later.');
      console.error('Error loading anime:', err);
    } finally {
      setLoading(false);
    }
  }, [page, sort, format, status, search, genre]);

  // Load user's watchlist to check which anime are already added
  const loadWatchlist = useCallback(async () => {
    try {
      const watchlist = await getWatchlist();
      const watchlistMap: Record<string, string> = {};
      
      // Create a map of mediaId -> watchlistId for quick lookup
      watchlist.forEach(item => {
        if (item.mediaType === 'anime') {
          watchlistMap[item.mediaId] = item.id;
        }
      });
      
      setWatchlistItems(watchlistMap);
    } catch (err) {
      console.error('Error loading watchlist:', err);
    }
  }, []);

  // Load initial data and watchlist
  useEffect(() => {
    loadAnime();
    loadWatchlist();
  }, [loadAnime, loadWatchlist]);

  // Load more data when page changes
  useEffect(() => {
    if (page > 1) {
      loadAnime();
    }
  }, [page, loadAnime]);

  // Handle filter changes
  const applyFilters = () => {
    loadAnime(true);
    setShowFilters(false); // Hide filters after applying
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    loadAnime(true);
  };

  // Toggle watchlist (add or remove)
  const toggleWatchlist = async (e: React.MouseEvent, anime: Anime) => {
    e.stopPropagation();
    
    if (addingToWatchlist === anime.id) {
      return;
    }
    
    setAddingToWatchlist(anime.id);
    
    try {
      const animeIdStr = anime.id.toString();
      const isInWatchlist = watchlistItems[animeIdStr];
      
      if (isInWatchlist) {
        // Remove from watchlist
        const success = await removeFromWatchlist(isInWatchlist);
        if (success) {
          // Update local state
          setWatchlistItems(prev => {
            const updated = { ...prev };
            delete updated[animeIdStr];
            return updated;
          });
          
          // Show visual feedback
          setWatchlistFeedback(anime.id);
          setTimeout(() => {
            setWatchlistFeedback(null);
          }, 2000);
        }
      } else {
        // Add to watchlist
        const watchlistItem = {
          id: '',
          title: anime.title,
          mediaType: 'anime' as const,
          mediaId: animeIdStr,
          imageUrl: anime.coverImage,
          totalEpisodes: anime.episodes,
          progress: 0,
          rating: 0
        };
        
        const result = await addToWatchlistApi(watchlistItem);
        if (result) {
          // Update local state
          setWatchlistItems(prev => ({
            ...prev,
            [animeIdStr]: result.id
          }));
          
          // Show visual feedback with watchlist feedback state
          setWatchlistFeedback(anime.id);
          setTimeout(() => {
            setWatchlistFeedback(null);
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Error updating watchlist:', error);
    } finally {
      setAddingToWatchlist(null);
    }
  };

  // Navigate to anime details
  const navigateToAnimeDetails = (animeId: number) => {
    router.push(`/anime/${animeId}`);
  };

  // Format the airing time remaining
  const formatTimeUntilAiring = (seconds: number) => {
    if (!seconds) return '';
    
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  // Handle scroll for header visibility
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down, hide header
        setHeaderVisible(false);
      } else {
        // Scrolling up, show header
        setHeaderVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Improved Header with filters */}
      <div 
        className={`mb-6 sticky top-0 z-10 bg-background-primary/95 backdrop-blur-md p-4 rounded-xl shadow-lg border border-background-secondary/20 transition-transform duration-300 ${
          headerVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-text-primary">Anime</h1>
            
            {/* Watchlist navigation button */}
            <button
              onClick={() => router.push('/watchlist')}
              className="flex items-center gap-2 bg-accent-primary/90 text-background-primary px-4 py-2 rounded-xl hover:bg-accent-primary transition-colors duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
              My Watchlist
            </button>
          </div>
          
          {/* Search bar - simplified and improved */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search anime..."
                className="w-full p-2 pl-10 rounded-lg bg-background-secondary/90 text-text-primary border border-background-secondary/50 hover:border-accent-primary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <button 
                type="submit"
                className="absolute inset-y-0 left-0 px-3 flex items-center text-text-secondary hover:text-accent-primary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>
          
          {/* Improved Filter toggle button */}
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-background-secondary/90 text-text-primary px-4 py-2 rounded-xl hover:bg-background-tertiary transition-all duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>Filters</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-4 w-4 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        
        {/* Collapsible filters section */}
        {showFilters && (
          <div className="mt-4 p-4 bg-background-secondary/40 backdrop-blur-md rounded-lg border border-background-secondary/30 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              {/* Sort */}
              <div>
                <label className="block text-sm mb-1 text-text-secondary">Sort by</label>
                <select 
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full p-2 rounded-lg bg-background-secondary/80 text-text-primary border border-background-secondary/50 hover:border-accent-primary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
                >
                  {Object.entries(sorts).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              
              {/* Format */}
              <div>
                <label className="block text-sm mb-1 text-text-secondary">Format</label>
                <select 
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full p-2 rounded-lg bg-background-secondary/80 text-text-primary border border-background-secondary/50 hover:border-accent-primary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
                >
                  <option value="">All Formats</option>
                  {Object.entries(formats).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              
              {/* Status */}
              <div>
                <label className="block text-sm mb-1 text-text-secondary">Status</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-2 rounded-lg bg-background-secondary/80 text-text-primary border border-background-secondary/50 hover:border-accent-primary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
                >
                  <option value="">All Statuses</option>
                  {Object.entries(statuses).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              
              {/* Genre */}
              <div>
                <label className="block text-sm mb-1 text-text-secondary">Genre</label>
                <select 
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full p-2 rounded-lg bg-background-secondary/80 text-text-primary border border-background-secondary/50 hover:border-accent-primary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
                >
                  <option value="">All Genres</option>
                  {genres.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              {/* Reset button */}
              <button
                onClick={() => {
                  setSearch('');
                  setSearchInput('');
                  setFormat('');
                  setStatus('');
                  setGenre('');
                  setSort('TRENDING_DESC');
                  loadAnime(true);
                  setShowFilters(false);
                }}
                className="border border-accent-primary/50 text-accent-primary px-4 py-2 rounded-lg hover:bg-accent-primary hover:text-white transition-all duration-300"
              >
                Reset Filters
              </button>
              
              {/* Apply filters button */}
              <button
                onClick={applyFilters}
                className="bg-accent-primary hover:bg-accent-primary/80 text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-600/20 border border-red-600 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {/* Anime grid with improved snap scrolling */}
      <div 
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 snap-y snap-mandatory scroll-pt-6 overflow-y-auto"
        style={{ 
          scrollSnapType: 'y mandatory', 
          scrollPaddingTop: '1.5rem', 
          scrollPaddingBottom: '1.5rem' 
        }}
      >
        {animeList.map((anime, index) => {
          const isLast = index === animeList.length - 1;
          const animeIdStr = anime.id.toString();
          const isInWatchlist = watchlistItems[animeIdStr];
          
          // Calculate the row number (0-based) for snap alignment
          const rowIndex = Math.floor(index / (window.innerWidth >= 1024 ? 5 : window.innerWidth >= 768 ? 4 : window.innerWidth >= 640 ? 3 : 2));
          
          return (
            <div 
              key={`${anime.id}-${index}`}
              ref={isLast ? lastAnimeElementRef : undefined}
              className={`relative bg-background-secondary/80 backdrop-blur-sm rounded-xl overflow-hidden hover:bg-background-tertiary/90 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-accent-primary/20 cursor-pointer ${
                index % (window.innerWidth >= 1024 ? 5 : window.innerWidth >= 768 ? 4 : window.innerWidth >= 640 ? 3 : 2) === 0 ? 'scroll-snap-align-start' : ''
              }`}
              style={{
                scrollSnapAlign: index % (window.innerWidth >= 1024 ? 5 : window.innerWidth >= 768 ? 4 : window.innerWidth >= 640 ? 3 : 2) === 0 ? 'start' : 'none'
              }}
              onClick={() => navigateToAnimeDetails(anime.id)}
            >
              {/* Anime poster */}
              <div className="relative aspect-[2/3] w-full">
                <Image
                  src={anime.coverImage || '/placeholder-poster.jpg'}
                  alt={anime.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Status badge */}
                <div className="absolute top-2 left-2 bg-background-primary/80 backdrop-blur-sm px-2 py-1 rounded text-xs">
                  {anime.format}
                </div>
                
                {/* Episode count badge with darker background */}
                {anime.episodes && (
                    <div className="absolute top-2 right-2 bg-background-primary/90 backdrop-blur-md text-white px-2 py-1 rounded text-xs font-bold shadow-lg">
                    {anime.episodes} episodes
                    </div>
                )}
                
                {/* Currently airing badge */}
                {anime.nextAiring && (
                  <div className="absolute bottom-2 left-2 bg-green-600/80 text-white backdrop-blur-sm px-2 py-1 rounded text-xs">
                    Ep {anime.nextAiring.episode} in {formatTimeUntilAiring(anime.nextAiring.timeUntilAiring)}
                  </div>
                )}
                
                {/* Watchlist button - Moved to bottom right */}
                <button 
                  onClick={(e) => toggleWatchlist(e, anime)}
                  disabled={addingToWatchlist === anime.id}
                  className={`absolute bottom-2 right-2 transition-all duration-300 rounded-full p-2 backdrop-blur-md shadow-md ${
                    addingToWatchlist === anime.id 
                      ? 'bg-background-tertiary/70' 
                      : watchlistFeedback === anime.id 
                      ? 'bg-accent-primary text-background-primary' 
                      : isInWatchlist
                      ? 'bg-accent-primary text-background-primary hover:bg-red-500'
                      : 'bg-background-primary/70 hover:bg-accent-primary text-text-primary hover:text-background-primary'
                  }`}
                  aria-label={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
                  title={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
                >
                  {addingToWatchlist === anime.id ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : watchlistFeedback === anime.id ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                    </svg>
                  )}
                </button>
              </div>
              
              {/* Anime info - improved styling */}
              <div className="p-4 backdrop-blur-sm bg-background-secondary/50">
                <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-accent-primary transition-colors">{anime.title}</h3>
                <div className="flex justify-between items-center mt-2 text-sm text-text-secondary/80 group-hover:text-text-secondary transition-opacity">
                  <span>{anime.year || 'Unknown'}</span>
                  {anime.averageScore && (
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-yellow-400 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {(anime.averageScore / 10).toFixed(1)}
                    </span>
                  )}
                </div>
                {/* Simplified genre display */}
                {anime.genres.length > 0 && (
                  <p className="mt-2 text-xs text-text-secondary truncate">
                    {anime.genres.slice(0, 3).join(' • ')}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center items-center my-8">
          <LoadingSpinner />
        </div>
      )}
      
      {/* End of results message */}
      {!loading && !hasMore && animeList.length > 0 && (
        <p className="text-center text-text-secondary my-8">
          You've reached the end of the results
        </p>
      )}
      
      {/* No results message */}
      {!loading && animeList.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 my-16 text-text-secondary">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg">No anime found matching your criteria</p>
          <button
            onClick={() => {
              setSearch('');
              setSearchInput('');
              setFormat('');
              setStatus('');
              setGenre('');
              setSort('TRENDING_DESC');
              loadAnime(true);
            }}
            className="bg-accent-primary hover:bg-accent-primary/80 text-white px-4 py-2 rounded"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}