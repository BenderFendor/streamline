'use client';

import React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { fetchShows } from '../lib/api';
import { addToWatchlist as addToWatchlistApi } from '../lib/watchlist';
import LoadingSpinner from '../components/LoadingSpinner';

// Define the Show type for type safety and better code documentation
type Show = {
  id: number;
  title?: string;        // For movies
  name?: string;         // For TV shows
  poster_path: string;
  vote_average: number;
  release_date?: string;  // Optional for movies
  first_air_date?: string; // Optional for TV shows
  media_type?: string;    // For correctly identifying the media type
};

// ShowsPage: A responsive grid layout for displaying movies and TV shows with infinite scrolling
export default function ShowsPage() {
  // Initialize router for navigation between pages
  const router = useRouter();
  
  // State management for UI elements and data
  const [isLoading, setIsLoading] = useState(false);
  const [shows, setShows] = useState<Show[]>([]);
  const [mediaType, setMediaType] = useState<'movie' | 'tv'>('movie');
  const [category, setCategory] = useState('popular');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [watchlistFeedback, setWatchlistFeedback] = useState<number | null>(null);
  const [addingToWatchlist, setAddingToWatchlist] = useState<number | null>(null);
  const [navMenuOpen, setNavMenuOpen] = useState(false);
  
  // Search and additional filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [yearFilter, setYearFilter] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // Available genres for movies and TV shows
  const movieGenres = [
    { id: 28, name: 'Action' },
    { id: 12, name: 'Adventure' },
    { id: 16, name: 'Animation' },
    { id: 35, name: 'Comedy' },
    { id: 80, name: 'Crime' },
    { id: 99, name: 'Documentary' },
    { id: 18, name: 'Drama' },
    { id: 10751, name: 'Family' },
    { id: 14, name: 'Fantasy' },
    { id: 36, name: 'History' },
    { id: 27, name: 'Horror' },
    { id: 10402, name: 'Music' },
    { id: 9648, name: 'Mystery' },
    { id: 10749, name: 'Romance' },
    { id: 878, name: 'Science Fiction' },
    { id: 10770, name: 'TV Movie' },
    { id: 53, name: 'Thriller' },
    { id: 10752, name: 'War' },
    { id: 37, name: 'Western' }
  ];

  const tvGenres = [
    { id: 10759, name: 'Action & Adventure' },
    { id: 16, name: 'Animation' },
    { id: 35, name: 'Comedy' },
    { id: 80, name: 'Crime' },
    { id: 99, name: 'Documentary' },
    { id: 18, name: 'Drama' },
    { id: 10751, name: 'Family' },
    { id: 10762, name: 'Kids' },
    { id: 9648, name: 'Mystery' },
    { id: 10763, name: 'News' },
    { id: 10764, name: 'Reality' },
    { id: 10765, name: 'Sci-Fi & Fantasy' },
    { id: 10766, name: 'Soap' },
    { id: 10767, name: 'Talk' },
    { id: 10768, name: 'War & Politics' },
    { id: 37, name: 'Western' }
  ];
  
  // Get current year for the year dropdown
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 80 }, (_, i) => currentYear - i);

  // Handle clicks outside menus to close them
  const navMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navMenuRef.current && !navMenuRef.current.contains(event.target as Node)) {
        setNavMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce search query to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Intersection Observer setup for infinite scrolling
  const observer = useRef<IntersectionObserver>();
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

  // Function to load shows data from the API
  const loadShows = async () => {
    setIsLoading(true);
    try {
      // Fetch shows based on current filters and page number
      const data = await fetchShows({ 
        mediaType, 
        category: debouncedQuery ? '' : category, 
        page,
        query: debouncedQuery,
        genre: genreFilter
      });
      
      // Process results
      const resultsWithMediaType = data.results.map(show => ({
        ...show,
        media_type: mediaType // Ensure each show has the correct media type
      }));
      
      // Filter results by year if year filter is applied
      let filteredResults = resultsWithMediaType;
      if (yearFilter) {
        filteredResults = resultsWithMediaType.filter(show => {
          const year = new Date(show.release_date || show.first_air_date || '').getFullYear().toString();
          return year === yearFilter;
        });
      }
      
      setShows(prevShows => {
        return page === 1 ? filteredResults : [...prevShows, ...filteredResults];
      });
      
      // Update hasMore flag based on available pages and results
      setHasMore(
        data.page < data.total_pages && 
        filteredResults.length > 0 && 
        (!yearFilter || filteredResults.length === data.results.length)
      );
    } catch (error) {
      console.error('Error loading shows:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to add a show to the watchlist
  const addToWatchlist = async (e: React.MouseEvent, show: Show) => {
    e.stopPropagation();
    if (addingToWatchlist === show.id) return;
    
    setAddingToWatchlist(show.id);
    try {
      const watchlistItem = {
        id: '',
        title: mediaType === 'tv' ? show.name : show.title,
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

  // Reset filters function
  const resetFilters = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    setYearFilter('');
    setGenreFilter('');
    setCategory('popular');
    setIsSearching(false);
  };

  // Reset page and clear shows when filters change
  useEffect(() => {
    setPage(1);
    setShows([]);
  }, [mediaType, category, debouncedQuery, yearFilter, genreFilter]);

  // Load shows when page, mediaType, category, search or filters change
  useEffect(() => {
    loadShows();
  }, [page, mediaType, category, debouncedQuery, yearFilter, genreFilter]);

  // Handle navigation to show details
  const navigateToShow = (show: Show) => {
    router.push(`/shows/${show.id}?type=${show.media_type || mediaType}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Compact navigation and search bar */}
      <div className="mb-4 flex flex-wrap justify-between items-center bg-background-secondary/50 backdrop-blur-md p-2 rounded-xl shadow-md">
        {/* Main navigation buttons */}
        <div className="flex items-center gap-2">
          <button onClick={() => router.push('/')} className="px-3 py-2 rounded-lg hover:bg-background-tertiary/50 transition-colors flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span>Home</span>
          </button>
          <button onClick={() => router.push('/shows')} className="px-3 py-2 rounded-lg bg-accent-primary/20 text-accent-primary transition-colors flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2h6v4H7V5zm8 8v2h1v-2h-1zm-2-2H7v4h6v-4zm2 0h1V9h-1v2zm1-4V5h-1v2h1zM5 5v2H4V5h1zm0 4H4v2h1V9zm-1 4h1v2H4v-2z" clipRule="evenodd" />
            </svg>
            <span>Shows</span>
          </button>
          <button onClick={() => router.push('/anime')} className="px-3 py-2 rounded-lg hover:bg-background-tertiary/50 transition-colors flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
            </svg>
            <span>Anime</span>
          </button>
          <button onClick={() => router.push('/watchlist')} className="px-3 py-2 rounded-lg hover:bg-background-tertiary/50 transition-colors flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
            <span>Watchlist</span>
          </button>
          
          {/* Media type toggle */}
          <div className="flex rounded-lg overflow-hidden border border-background-tertiary/30">
            <button
              onClick={() => setMediaType('movie')}
              className={`px-3 py-2 text-sm ${mediaType === 'movie' ? 'bg-accent-primary/20 text-accent-primary' : 'hover:bg-background-tertiary/20'}`}
            >
              Movies
            </button>
            <button
              onClick={() => setMediaType('tv')}
              className={`px-3 py-2 text-sm ${mediaType === 'tv' ? 'bg-accent-primary/20 text-accent-primary' : 'hover:bg-background-tertiary/20'}`}
            >
              TV Shows
            </button>
          </div>
        </div>
        
        {/* Search input */}
        <div className="flex items-center gap-2">
          <div className="flex-grow max-w-md relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full bg-background-secondary/90 text-text-primary px-4 py-2 rounded-lg border border-background-secondary/50 focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 focus:outline-none pl-9 text-sm"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary/70" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1 ${
              filtersOpen ? 'bg-accent-primary/20 text-accent-primary' : 'hover:bg-background-tertiary/50'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
            </svg>
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>
      </div>
      
      {/* Expandable filters section */}
      {filtersOpen && (
        <div className="mb-4 p-3 bg-background-secondary/30 rounded-lg backdrop-blur-sm border border-background-tertiary/20 flex flex-wrap gap-2">
          {/* Category selector - only show when not searching */}
          {!isSearching && (
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-background-secondary/90 text-text-primary px-3 py-1.5 rounded-lg border border-background-secondary/50 text-sm"
            >
              <option value="popular">Popular</option>
              <option value="top_rated">Top Rated</option>
              <option value="upcoming">Upcoming</option>
              {mediaType === 'tv' && <option value="on_the_air">On Air</option>}
              {mediaType === 'movie' && <option value="now_playing">Now Playing</option>}
            </select>
          )}
          
          {/* Genre filter */}
          <select
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
            className="bg-background-secondary/90 text-text-primary px-3 py-1.5 rounded-lg border border-background-secondary/50 text-sm"
          >
            <option value="">All Genres</option>
            {(mediaType === 'movie' ? movieGenres : tvGenres).map((genre) => (
              <option key={genre.id} value={genre.id.toString()}>{genre.name}</option>
            ))}
          </select>
          
          {/* Year filter */}
          <div className="relative">
            <input
              type="number"
              value={yearFilter}
              onChange={(e) => {
                const value = e.target.value;
                if (!value || (parseInt(value) >= 1900 && parseInt(value) <= currentYear)) {
                  setYearFilter(value);
                }
              }}
              placeholder="Year"
              min="1900"
              max={currentYear}
              className="w-32 bg-background-secondary/90 text-text-primary px-3 py-1.5 rounded-lg border border-background-secondary/50 text-sm"
            />
            <div className="absolute top-full mt-1 w-32 max-h-48 overflow-y-auto bg-background-secondary rounded-lg border border-background-tertiary/50 shadow-lg scrollbar-thin scrollbar-thumb-accent-primary/20 scrollbar-track-background-tertiary/20">
              {years.map((year) => (
                <button
                  key={year}
                  onClick={() => setYearFilter(year.toString())}
                  className={`w-full text-left px-3 py-1.5 text-sm hover:bg-background-tertiary/50 ${
                    yearFilter === year.toString() ? 'bg-accent-primary/20 text-accent-primary' : ''
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
          
          {/* Reset filters button - Only show when filters are applied */}
          {(!!searchQuery || !!yearFilter || !!genreFilter || category !== 'popular') && (
            <button
              onClick={resetFilters}
              className="bg-background-tertiary/50 px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Reset
            </button>
          )}
        </div>
      )}
      
      {/* Show grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-6">
        {shows.map((show, index) => (
          <div
            key={`${show.id}-${index}`}
            ref={index === shows.length - 1 ? lastShowElementRef : undefined}
            onClick={() => navigateToShow(show)}
            className="group bg-background-secondary/80 rounded-lg overflow-hidden hover:bg-background-tertiary/90 hover:scale-[1.02] hover:shadow-lg transition-all cursor-pointer relative"
          >
            {/* Show poster */}
            {show.poster_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
                alt={mediaType === 'tv' ? show.name : show.title}
                className="w-full aspect-[2/3] object-cover group-hover:scale-105 transition-transform"
                loading="lazy"
              />
            ) : (
              <div className="w-full aspect-[2/3] bg-gradient-to-br from-background-tertiary to-background-secondary flex items-center justify-center text-text-secondary/80">
                No Image
              </div>
            )}
            
            {/* Watchlist button */}
            <button 
              onClick={(e) => addToWatchlist(e, show)}
              disabled={addingToWatchlist === show.id}
              className={`absolute top-2 right-2 ${
                addingToWatchlist === show.id ? 'bg-background-tertiary/70' : 
                watchlistFeedback === show.id ? 'bg-accent-primary' : 
                'bg-background-primary/70 hover:bg-accent-primary'
              } rounded-full p-1.5 backdrop-blur-sm z-10 text-text-primary`}
            >
              {addingToWatchlist === show.id ? (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
            
            {/* Show details */}
            <div className="p-3 bg-background-secondary/50">
              <h3 className="text-text-primary font-medium truncate text-sm group-hover:text-accent-primary">
                {mediaType === 'tv' ? show.name : show.title}
              </h3>
              <div className="flex justify-between items-center mt-1 text-xs text-text-secondary/80">
                <span>{new Date(show.release_date || show.first_air_date || '').getFullYear() || 'N/A'}</span>
                <span>★ {show.vote_average.toFixed(1)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* No results message */}
      {!isLoading && shows.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 my-16 text-text-secondary">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg">No {mediaType === 'tv' ? 'TV shows' : 'movies'} found</p>
          <button
            onClick={resetFilters}
            className="bg-accent-primary/20 text-accent-primary px-4 py-2 rounded-full hover:bg-accent-primary/30"
          >
            Reset Filters
          </button>
        </div>
      )}
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center my-8">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
}