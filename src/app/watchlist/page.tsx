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
    <div className="container mx-auto px-4 pt-8">
      {/* Header section with navigation and filters */}
      <div className="flex justify-between items-center mb-8 sticky top-0 bg-background-primary/95 backdrop-blur-md z-10 py-4 px-6 rounded-2xl shadow-lg border border-background-secondary/20">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-text-primary">My Watchlist</h1>
          
          {/* Browse shows navigation button */}
          <button
            onClick={() => router.push('/shows')}
            className="flex items-center gap-2 bg-accent-primary/90 text-background-primary px-4 py-2 rounded-xl hover:bg-accent-primary transition-colors duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Browse Shows
          </button>
        </div>
        
        <div>
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