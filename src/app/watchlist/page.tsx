'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWatchlist } from '@/app/lib/api';

type WatchlistItem = {
  id: string;
  title: string;
  mediaType: 'movie' | 'tv' | 'anime' | 'book';
  progress?: number;
  rating?: number;
  imageUrl?: string;
  totalEpisodes?: number;
  totalPages?: number;
};

export default function WatchlistPage() {
  const router = useRouter();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'movie' | 'tv' | 'anime' | 'book'>('all');

  useEffect(() => {
    const loadWatchlist = async () => {
      const data = await fetchWatchlist();
      setWatchlist(data);
    };
    loadWatchlist();
  }, []);

  const filteredWatchlist = filter === 'all'
    ? watchlist
    : watchlist.filter(item => item.mediaType === filter);

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
            className="px-2 sm:px-3 py-1.5 rounded-lg bg-accent-primary/20 text-accent-primary font-medium transition-colors flex items-center gap-1.5"
            aria-label="Watchlist"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
            <span className="hidden sm:inline">Watchlist</span>
          </button>
        </div>
        <div className="flex gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="bg-background-secondary/90 text-text-primary px-4 py-2 rounded-xl border border-background-secondary/50 hover:border-accent-primary focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 focus:outline-none cursor-pointer transition-all duration-300 backdrop-blur-sm"
          >
            <option value="all">All</option>
            <option value="movie">Movies</option>
            <option value="tv">TV Shows</option>
            <option value="anime">Anime</option>
            <option value="book">Books</option>
          </select>
        </div>
      </div>
      
      {/* Watchlist content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredWatchlist.map((item) => (
          <div
            key={item.id}
            className="bg-background-secondary rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-text-secondary mb-2">
                Type: {item.mediaType.charAt(0).toUpperCase() + item.mediaType.slice(1)}
              </p>
              {item.progress !== undefined && (
                <div className="mb-2">
                  <div className="text-sm text-text-secondary mb-1">
                    Progress: {item.progress}%
                  </div>
                  <div className="w-full bg-background-tertiary rounded-full h-2">
                    <div
                      className="bg-accent-primary h-2 rounded-full"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              )}
              {item.rating && (
                <div className="text-accent-secondary">
                  Rating: {item.rating}/5
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredWatchlist.length === 0 && (
        <div className="text-center text-text-secondary py-8">
          No items in your watchlist. <button onClick={() => router.push('/shows')} className="text-accent-primary hover:underline">Browse shows</button> to add some!
        </div>
      )}
    </div>
  );
}