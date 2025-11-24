'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { fetchAnime, getAnimeFilters } from '../lib/api';
import { addToWatchlist as addToWatchlistApi, removeFromWatchlist, getWatchlist } from '../lib/watchlist';
import PageWrapper from '../components/PageWrapper';
import CinematicNav from '../components/CinematicNav';

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

type FilterValues = {
  sort: string;
  format: string;
  status: string;
  genre: string;
  search: string;
};

export default function AnimePage() {
  const router = useRouter();
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [addingToWatchlist, setAddingToWatchlist] = useState<number | null>(null);
  const [watchlistItems, setWatchlistItems] = useState<Record<string, string>>({});
  const [watchlistFeedback, setWatchlistFeedback] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filterValues, setFilterValues] = useState<FilterValues>({
    sort: 'TRENDING_DESC',
    format: '',
    status: '',
    genre: '',
    search: ''
  });
  
  const { formats, statuses, sorts, genres } = getAnimeFilters();
  
  // Infinite scroll observer
  const observer = useRef<IntersectionObserver | null>(null);
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
      const currentPage = reset ? 1 : page;
      if (reset) setPage(1);
      
      const data = await fetchAnime({
        sort: filterValues.sort,
        format: filterValues.format || undefined,
        status: filterValues.status || undefined,
        search: filterValues.search || undefined,
        genre: filterValues.genre || undefined,
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
  }, [page, filterValues]);

  // Load watchlist
  const loadWatchlist = useCallback(async () => {
    try {
      const watchlist = await getWatchlist();
      const watchlistMap: Record<string, string> = {};
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

  useEffect(() => {
    loadAnime();
    loadWatchlist();
  }, []);

  useEffect(() => {
    if (page > 1) loadAnime();
  }, [page]);

  const handleFilterChange = (key: keyof FilterValues, value: string) => {
    setFilterValues(prev => ({ ...prev, [key]: value }));
  };
  
  const applyFilters = () => {
    loadAnime(true);
    setShowFilters(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilterValues(prev => ({ ...prev, search: searchInput }));
    loadAnime(true);
  };
  
  const clearSearch = () => {
    setFilterValues(prev => ({ ...prev, search: '' }));
    setSearchInput('');
    loadAnime(true);
  };

  const resetFilters = () => {
    setFilterValues({
      sort: 'TRENDING_DESC',
      format: '',
      status: '',
      genre: '',
      search: ''
    });
    setSearchInput('');
    loadAnime(true);
  };

  // Toggle watchlist
  const toggleWatchlist = async (e: React.MouseEvent, anime: Anime) => {
    e.stopPropagation();
    if (addingToWatchlist === anime.id) return;
    
    setAddingToWatchlist(anime.id);
    
    try {
      const animeIdStr = anime.id.toString();
      const isInWatchlist = watchlistItems[animeIdStr];
      
      if (isInWatchlist) {
        const success = await removeFromWatchlist(isInWatchlist);
        if (success) {
          setWatchlistItems(prev => {
            const updated = { ...prev };
            delete updated[animeIdStr];
            return updated;
          });
          setWatchlistFeedback(anime.id);
          setTimeout(() => setWatchlistFeedback(null), 2000);
        }
      } else {
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
          setWatchlistItems(prev => ({ ...prev, [animeIdStr]: result.id }));
          setWatchlistFeedback(anime.id);
          setTimeout(() => setWatchlistFeedback(null), 2000);
        }
      }
    } catch (error) {
      console.error('Error updating watchlist:', error);
    } finally {
      setAddingToWatchlist(null);
    }
  };

  const formatTimeUntilAiring = (seconds: number) => {
    if (!seconds) return '';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const hasActiveFilters = filterValues.sort !== 'TRENDING_DESC' || filterValues.format || filterValues.status || filterValues.genre || filterValues.search;

  return (
    <PageWrapper showFloatingPosters={false}>
      <CinematicNav />
      
      <div className="pt-28 pb-20 px-6 max-w-7xl mx-auto">
        {/* Hero Header */}
        <header className="mb-12 fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs tracking-wider uppercase text-red-500 font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" /> Anime Collection
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter leading-tight mb-4">
            Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-600">Anime</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl">
            Explore trending anime, discover new favorites, and track your journey through the world of animation.
          </p>
        </header>

        {/* Controls Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Sort Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {Object.entries(sorts).slice(0, 4).map(([key, label]) => (
              <button
                key={key}
                onClick={() => { handleFilterChange('sort', key); loadAnime(true); }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  filterValues.sort === key 
                    ? 'bg-red-600 text-white shadow-lg shadow-red-900/30' 
                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Search & Filters */}
          <div className="flex items-center gap-3 ml-auto">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search anime..."
                className="w-64 bg-white/5 backdrop-blur-sm text-white px-4 py-2.5 pl-10 rounded-xl border border-white/10 focus:border-red-500/50 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </form>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-300 ${
                showFilters || hasActiveFilters
                  ? 'bg-red-600/20 border-red-500/50 text-red-400'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
              {hasActiveFilters && <span className="w-2 h-2 bg-red-500 rounded-full" />}
            </button>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mb-8 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 fade-up">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Format</label>
                <select
                  value={filterValues.format}
                  onChange={(e) => handleFilterChange('format', e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-red-500/50"
                >
                  <option value="">All Formats</option>
                  {Object.entries(formats).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
                <select
                  value={filterValues.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-red-500/50"
                >
                  <option value="">All Status</option>
                  {Object.entries(statuses).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Genre</label>
                <select
                  value={filterValues.genre}
                  onChange={(e) => handleFilterChange('genre', e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-red-500/50"
                >
                  <option value="">All Genres</option>
                  {genres.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end gap-2">
                <button
                  onClick={applyFilters}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-colors"
                >
                  Apply
                </button>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {filterValues.search && (
              <span className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-400 rounded-full text-sm">
                Search: {filterValues.search}
                <button onClick={clearSearch} className="hover:text-red-300">×</button>
              </span>
            )}
            {filterValues.format && (
              <span className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-400 rounded-full text-sm">
                {formats[filterValues.format as keyof typeof formats]}
                <button onClick={() => { handleFilterChange('format', ''); loadAnime(true); }} className="hover:text-red-300">×</button>
              </span>
            )}
            {filterValues.status && (
              <span className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-400 rounded-full text-sm">
                {statuses[filterValues.status as keyof typeof statuses]}
                <button onClick={() => { handleFilterChange('status', ''); loadAnime(true); }} className="hover:text-red-300">×</button>
              </span>
            )}
            {filterValues.genre && (
              <span className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-400 rounded-full text-sm">
                {filterValues.genre}
                <button onClick={() => { handleFilterChange('genre', ''); loadAnime(true); }} className="hover:text-red-300">×</button>
              </span>
            )}
            <button onClick={resetFilters} className="px-3 py-1.5 text-gray-500 hover:text-white text-sm transition-colors">
              Clear all
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-600/20 border border-red-600/50 text-red-400 p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Anime Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {animeList.map((anime, index) => {
            const isLast = index === animeList.length - 1;
            const animeIdStr = anime.id.toString();
            const isInWatchlist = watchlistItems[animeIdStr];
            
            return (
              <div
                key={`${anime.id}-${index}`}
                ref={isLast ? lastAnimeElementRef : undefined}
                onClick={() => router.push(`/anime/${anime.id}`)}
                className="group relative cursor-pointer rounded-xl overflow-hidden border border-white/10 bg-[#0f0f0f] shadow-lg hover:shadow-2xl hover:shadow-red-900/10 transition-all duration-300 hover:-translate-y-1 interactive"
              >
                {/* Poster */}
                <div className="relative aspect-[2/3]">
                  <Image
                    src={anime.coverImage || '/placeholder-poster.jpg'}
                    alt={anime.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Format badge */}
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium">
                    {anime.format}
                  </div>
                  
                  {/* Episode count */}
                  {anime.episodes && (
                    <div className="absolute top-2 right-12 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md text-xs">
                      {anime.episodes} eps
                    </div>
                  )}
                  
                  {/* Airing badge */}
                  {anime.nextAiring && (
                    <div className="absolute bottom-12 left-2 bg-green-600/80 backdrop-blur-sm px-2 py-1 rounded-md text-xs">
                      Ep {anime.nextAiring.episode} in {formatTimeUntilAiring(anime.nextAiring.timeUntilAiring)}
                    </div>
                  )}
                  
                  {/* Watchlist button */}
                  <button
                    onClick={(e) => toggleWatchlist(e, anime)}
                    disabled={addingToWatchlist === anime.id}
                    className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-md transition-all duration-300 ${
                      addingToWatchlist === anime.id
                        ? 'bg-gray-600/80'
                        : watchlistFeedback === anime.id
                        ? 'bg-green-500 text-white'
                        : isInWatchlist
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-black/60 hover:bg-red-600 text-white'
                    }`}
                  >
                    {addingToWatchlist === anime.id ? (
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : watchlistFeedback === anime.id ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                      </svg>
                    )}
                  </button>
                </div>
                
                {/* Info */}
                <div className="p-3">
                  <h3 className="font-semibold text-sm truncate group-hover:text-red-400 transition-colors">
                    {anime.title}
                  </h3>
                  <div className="flex justify-between items-center mt-1.5 text-xs text-gray-500">
                    <span>{anime.year || 'Unknown'}</span>
                    {anime.averageScore && (
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {(anime.averageScore / 10).toFixed(1)}
                      </span>
                    )}
                  </div>
                  {anime.genres.length > 0 && (
                    <p className="mt-1.5 text-xs text-gray-600 truncate">
                      {anime.genres.slice(0, 2).join(' • ')}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* End of results */}
        {!loading && !hasMore && animeList.length > 0 && (
          <p className="text-center text-gray-500 py-8">You've reached the end of the results</p>
        )}

        {/* No results */}
        {!loading && animeList.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 mb-6 rounded-full bg-white/5 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">No Anime Found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your filters or search terms</p>
            <button
              onClick={resetFilters}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}