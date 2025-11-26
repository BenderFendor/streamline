'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { fetchShows } from '../lib/api';
import { addToWatchlist as addToWatchlistApi } from '../lib/watchlist';
import PageWrapper from '../components/PageWrapper';
import CinematicNav from '../components/CinematicNav';

type Show = {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: string;
  overview?: string;
};

export default function ShowsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [shows, setShows] = useState<Show[]>([]);
  const [mediaType, setMediaType] = useState<'movie' | 'tv'>('movie');
  const [category, setCategory] = useState('popular');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [watchlistFeedback, setWatchlistFeedback] = useState<number | null>(null);
  const [addingToWatchlist, setAddingToWatchlist] = useState<number | null>(null);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const movieGenres = [
    { id: 28, name: 'Action' }, { id: 12, name: 'Adventure' }, { id: 16, name: 'Animation' },
    { id: 35, name: 'Comedy' }, { id: 80, name: 'Crime' }, { id: 99, name: 'Documentary' },
    { id: 18, name: 'Drama' }, { id: 10751, name: 'Family' }, { id: 14, name: 'Fantasy' },
    { id: 36, name: 'History' }, { id: 27, name: 'Horror' }, { id: 10402, name: 'Music' },
    { id: 9648, name: 'Mystery' }, { id: 10749, name: 'Romance' }, { id: 878, name: 'Science Fiction' },
    { id: 53, name: 'Thriller' }, { id: 10752, name: 'War' }, { id: 37, name: 'Western' }
  ];

  const tvGenres = [
    { id: 10759, name: 'Action & Adventure' }, { id: 16, name: 'Animation' }, { id: 35, name: 'Comedy' },
    { id: 80, name: 'Crime' }, { id: 99, name: 'Documentary' }, { id: 18, name: 'Drama' },
    { id: 10751, name: 'Family' }, { id: 10762, name: 'Kids' }, { id: 9648, name: 'Mystery' },
    { id: 10765, name: 'Sci-Fi & Fantasy' }, { id: 10768, name: 'War & Politics' }, { id: 37, name: 'Western' }
  ];
  
  const currentYear = new Date().getFullYear();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Infinite scroll observer
  const observer = useRef<IntersectionObserver | null>(null);
  const lastShowElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
          setPage(prevPage => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore]
  );

  // Load shows
  const loadShows = async () => {
    setIsLoading(true);
    try {
      const data = await fetchShows({ 
        mediaType, 
        category: debouncedQuery ? '' : category, 
        page,
        query: debouncedQuery,
        genre: genreFilter
      });
      
      const resultsWithMediaType = data.results.map(show => ({
        ...show,
        media_type: mediaType
      }));
      
      let filteredResults = resultsWithMediaType;
      if (yearFilter) {
        filteredResults = resultsWithMediaType.filter(show => {
          const year = new Date(show.release_date || show.first_air_date || '').getFullYear().toString();
          return year === yearFilter;
        });
      }
      
      setShows(prevShows => page === 1 ? filteredResults : [...prevShows, ...filteredResults]);
      setHasMore(data.page < data.total_pages && filteredResults.length > 0);
    } catch (error) {
      console.error('Error loading shows:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add to watchlist
  const addToWatchlist = async (e: React.MouseEvent, show: Show) => {
    e.stopPropagation();
    if (addingToWatchlist === show.id) return;
    
    setAddingToWatchlist(show.id);
    try {
      const title = mediaType === 'tv' ? show.name : show.title;
      if (!title) return;
      
      const watchlistItem = {
        id: '',
        title: title,
        mediaType: mediaType, 
        mediaId: show.id.toString(),
        imageUrl: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : undefined,
        year: new Date(show.release_date || show.first_air_date || '').getFullYear().toString(),
        rating: show.vote_average
      };
      
      const result = await addToWatchlistApi(watchlistItem);
      if (result) {
        setWatchlistFeedback(show.id);
        setTimeout(() => setWatchlistFeedback(null), 2000);
      }
    } catch (error) {
      console.error('Error adding to watchlist:', error);
    } finally {
      setAddingToWatchlist(null);
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    setYearFilter('');
    setGenreFilter('');
    setCategory('popular');
  };

  useEffect(() => {
    setPage(1);
    setShows([]);
  }, [mediaType, category, debouncedQuery, yearFilter, genreFilter]);

  useEffect(() => {
    loadShows();
  }, [page, mediaType, category, debouncedQuery, yearFilter, genreFilter]);

  const navigateToShow = (show: Show) => {
    router.push(`/shows/${show.id}?type=${show.media_type || mediaType}`);
  };

  const hasActiveFilters = !!searchQuery || !!yearFilter || !!genreFilter || category !== 'popular';
  const currentGenres = mediaType === 'movie' ? movieGenres : tvGenres;

  return (
    <PageWrapper showFloatingPosters={false}>
      <CinematicNav />
      
      <div className="pt-28 pb-20 px-6 max-w-7xl mx-auto">
        {/* Hero Header */}
        <header className="mb-12 fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs tracking-wider uppercase text-red-500 font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" /> 
            {mediaType === 'movie' ? 'Movies' : 'TV Shows'}
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter leading-tight mb-4">
            Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-600">
              {mediaType === 'movie' ? 'Movies' : 'TV Shows'}
            </span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl">
            Explore our curated collection of {mediaType === 'movie' ? 'films' : 'series'}. From blockbusters to hidden gems.
          </p>
        </header>

        {/* Controls Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Media Type Toggle */}
          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-xl p-1 border border-white/10">
            <button
              onClick={() => setMediaType('movie')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                mediaType === 'movie' 
                  ? 'bg-red-600 text-white shadow-lg shadow-red-900/30' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Movies
            </button>
            <button
              onClick={() => setMediaType('tv')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                mediaType === 'tv' 
                  ? 'bg-red-600 text-white shadow-lg shadow-red-900/30' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              TV Shows
            </button>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {['popular', 'top_rated', mediaType === 'movie' ? 'now_playing' : 'on_the_air', 'upcoming'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  category === cat 
                    ? 'bg-white/10 text-white border border-white/20' 
                    : 'text-gray-500 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {cat.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </button>
            ))}
          </div>

          {/* Search & Filters */}
          <div className="flex items-center gap-3 ml-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-64 bg-white/5 backdrop-blur-sm text-white px-4 py-2.5 pl-10 rounded-xl border border-white/10 focus:border-red-500/50 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Genre</label>
                <select
                  value={genreFilter}
                  onChange={(e) => setGenreFilter(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-red-500/50"
                >
                  <option value="">All Genres</option>
                  {currentGenres.map((genre) => (
                    <option key={genre.id} value={genre.id.toString()}>{genre.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Year</label>
                <input
                  type="number"
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  placeholder="Any year"
                  min="1900"
                  max={currentYear}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-red-500/50"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={resetFilters}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {searchQuery && (
              <span className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-400 rounded-full text-sm">
                Search: {searchQuery}
                <button onClick={() => setSearchQuery('')} className="hover:text-red-300">×</button>
              </span>
            )}
            {genreFilter && (
              <span className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-400 rounded-full text-sm">
                {currentGenres.find(g => g.id.toString() === genreFilter)?.name}
                <button onClick={() => setGenreFilter('')} className="hover:text-red-300">×</button>
              </span>
            )}
            {yearFilter && (
              <span className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-400 rounded-full text-sm">
                Year: {yearFilter}
                <button onClick={() => setYearFilter('')} className="hover:text-red-300">×</button>
              </span>
            )}
            <button
              onClick={resetFilters}
              className="px-3 py-1.5 text-gray-500 hover:text-white text-sm transition-colors"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Shows Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {shows.map((show, index) => (
            <div
              key={`${show.id}-${index}`}
              ref={index === shows.length - 1 ? lastShowElementRef : undefined}
              onClick={() => navigateToShow(show)}
              className="group relative cursor-pointer rounded-xl overflow-hidden border border-white/10 bg-[#0f0f0f] shadow-lg hover:shadow-2xl hover:shadow-red-900/10 transition-all duration-300 hover:-translate-y-1 interactive"
            >
              {/* Poster */}
              <div className="relative aspect-[2/3] overflow-hidden">
                {show.poster_path ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
                    alt={show.title || show.name || 'Show poster'}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                    </svg>
                  </div>
                )}
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Rating badge */}
                <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {show.vote_average.toFixed(1)}
                </div>
                
                {/* Watchlist button */}
                <button
                  onClick={(e) => addToWatchlist(e, show)}
                  disabled={addingToWatchlist === show.id}
                  className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-md transition-all duration-300 ${
                    addingToWatchlist === show.id
                      ? 'bg-gray-600/80'
                      : watchlistFeedback === show.id
                      ? 'bg-green-500 text-white'
                      : 'bg-black/60 hover:bg-red-600 text-white'
                  }`}
                >
                  {addingToWatchlist === show.id ? (
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : watchlistFeedback === show.id ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                    </svg>
                  )}
                </button>
                
                {/* Hover info */}
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-xs text-gray-300 line-clamp-2">{show.overview || 'No description available.'}</p>
                </div>
              </div>
              
              {/* Info */}
              <div className="p-3">
                <h3 className="font-semibold text-sm truncate group-hover:text-red-400 transition-colors">
                  {mediaType === 'tv' ? show.name : show.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(show.release_date || show.first_air_date || '').getFullYear() || 'N/A'}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* No results */}
        {!isLoading && shows.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 mb-6 rounded-full bg-white/5 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">No {mediaType === 'tv' ? 'TV Shows' : 'Movies'} Found</h3>
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