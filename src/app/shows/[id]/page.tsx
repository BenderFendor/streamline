'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { fetchShowDetails } from '../../lib/api';
import { addToWatchlist, removeFromWatchlist, isInWatchlist, type WatchlistItem } from '../../lib/watchlist';
import PageWrapper from '../../components/PageWrapper';
import CinematicNav from '../../components/CinematicNav';

type ShowDetails = {
  id: number;
  title: string;
  name?: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  vote_average: number;
  vote_count: number;
  release_date?: string;
  first_air_date?: string;
  genres: Array<{ id: number; name: string }>;
  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  credits?: {
    cast: Array<{
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }>;
    crew: Array<{
      id: number;
      name: string;
      job: string;
      profile_path: string | null;
    }>;
  };
  videos?: {
    results: Array<{
      id: string;
      key: string;
      name: string;
      type: string;
    }>;
  };
  similar?: {
    results: Array<{
      id: number;
      title: string;
      name?: string;
      poster_path: string | null;
      vote_average: number;
    }>;
  };
};

export default function ShowDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [show, setShow] = useState<ShowDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [mediaType, setMediaType] = useState<'movie' | 'tv'>('movie');

  useEffect(() => {
    const loadShowDetails = async () => {
      if (!params?.id) {
        setError('Invalid show ID');
        setIsLoading(false);
        return;
      }

      try {
        const urlParams = new URLSearchParams(window.location.search);
        const type = urlParams.get('type') as 'movie' | 'tv' || 'movie';
        setMediaType(type);
        
        const idParam = Array.isArray(params.id) ? params.id[0] : params.id;
        const data = await fetchShowDetails(idParam, type);
        setShow(data as unknown as ShowDetails);
        setError(null);
        
        // Check watchlist status
        const watchlistStatus = await isInWatchlist(String(data.id), type);
        setInWatchlist(watchlistStatus);
      } catch (error) {
        console.error('Error loading show details:', error);
        setError(error instanceof Error ? error.message : 'Failed to load show details');
        setShow(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadShowDetails();
  }, [params?.id]);

  const handleWatchlistToggle = async () => {
    if (!show) return;
    
    const title = show.title || show.name;
    if (!title) return;
    
    if (inWatchlist) {
      const success = await removeFromWatchlist(`${mediaType}-${show.id}`);
      if (success) setInWatchlist(false);
    } else {
      const item: WatchlistItem = {
        id: `${mediaType}-${show.id}`,
        mediaId: String(show.id),
        mediaType,
        title,
        imageUrl: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : undefined,
        year: show.release_date || show.first_air_date
          ? String(new Date(show.release_date || show.first_air_date || '').getFullYear())
          : undefined,
        progress: 0,
        totalEpisodes: show.number_of_episodes,
      };
      const success = await addToWatchlist(item);
      if (success) setInWatchlist(true);
    }
  };

  if (isLoading) {
    return (
      <PageWrapper showFloatingPosters={false}>
        <CinematicNav />
        <div className="flex justify-center items-center min-h-screen">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </PageWrapper>
    );
  }

  if (error || !show) {
    return (
      <PageWrapper showFloatingPosters={false}>
        <CinematicNav />
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-gray-400">
          <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-lg">{error || 'Show not found'}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors interactive"
          >
            Go Back
          </button>
        </div>
      </PageWrapper>
    );
  }

  const trailer = show.videos?.results.find(v => v.type === 'Trailer');

  return (
    <PageWrapper showFloatingPosters={false}>
      <CinematicNav />
      
      {/* Hero Backdrop */}
      <div className="relative h-[70vh] w-full">
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/50 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505] z-10" />
        {show.backdrop_path ? (
          <Image
            src={`https://image.tmdb.org/t/p/original${show.backdrop_path}`}
            alt={show.title || show.name || ''}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black" />
        )}
      </div>

      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 -mt-96">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Poster */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              {show.poster_path ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
                  alt={show.title || show.name || ''}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                  </svg>
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleWatchlistToggle}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 interactive ${
                  inWatchlist 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                }`}
              >
                {inWatchlist ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    In Watchlist
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add to Watchlist
                  </>
                )}
              </button>
              {trailer && (
                <a
                  href={`https://www.youtube.com/watch?v=${trailer.key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl transition-all interactive"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 pt-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs tracking-wider uppercase text-red-500 font-semibold mb-4">
              <span className="w-2 h-2 rounded-full bg-red-600" />
              {mediaType === 'tv' ? 'TV Series' : 'Movie'}
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter leading-tight mb-4">
              {show.title || show.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-gray-400 mb-6">
              <div className="flex items-center gap-1 text-yellow-400 font-semibold">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {show.vote_average.toFixed(1)}
              </div>
              <span className="w-1 h-1 bg-gray-600 rounded-full" />
              <span>{new Date(show.release_date || show.first_air_date || '').getFullYear() || 'N/A'}</span>
              {show.runtime && (
                <>
                  <span className="w-1 h-1 bg-gray-600 rounded-full" />
                  <span>{Math.floor(show.runtime / 60)}h {show.runtime % 60}m</span>
                </>
              )}
              {show.number_of_seasons && (
                <>
                  <span className="w-1 h-1 bg-gray-600 rounded-full" />
                  <span>{show.number_of_seasons} Season{show.number_of_seasons > 1 ? 's' : ''}</span>
                </>
              )}
              {show.number_of_episodes && (
                <>
                  <span className="w-1 h-1 bg-gray-600 rounded-full" />
                  <span>{show.number_of_episodes} Episodes</span>
                </>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {show.genres.map((genre) => (
                <span
                  key={genre.id}
                  className="px-4 py-1.5 bg-white/5 border border-white/10 text-gray-300 rounded-full text-sm"
                >
                  {genre.name}
                </span>
              ))}
            </div>

            <p className="text-gray-400 text-lg leading-relaxed max-w-3xl">
              {show.overview}
            </p>
          </div>
        </div>

        {/* Cast Section */}
        {show.credits?.cast && show.credits.cast.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Cast</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {show.credits.cast.slice(0, 12).map((actor) => (
                <div
                  key={actor.id}
                  onClick={() => router.push(`/person/${actor.id}`)}
                  className="group cursor-pointer rounded-xl overflow-hidden border border-white/10 bg-[#0f0f0f] hover:shadow-2xl hover:shadow-red-900/10 transition-all duration-300 hover:-translate-y-1 interactive"
                >
                  <div className="relative aspect-[2/3]">
                    {actor.profile_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                        alt={actor.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 16vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm truncate group-hover:text-red-400 transition-colors">
                      {actor.name}
                    </h3>
                    <p className="text-xs text-gray-500 truncate mt-1">{actor.character}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Directors Section */}
        {show.credits?.crew && show.credits.crew.filter(c => c.job === 'Director').length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Directors</h2>
            <div className="flex flex-wrap gap-4">
              {show.credits.crew
                .filter((crew) => crew.job === 'Director')
                .map((director) => (
                  <div
                    key={director.id}
                    onClick={() => router.push(`/person/${director.id}`)}
                    className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition-all duration-300 interactive"
                  >
                    {director.profile_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w92${director.profile_path}`}
                        alt={director.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium hover:text-red-400 transition-colors">{director.name}</h3>
                      <p className="text-sm text-gray-500">Director</p>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* Similar Shows Section */}
        {show.similar?.results && show.similar.results.length > 0 && (
          <section className="mt-16 pb-20">
            <h2 className="text-2xl font-bold mb-6">
              Similar {mediaType === 'tv' ? 'Shows' : 'Movies'}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {show.similar.results.slice(0, 12).map((similar) => (
                <div
                  key={similar.id}
                  onClick={() => {
                    router.push(`/shows/${similar.id}?type=${mediaType}`);
                    window.scrollTo(0, 0);
                  }}
                  className="group cursor-pointer rounded-xl overflow-hidden border border-white/10 bg-[#0f0f0f] hover:shadow-2xl hover:shadow-red-900/10 transition-all duration-300 hover:-translate-y-1 interactive"
                >
                  <div className="relative aspect-[2/3]">
                    {similar.poster_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w300${similar.poster_path}`}
                        alt={similar.title || similar.name || ''}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 16vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-lg text-yellow-400 text-xs font-semibold flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {similar.vote_average.toFixed(1)}
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm truncate group-hover:text-red-400 transition-colors">
                      {similar.title || similar.name}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </PageWrapper>
  );
}