'use client';

import { useState, useEffect } from 'react';
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
    <div className="container mx-auto px-4 pt-20">
      <h1 className="text-3xl font-bold mb-6">My Watchlist</h1>
      
      <div className="mb-6">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="bg-background-tertiary text-text-primary px-4 py-2 rounded-md"
        >
          <option value="all">All</option>
          <option value="movie">Movies</option>
          <option value="tv">TV Shows</option>
          <option value="anime">Anime</option>
          <option value="book">Books</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredWatchlist.map((item) => (
          <div
            key={item.id}
            className="bg-background-secondary rounded-lg overflow-hidden shadow-lg"
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
          No items in your watchlist
        </div>
      )}
    </div>
  );
}