'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { fetchShows } from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';

type Show = {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
};

export default function ShowsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [shows, setShows] = useState<Show[]>([]);
  const [mediaType, setMediaType] = useState<'movie' | 'tv'>('movie');
  const [category, setCategory] = useState('popular');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
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

  const loadShows = async () => {
    setIsLoading(true);
    try {
      const data = await fetchShows({ mediaType, category, page });
      setShows(prevShows => {
        // If it's page 1, replace the shows, otherwise append
        return page === 1 ? data.results : [...prevShows, ...data.results];
      });
      setHasMore(data.page < data.total_pages);
    } catch (error) {
      console.error('Error loading shows:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPage(1); // Reset page when filters change
    setShows([]); // Clear existing shows
  }, [mediaType, category]);

  useEffect(() => {
    loadShows();
  }, [page, mediaType, category]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8 sticky top-0 bg-background-primary z-10 py-4">
        <h1 className="text-3xl font-bold text-text-primary">
          {mediaType === 'movie' ? 'Movies' : 'TV Shows'}
        </h1>
        <div className="flex gap-4">
          <select
            value={mediaType}
            onChange={(e) => setMediaType(e.target.value as 'movie' | 'tv')}
            className="bg-background-tertiary text-text-primary px-4 py-2 rounded-lg border border-background-secondary hover:border-accent-primary focus:border-accent-primary focus:outline-none cursor-pointer"
          >
            <option value="movie">Movies</option>
            <option value="tv">TV Shows</option>
          </select>
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

      <h2 className="text-xl text-text-secondary mb-6">
        {category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} {mediaType === 'movie' ? 'Movies' : 'TV Shows'}
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 scroll-smooth snap-mandatory snap-y">
        {shows.map((show, index) => (
          <div
            key={`${show.id}-${index}`}
            ref={index === shows.length - 1 ? lastShowElementRef : undefined}
            onClick={() => router.push(`/shows/${show.id}`)}
            className="bg-background-secondary rounded-lg overflow-hidden hover:bg-background-tertiary transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer snap-start"
          >
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
      {isLoading && (
        <div className="flex justify-center my-8">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
}