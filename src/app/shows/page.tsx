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
};

// ShowsPage: A responsive grid layout for displaying movies and TV shows with infinite scrolling
// Features:
// - Media type toggle between movies and TV shows
// - Category filtering (popular, top rated, upcoming)
// - Infinite scroll with intersection observer
// - Snap scrolling for smooth navigation between rows
// - Responsive grid layout with different breakpoints
// - Loading states and error handling

export default function ShowsPage() {
  // Initialize router for navigation between pages
  const router = useRouter();
  
  // State management for loading, shows data, and filtering options
  const [isLoading, setIsLoading] = useState(false);
  const [shows, setShows] = useState<Show[]>([]);
  const [mediaType, setMediaType] = useState<'movie' | 'tv'>('movie');
  const [category, setCategory] = useState('popular');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [watchlistFeedback, setWatchlistFeedback] = useState<number | null>(null);
  const [addingToWatchlist, setAddingToWatchlist] = useState<number | null>(null);

  // Intersection Observer setup for infinite scrolling
  const observer = useRef<IntersectionObserver>();
  const lastShowElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      // Skip if currently loading or no node provided
      if (isLoading) return;
      // Disconnect previous observer if it exists
      if (observer.current) observer.current.disconnect();
      // Create new observer to watch for intersection with viewport
      observer.current = new IntersectionObserver(entries => {
        // Load more content when last item becomes visible and more content is available
        if (entries[0].isIntersecting && hasMore) {
          setPage(prevPage => prevPage + 1);
        }
      });
      // Start observing the node if it exists
      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore]
  );

  // Function to load shows data from the API
  const loadShows = async () => {
    setIsLoading(true);
    try {
      // Fetch shows based on current filters and page number
      const data = await fetchShows({ mediaType, category, page });
      setShows(prevShows => {
        // Replace shows on first page, append on subsequent pages
        return page === 1 ? data.results : [...prevShows, ...data.results];
      });
      // Update hasMore flag based on available pages
      setHasMore(data.page < data.total_pages);
    } catch (error) {
      console.error('Error loading shows:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to add a show to the watchlist
  const addToWatchlist = async (e: React.MouseEvent, show: Show) => {
    // Prevent navigation to show details page
    e.stopPropagation();
    
    // Prevent multiple clicks
    if (addingToWatchlist === show.id) {
      return;
    }
    
    setAddingToWatchlist(show.id);
    
    try {
      // Create watchlist item from the show data
      const watchlistItem = {
        id: '', // Will be generated by the backend
        title: mediaType === 'tv' ? show.name : show.title,
        mediaType: mediaType, // Using the current mediaType state
        mediaId: show.id.toString(),
        imageUrl: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : undefined,
        year: new Date(show.release_date || show.first_air_date || '').getFullYear().toString(),
        rating: show.vote_average
      };
      
      // Add to watchlist via the API
      const result = await addToWatchlistApi(watchlistItem);
      
      if (result) {
        console.log(`Added ${mediaType === 'tv' ? show.name : show.title} to watchlist`);
        // Show feedback and clear after 2 seconds
        setWatchlistFeedback(show.id);
        setTimeout(() => {
          setWatchlistFeedback(null);
        }, 2000);
      } else {
        console.error(`Failed to add ${mediaType === 'tv' ? show.name : show.title} to watchlist`);
      }
    } catch (error) {
      console.error('Error adding to watchlist:', error);
    } finally {
      setAddingToWatchlist(null);
    }
  };

  // Reset page and clear shows when filters change
  useEffect(() => {
    setPage(1);
    setShows([]);
  }, [mediaType, category]);

  // Load shows when page, mediaType, or category changes
  useEffect(() => {
    loadShows();
  }, [page, mediaType, category]);

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
            className="px-2 sm:px-3 py-1.5 rounded-lg bg-accent-primary/20 text-accent-primary font-medium transition-colors flex items-center gap-1.5"
            aria-label="Shows"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2h6v4H7V5zm8 8v2h1v-2h-1zm-2-2H7v4h6v-4zm2 0h1V9h-1v2zm1-4V5h-1v2h1zM5 5v2H4V5h1zm0 4H4v2h1V9zm-1 4h1v2H4v-2z" clipRule="evenodd" />
            </svg>
            <span className="hidden sm:inline">Shows</span>
          </button>
          <button
            onClick={() => router.push('/anime')}
            className="px-2 sm:px-3 py-1.5 rounded-lg hover:bg-background-tertiary/50 transition-colors flex items-center gap-1.5"
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
        <div className="flex gap-4">
          {/* Media type selector with hover and focus states */}
          <select
            value={mediaType}
            onChange={(e) => setMediaType(e.target.value as 'movie' | 'tv')}
            className="bg-background-secondary/90 text-text-primary px-4 py-2 rounded-xl border border-background-secondary/50 hover:border-accent-primary focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 focus:outline-none cursor-pointer transition-all duration-300 backdrop-blur-sm"
          >
            <option value="movie">Movies</option>
            <option value="tv">TV Shows</option>
          </select>
          {/* Category selector with matching styles */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-background-secondary/90 text-text-primary px-4 py-2 rounded-xl border border-background-secondary/50 hover:border-accent-primary focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 focus:outline-none cursor-pointer transition-all duration-300 backdrop-blur-sm"
          >
            <option value="popular">Popular</option>
            <option value="top_rated">Top Rated</option>
            <option value="upcoming">Upcoming</option>
          </select>
        </div>
      </div>
      
      {/* Responsive grid layout with snap scrolling for smooth navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 overflow-y-auto h-[calc(100vh-4rem)] pb-6 snap-y snap-mandatory">
        {/* Inner grid for proper alignment and spacing */}
        <div className="col-span-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 auto-rows-max min-h-[calc(100vh-4rem)]">
          {shows.map((show, index) => (
            <div
              key={`${show.id}-${index}`}
              ref={index === shows.length - 1 ? lastShowElementRef : undefined}
              onClick={() => router.push(`/shows/${show.id}`)}
              className="group bg-background-secondary/80 backdrop-blur-sm rounded-xl overflow-hidden hover:bg-background-tertiary/90 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-accent-primary/20 cursor-pointer snap-start transform-gpu relative"
            >
              {/* Show poster with fallback for missing images */}
              {show.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
                  alt={show.title}
                  className="w-full aspect-[2/3] object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-gradient-to-br from-background-tertiary to-background-secondary flex items-center justify-center text-text-secondary/80">
                  No Image
                </div>
              )}
              
              {/* Watchlist button - positioned top right */}
              <button 
                onClick={(e) => addToWatchlist(e, show)}
                disabled={addingToWatchlist === show.id}
                className={`absolute top-2 right-2 ${
                  addingToWatchlist === show.id 
                    ? 'bg-background-tertiary/70' 
                    : watchlistFeedback === show.id 
                    ? 'bg-accent-primary' 
                    : 'bg-background-primary/70 hover:bg-accent-primary'
                } transition-all duration-300 rounded-full p-2 backdrop-blur-md z-10 text-text-primary hover:text-background-primary`}
                aria-label="Add to watchlist"
              >
                {addingToWatchlist === show.id ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : watchlistFeedback === show.id ? (
                  <span className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                  </svg>
                )}
              </button>
              
              {/* Show details with proper text truncation and spacing */}
              <div className="p-4 backdrop-blur-sm bg-background-secondary/50">
                <h3 className="text-text-primary font-medium truncate group-hover:text-accent-primary transition-colors">
                  {mediaType === 'tv' ? show.name : show.title}
                </h3>
                <div className="flex justify-between items-center mt-2 text-sm text-text-secondary/80 group-hover:text-text-secondary transition-opacity">
                  <span>{new Date(show.release_date || show.first_air_date || '').getFullYear() || 'N/A'}</span>
                  <span>★ {show.vote_average.toFixed(1)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Loading indicator centered in the viewport */}
      {isLoading && (
        <div className="flex justify-center my-8">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
}