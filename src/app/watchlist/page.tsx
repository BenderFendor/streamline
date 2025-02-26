'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWatchlist } from '@/app/lib/api';
import { removeFromWatchlist, updateWatchlistItem, type WatchlistItem } from '@/app/lib/watchlist';

type SortOption = 'title' | 'progress' | 'rating' | 'recent';

export default function WatchlistPage() {
  const router = useRouter();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'movie' | 'tv' | 'anime' | 'book'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateFeedback, setUpdateFeedback] = useState<{ id: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const loadWatchlist = async () => {
      const data = await fetchWatchlist();
      setWatchlist(data);
    };
    loadWatchlist();
  }, []);

  const handleProgressUpdate = async (id: string, newProgress: number) => {
    setIsUpdating(true);
    const item = watchlist.find(i => i.id === id);
    if (item) {
      try {
        const success = await updateWatchlistItem(item.mediaId ? { ...item, progress: newProgress } : item);
        if (success) {
          setWatchlist(prev => prev.map(i => i.id === id ? { ...i, progress: newProgress } : i));
          setUpdateFeedback({ id, type: 'success' });
        } else {
          setUpdateFeedback({ id, type: 'error' });
        }
      } catch (error) {
        console.error('Error updating progress:', error);
        setUpdateFeedback({ id, type: 'error' });
      }
    }
    setIsUpdating(false);
    setTimeout(() => setUpdateFeedback(null), 2000);
  };

  const handleRatingUpdate = async (id: string, newRating: number) => {
    setIsUpdating(true);
    const item = watchlist.find(i => i.id === id);
    if (item) {
      try {
        const success = await updateWatchlistItem(item.mediaId ? { ...item, rating: newRating } : item);
        if (success) {
          setWatchlist(prev => prev.map(i => i.id === id ? { ...i, rating: newRating } : i));
          setUpdateFeedback({ id, type: 'success' });
        } else {
          setUpdateFeedback({ id, type: 'error' });
        }
      } catch (error) {
        console.error('Error updating rating:', error);
        setUpdateFeedback({ id, type: 'error' });
      }
    }
    setIsUpdating(false);
    setTimeout(() => setUpdateFeedback(null), 2000);
  };

  const handleRemove = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this item from your watchlist?')) {
      setIsUpdating(true);
      try {
        const success = await removeFromWatchlist(id);
        if (success) {
          setWatchlist(prev => prev.filter(i => i.id !== id));
          setUpdateFeedback({ id, type: 'success' });
        } else {
          setUpdateFeedback({ id, type: 'error' });
        }
      } catch (error) {
        console.error('Error removing item:', error);
        setUpdateFeedback({ id, type: 'error' });
      }
      setIsUpdating(false);
      setTimeout(() => setUpdateFeedback(null), 2000);
    }
  };

  const handleEpisodeUpdate = async (id: string, newEpisode: number) => {
    setIsUpdating(true);
    const item = watchlist.find(i => i.id === id);
    if (item) {
      try {
        // Calculate progress based on episode count
        const progress = item.totalEpisodes ? (newEpisode / item.totalEpisodes) * 100 : 0;
        const success = await updateWatchlistItem({
          ...item,
          currentEpisode: newEpisode,
          progress: Math.min(progress, 100)
        });
        if (success) {
          setWatchlist(prev => prev.map(i => i.id === id ? {
            ...i,
            currentEpisode: newEpisode,
            progress: Math.min(progress, 100)
          } : i));
          setUpdateFeedback({ id, type: 'success' });
        } else {
          setUpdateFeedback({ id, type: 'error' });
        }
      } catch (error) {
        console.error('Error updating episode:', error);
        setUpdateFeedback({ id, type: 'error' });
      }
    }
    setIsUpdating(false);
    setTimeout(() => setUpdateFeedback(null), 2000);
  };

  const sortedAndFilteredWatchlist = (() => {
    let items = filter === 'all' 
      ? watchlist 
      : watchlist.filter(item => item.mediaType === filter);

    switch (sortBy) {
      case 'title':
        return items.sort((a, b) => a.title.localeCompare(b.title));
      case 'progress':
        return items.sort((a, b) => (b.progress ?? 0) - (a.progress ?? 0));
      case 'rating':
        return items.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      case 'recent':
      default:
        return items;
    }
  })();

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
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-background-secondary/90 text-text-primary px-4 py-2 rounded-xl border border-background-secondary/50 hover:border-accent-primary focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 focus:outline-none cursor-pointer transition-all duration-300 backdrop-blur-sm"
          >
            <option value="recent">Recently Added</option>
            <option value="title">Title</option>
            <option value="progress">Progress</option>
            <option value="rating">Rating</option>
          </select>
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
        {sortedAndFilteredWatchlist.map((item) => (
          <div
            key={item.id}
            onClick={() => router.push(`/${item.mediaType === 'anime' ? 'anime' : `${item.mediaType}s`}/${item.mediaId}`)}
            className={`group relative cursor-pointer bg-background-secondary rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
              updateFeedback && updateFeedback.id === item.id 
                ? updateFeedback.type === 'success' 
                  ? 'ring-2 ring-green-500' 
                  : 'ring-2 ring-red-500'
                : ''
            }`}
          >
            <div className="relative aspect-[2/3]">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-background-tertiary flex items-center justify-center">
                  <span className="text-text-secondary">No image</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Remove button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(item.id);
                }}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500/80 hover:bg-red-600/80 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 transform hover:scale-110"
                aria-label="Remove from watchlist"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Progress overlay */}
              {item.progress !== undefined && (
                <div className="absolute left-0 right-0 bottom-0 p-3 text-white z-10">
                  <div className="flex justify-between text-xs mb-1">
                    <span>{Math.round(item.progress)}%</span>
                    {item.totalEpisodes && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (item.currentEpisode && item.currentEpisode > 0) {
                              handleEpisodeUpdate(item.id, item.currentEpisode - 1);
                            }
                          }}
                          className="hover:text-accent-primary transition-colors"
                          disabled={isUpdating || !item.currentEpisode || item.currentEpisode <= 0}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <span>
                          {item.currentEpisode || 0}/{item.totalEpisodes}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const nextEpisode = (item.currentEpisode || 0) + 1;
                            if (nextEpisode <= (item.totalEpisodes || 0)) {
                              handleEpisodeUpdate(item.id, nextEpisode);
                            }
                          }}
                          className="hover:text-accent-primary transition-colors"
                          disabled={isUpdating || (item.currentEpisode || 0) >= (item.totalEpisodes || 0)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    )}
                    {item.totalPages && (
                      <span>
                        {Math.round(item.progress * item.totalPages / 100)}/{item.totalPages}
                      </span>
                    )}
                  </div>
                  <div className="relative h-1 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-accent-primary transition-all duration-300"
                      style={{ width: `${item.progress}%` }}
                    />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={item.progress}
                      onChange={(e) => {
                        e.stopPropagation();
                        const newProgress = parseInt(e.target.value);
                        if (item.totalEpisodes) {
                          const newEpisode = Math.round((newProgress * item.totalEpisodes) / 100);
                          handleEpisodeUpdate(item.id, newEpisode);
                        } else {
                          handleProgressUpdate(item.id, newProgress);
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer z-20"
                      disabled={isUpdating}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Card content */}
            <div className="p-2">
              <h3 className="text-sm font-medium line-clamp-1">{item.title}</h3>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-text-secondary capitalize">{item.mediaType}</span>
                {item.year && (
                  <span className="text-xs text-text-secondary">{item.year}</span>
                )}
              </div>
              
              {/* Rating stars */}
              {(item.rating !== undefined || item.mediaType !== 'book') && (
                <div className="flex items-center justify-center gap-0.5 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRatingUpdate(item.id, star);
                      }}
                      disabled={isUpdating}
                      className="group/star p-0.5 transition-transform hover:scale-110"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className={`h-4 w-4 transition-colors duration-300 ${
                          star <= (item.rating || 0) 
                            ? 'text-yellow-400 group-hover/star:text-yellow-300' 
                            : 'text-gray-400 group-hover/star:text-gray-300'
                        }`}
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {sortedAndFilteredWatchlist.length === 0 && (
        <div className="text-center text-text-secondary py-8">
          No items in your watchlist. <button onClick={() => router.push('/shows')} className="text-accent-primary hover:underline">Browse shows</button> to add some!
        </div>
      )}
    </div>
  );
}