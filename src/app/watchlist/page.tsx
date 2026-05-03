'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { fetchWatchlist } from '@/app/lib/api';
import { removeFromWatchlist, updateWatchlistItem, type WatchlistItem } from '@/app/lib/watchlist';
import PageWrapper from '@/app/components/PageWrapper';
import CinematicNav from '@/app/components/CinematicNav';

type SortOption = 'title' | 'progress' | 'rating' | 'recent';

export default function WatchlistPage() {
  const router = useRouter();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'movie' | 'tv' | 'anime' | 'book'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateFeedback, setUpdateFeedback] = useState<{ id: string; type: 'success' | 'error' } | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const loadWatchlist = async () => {
      const data = await fetchWatchlist();
      setWatchlist(data);
    };
    loadWatchlist();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 20 - 10,
        y: (e.clientY / window.innerHeight) * 20 - 10
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const stats = useMemo(() => {
    const total = watchlist.length;
    const avgProgress = total ? watchlist.reduce((a, b) => a + (b.progress || 0), 0) / total : 0;
    const rated = watchlist.filter(i => i.rating);
    const avgRating = rated.length ? rated.reduce((a, b) => a + (b.rating || 0), 0) / rated.length : 0;
    return { total, avgProgress, avgRating };
  }, [watchlist]);

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
    if (window.confirm('Remove this item from your watchlist?')) {
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
        const progress = item.totalEpisodes ? (newEpisode / item.totalEpisodes) * 100 : 0;
        const success = await updateWatchlistItem({
          ...item,
          currentEpisode: newEpisode,
          progress: Math.min(progress, 100)
        });
        if (success) {
          setWatchlist(prev => prev.map(i => i.id === id ? { ...i, currentEpisode: newEpisode, progress: Math.min(progress, 100) } : i));
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

  const sortedAndFilteredWatchlist = useMemo(() => {
    const items = filter === 'all' ? watchlist : watchlist.filter(item => item.mediaType === filter);
    switch (sortBy) {
      case 'title':
        return [...items].sort((a, b) => a.title.localeCompare(b.title));
      case 'progress':
        return [...items].sort((a, b) => (b.progress ?? 0) - (a.progress ?? 0));
      case 'rating':
        return [...items].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      case 'recent':
      default:
        return items;
    }
  }, [watchlist, filter, sortBy]);

  // Choose poster thumbnails for floating animation
  const floatingPosters = watchlist.slice(0, 8).map(i => i.imageUrl).filter(Boolean) as string[];

  return (
    <PageWrapper showFloatingPosters={false}>
      <CinematicNav />
      
      {/* Hero Section */}
      <header className="relative z-10 pt-28 pb-16 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row gap-16">
        <div className="flex-1 space-y-10 lg:pt-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs tracking-wider uppercase text-red-500 font-semibold">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" /> Streamline Watchlist
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter leading-[0.9]">
            Curate <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-600">Your Canon</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-xl leading-relaxed">
            A cinematic vault for movies, shows, anime and books. Brutally organized. Elegantly obsessive.
          </p>
          <div className="flex gap-6 pt-6 border-t border-white/5">
            <div>
              <div className="text-3xl font-mono font-bold">{stats.total}</div>
              <div className="text-xs uppercase tracking-widest text-gray-500">Items</div>
            </div>
            <div>
              <div className="text-3xl font-mono font-bold">{Math.round(stats.avgProgress)}%</div>
              <div className="text-xs uppercase tracking-widest text-gray-500">Avg Progress</div>
            </div>
            <div>
              <div className="text-3xl font-mono font-bold">{stats.avgRating.toFixed(1) || '0.0'}</div>
              <div className="text-xs uppercase tracking-widest text-gray-500">Avg Rating</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} className="px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg text-sm hover:border-white/30 focus:outline-none interactive">
              <option value="recent">Recently Added</option>
              <option value="title">Title</option>
              <option value="progress">Progress</option>
              <option value="rating">Rating</option>
            </select>
            <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg text-sm hover:border-white/30 focus:outline-none interactive">
              <option value="all">All</option>
              <option value="movie">Movies</option>
              <option value="tv">TV</option>
              <option value="anime">Anime</option>
              <option value="book">Books</option>
            </select>
          </div>
        </div>

        {/* Visual Composition / Poster Stack */}
        <div className="flex-1 relative w-full max-w-xl">
          <div className="relative aspect-square md:aspect-[4/3]" style={{ transform: `translate(${mousePos.x * -1}px, ${mousePos.y * -1}px)` }}>
            <div className="absolute inset-0 bg-red-600/20 blur-[90px] rounded-full opacity-40" />
            {/* Django Unchained style anchor poster */}
            <div className="absolute top-0 right-0 w-[60%] shadow-2xl" style={{ transform: 'rotate(4deg)' }}>
              <div className="relative rounded-lg overflow-hidden border border-white/10 bg-[#111]">
                <div className="aspect-[2/3] relative bg-[#1a1a1a]">
                  <Image src="https://image.tmdb.org/t/p/w500/7oWY8VDWW7thTzWh3OKYRkWUlD5.jpg" alt="Django Unchained Poster" fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
                <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-md p-3 rounded border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /><span className="text-xs font-bold uppercase tracking-wider">Watching Now</span></div>
                  <span className="text-xs font-mono text-gray-400">01:24:10</span>
                </div>
              </div>
            </div>
            {/* Floating thumbnails */}
            {floatingPosters.map((src, idx) => (
              <div key={src + idx} className={`absolute w-24 h-36 rounded-md overflow-hidden border border-white/10 shadow-xl animate-float`} style={{ top: `${(idx * 12) % 70 + 10}%`, left: `${(idx * 17) % 55 + 5}%`, animationDelay: `${idx * 0.4}s`, transform: `rotate(${(idx % 2 === 0 ? 1 : -1) * 3}deg)` }}>
                <Image src={src} alt="Poster" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              </div>
            ))}
            {/* Review card */}
            <div className="absolute bottom-8 left-6 w-[50%] shadow-2xl" style={{ transform: 'rotate(-2deg)' }}>
              <div className="bg-[#1a1a1a] border border-white/10 rounded-lg overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center gap-1 text-yellow-400 mb-2">
                    {[1,2,3,4,5].map(s => (
                      <svg key={s} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    ))}
                  </div>
                  <p className="text-sm font-serif italic text-gray-300">&ldquo;Curated obsession transforms into cultural memory. Track with intent.&rdquo;</p>
                  <div className="mt-3 flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-gray-600" /><span className="text-xs text-gray-400 uppercase tracking-wide">Editor</span></div>
                </div>
                <div className="bg-yellow-500 p-2 text-black text-xs font-bold text-center uppercase tracking-widest">Editor&apos;s Pick</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Watchlist Grid */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pb-28">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5">
          {sortedAndFilteredWatchlist.map(item => (
            <div
              key={item.id}
              onClick={() => router.push(`/${item.mediaType === 'anime' ? 'anime' : `${item.mediaType}s`}/${item.mediaId}`)}
              className={`group relative cursor-pointer rounded-lg overflow-hidden border border-white/10 bg-[#0f0f0f] shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 ${updateFeedback && updateFeedback.id === item.id ? (updateFeedback.type === 'success' ? 'ring-2 ring-green-500' : 'ring-2 ring-red-500') : ''}`}
            >
              <div className="relative aspect-[2/3]">
                {item.imageUrl ? <Image src={item.imageUrl} alt={item.title} fill className="object-cover" /> : <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500">No Image</div>}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <button
                  onClick={(e) => { e.stopPropagation(); handleRemove(item.id); }}
                  aria-label="Remove"
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600/80 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </button>
                {item.progress !== undefined && (
                  <div className="absolute inset-x-0 bottom-0 p-3 text-white z-10">
                    <div className="flex justify-between text-[10px] font-mono mb-1">
                      <span>{Math.round(item.progress)}%</span>
                      {item.totalEpisodes && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); if (item.currentEpisode && item.currentEpisode > 0) { handleEpisodeUpdate(item.id, item.currentEpisode - 1); } }}
                            disabled={isUpdating || !item.currentEpisode || item.currentEpisode <= 0}
                            className="disabled:opacity-30 hover:text-red-400"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                          </button>
                          <span>{item.currentEpisode || 0}/{item.totalEpisodes}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); const next = (item.currentEpisode || 0) + 1; if (next <= (item.totalEpisodes || 0)) { handleEpisodeUpdate(item.id, next); } }}
                            disabled={isUpdating || (item.currentEpisode || 0) >= (item.totalEpisodes || 0)}
                            className="disabled:opacity-30 hover:text-red-400"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                          </button>
                        </div>
                      )}
                      {item.totalPages && <span>{Math.round(item.progress * item.totalPages / 100)}/{item.totalPages}</span>}
                    </div>
                    <div className="relative h-1 bg-white/30 rounded-full overflow-hidden">
                      <div className="absolute inset-y-0 left-0 bg-red-600 transition-all duration-300" style={{ width: `${item.progress}%` }} />
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
              <div className="p-2">
                <h3 className="text-sm font-medium line-clamp-1 tracking-tight">{item.title}</h3>
                <div className="flex items-center justify-between mt-1 text-[11px] text-gray-400">
                  <span className="capitalize">{item.mediaType}</span>
                  {item.year && <span>{item.year}</span>}
                </div>
                {(item.rating !== undefined || item.mediaType !== 'book') && (
                  <div className="flex items-center justify-start gap-0.5 mt-2">
                    {[1,2,3,4,5].map(star => (
                      <button
                        key={star}
                        onClick={(e) => { e.stopPropagation(); handleRatingUpdate(item.id, star); }}
                        disabled={isUpdating}
                        className="group/star p-0.5 transition-transform hover:scale-110"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`h-4 w-4 ${star <= (item.rating || 0) ? 'text-yellow-400' : 'text-gray-500'} group-hover/star:brightness-125`}><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        {sortedAndFilteredWatchlist.length === 0 && (
          <div className="text-center text-gray-500 py-16">No items yet. <button onClick={() => router.push('/shows')} className="text-red-500 hover:underline">Browse content</button>.</div>
        )}
      </main>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
      `}</style>
    </PageWrapper>
  );
}