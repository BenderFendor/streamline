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

// Define types for filter values
type SortOption = 'TRENDING_DESC' | 'POPULARITY_DESC' | 'SCORE_DESC' | 'START_DATE_DESC' | 'EPISODES_DESC' | 'FAVOURITES_DESC';
type FormatOption = 'TV' | 'MOVIE' | 'OVA' | 'ONA' | 'SPECIAL' | 'MUSIC' | '';
type StatusOption = 'FINISHED' | 'RELEASING' | 'NOT_YET_RELEASED' | 'CANCELLED' | 'HIATUS' | '';

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
  
  // Filters state with proper types
  const [sort, setSort] = useState<SortOption>('TRENDING_DESC');
  const [format, setFormat] = useState<FormatOption>('');
  const [status, setStatus] = useState<StatusOption>('');
  const [genre, setGenre] = useState('');
  
  // Get filter options
  const { formats, statuses, sorts, genres } = getAnimeFilters();
  
  // Observer for infinite scrolling
  const observer = useRef<IntersectionObserver | undefined>(undefined);
  const lastAnimeElementRef = useCallback((node: HTMLElement | null) => {
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
      {/* Main navigation bar */}
      <div className="mb-6 flex justify-between items-center bg-background-secondary/50 backdrop-blur-md p-3 rounded-xl shadow-md">
        <div className="flex items-center gap-1.5 sm:gap-3">
          <button
            onClick={() => router.push('/')}
            className="px-2 sm:px-3 py-1.5 rounded-lg hover:bg-background-tertiary/50 transition-colors flex items-center gap-1.5"
            aria-label="Home"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span className="hidden sm:inline">Home</span>
          </button>
          <button
            onClick={() => router.push('/shows')}
            className="px-2 sm:px-3 py-1.5 rounded-lg hover:bg-background-tertiary/50 transition-colors flex items-center gap-1.5"
            aria-label="Shows"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2h6v4H7V5zm8 8v2h1v-2h-1zm-2-2H7v4h6v-4zm2 0h1V9h-1v2zm1-4V5h-1v2h1zM5 5v2H4V5h1zm0 4H4v2h1V9zm-1 4h1v2H4v-2z" clipRule="evenodd" />
            </svg>
            <span className="hidden sm:inline">Shows</span>
          </button>
          <button
            onClick={() => router.push('/anime')}
            className="px-2 sm:px-3 py-1.5 rounded-lg bg-accent-primary/20 text-accent-primary font-medium transition-colors flex items-center gap-1.5"
            aria-label="Anime"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
            </svg>
            <span className="hidden sm:inline">Anime</span>
          </button>
          <button
            onClick={() => router.push('/watchlist')}
            className="px-2 sm:px-3 py-1.5 rounded-lg hover:bg-background-tertiary/50 transition-colors flex items-center gap-1.5"
            aria-label="Watchlist"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
            <span className="hidden sm:inline">Watchlist</span>
          </button>
        </div>
        <div className="flex items-center gap-4">
          {/* Search bar */}
          <form onSubmit={handleSearch} className="relative hidden sm:block">
            <input
              type="text"
              placeholder="Search anime..."
              className="w-60 p-2 pl-10 rounded-lg bg-background-secondary/90 text-text-primary border border-background-secondary/50 hover:border-accent-primary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
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
          </form>

          {/* Filter toggle and dropdown */}
          <div className="relative">
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

            {/* Filter dropdown */}
            {showFilters && (
              <div className="absolute right-0 mt-2 w-72 bg-background-secondary/95 backdrop-blur-sm rounded-xl shadow-lg p-4 z-50">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Sort By</label>
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value as SortOption)}
                      className="w-full bg-background-tertiary/50 rounded-lg p-2 text-text-primary"
                    >
                      {Object.entries(sorts).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Format</label>
                    <select
                      value={format}
                      onChange={(e) => setFormat(e.target.value as FormatOption)}
                      className="w-full bg-background-tertiary/50 rounded-lg p-2 text-text-primary"
                    >
                      <option value="">All Formats</option>
                      {Object.entries(formats).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as StatusOption)}
                      className="w-full bg-background-tertiary/50 rounded-lg p-2 text-text-primary"
                    >
                      <option value="">All Status</option>
                      {Object.entries(statuses).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Genre</label>
                    <select
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      className="w-full bg-background-tertiary/50 rounded-lg p-2 text-text-primary"
                    >
                      <option value="">All Genres</option>
                      {genres.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  
                  <button
                    onClick={applyFilters}
                    className="w-full bg-accent-primary hover:bg-accent-primary/90 text-text-primary py-2 rounded-lg transition-colors"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile search bar */}
      <div className="sm:hidden mb-4">
        <form onSubmit={handleSearch} className="relative">
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
        </form>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-600/20 border border-red-600 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {/* Active filter chips */}
      {!loading && animeList.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {/* Sort filter chip */}
          {sort && sorts[sort] && (
            <div className="flex items-center bg-accent-primary/10 text-accent-primary px-3 py-1.5 rounded-full text-sm">
              <span>{sorts[sort]}</span>
              <button
                onClick={() => {
                  setSort('TRENDING_DESC');
                  loadAnime(true);
                }}
                className="ml-2 hover:text-accent-primary/80"
                aria-label="Clear sort filter"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}

          {/* Format filter chip */}
          {format && formats[format] && (
            <div className="flex items-center bg-accent-primary/10 text-accent-primary px-3 py-1.5 rounded-full text-sm">
              <span>{formats[format]}</span>
              <button
                onClick={() => {
                  setFormat('');
                  loadAnime(true);
                }}
                className="ml-2 hover:text-accent-primary/80"
                aria-label="Clear format filter"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}

          {/* Status filter chip */}
          {status && statuses[status] && (
            <div className="flex items-center bg-accent-primary/10 text-accent-primary px-3 py-1.5 rounded-full text-sm">
              <span>{statuses[status]}</span>
              <button
                onClick={() => {
                  setStatus('');
                  loadAnime(true);
                }}
                className="ml-2 hover:text-accent-primary/80"
                aria-label="Clear status filter"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}

          {/* Genre filter chip */}
          {genre && (
            <div className="flex items-center bg-accent-primary/10 text-accent-primary px-3 py-1.5 rounded-full text-sm">
              <span>{genre}</span>
              <button
                onClick={() => {
                  setGenre('');
                  loadAnime(true);
                }}
                className="ml-2 hover:text-accent-primary/80"
                aria-label="Clear genre filter"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}

          {/* Search filter chip */}
          {search && (
            <div className="flex items-center bg-accent-primary/10 text-accent-primary px-3 py-1.5 rounded-full text-sm">
              <span>Search: {search}</span>
              <button
                onClick={() => {
                  setSearch('');
                  setSearchInput('');
                  loadAnime(true);
                }}
                className="ml-2 hover:text-accent-primary/80"
                aria-label="Clear search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}

          {/* Clear all filters button */}
          {(sort !== 'TRENDING_DESC' || format || status || genre || search) && (
            <button
              onClick={() => {
                setSort('TRENDING_DESC');
                setFormat('');
                setStatus('');
                setGenre('');
                setSearch('');
                setSearchInput('');
                loadAnime(true);
              }}
              className="flex items-center gap-1 bg-red-500/10 text-red-500 px-3 py-1.5 rounded-full text-sm hover:bg-red-500/20 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Clear all filters
            </button>
          )}
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