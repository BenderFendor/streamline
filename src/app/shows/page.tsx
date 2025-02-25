'use client';

import React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { fetchShows } from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';

// Define the Show type for type safety and better code documentation
type Show = {
  id: number;
  title: string;
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
      {/* Header section with filters - Sticky positioning for persistent access */}
      <div className="flex justify-between items-center mb-8 sticky top-0 bg-background-primary z-10 py-4">
        <h1 className="text-3xl font-bold text-text-primary">
          {mediaType === 'movie' ? 'Movies' : 'TV Shows'}
        </h1>
        <div className="flex gap-4">
          {/* Media type selector with hover and focus states */}
          <select
            value={mediaType}
            onChange={(e) => setMediaType(e.target.value as 'movie' | 'tv')}
            className="bg-background-tertiary text-text-primary px-4 py-2 rounded-lg border border-background-secondary hover:border-accent-primary focus:border-accent-primary focus:outline-none cursor-pointer"
          >
            <option value="movie">Movies</option>
            <option value="tv">TV Shows</option>
          </select>
          {/* Category selector with matching styles */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-background-tertiary text-text-primary px-4 py-2 rounded-lg border border-background-secondary hover:border-accent-primary focus:border-accent-primary focus:outline-none cursor-pointer"
          >
            <option value="popular">Popular</option>
            <option value="top_rated">Top Rated</option>
            <option value="upcoming">Upcoming</option>
          </select>
        </div>
      </div>

      {/* Dynamic category title with proper text transformation */}
      <h2 className="text-xl text-text-secondary mb-6">
        {category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} {mediaType === 'movie' ? 'Movies' : 'TV Shows'}
      </h2>

      {/* Responsive grid layout with snap scrolling for smooth navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 overflow-y-auto h-[calc(100vh-12rem)] pb-6 snap-y snap-mandatory">
        {/* Inner grid for proper alignment and spacing */}
        <div className="col-span-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 auto-rows-max">
          {shows.map((show, index) => (
            <div
              key={`${show.id}-${index}`}
              ref={index === shows.length - 1 ? lastShowElementRef : undefined}
              onClick={() => router.push(`/shows/${show.id}`)}
              className="bg-background-secondary rounded-lg overflow-hidden hover:bg-background-tertiary transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer snap-start"
            >
              {/* Show poster with fallback for missing images */}
              {show.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
                  alt={show.title}
                  className="w-full aspect-[2/3] object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-background-tertiary flex items-center justify-center text-text-secondary">
                  No Image
                </div>
              )}
              {/* Show details with proper text truncation and spacing */}
              <div className="p-4">
                <h3 className="text-text-primary font-medium truncate">{show.title}</h3>
                <div className="flex justify-between items-center mt-2 text-sm text-text-secondary">
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