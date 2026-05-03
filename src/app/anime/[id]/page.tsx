'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAnimeDetails } from '@/app/lib/api';
import { addToWatchlist as addToWatchlistApi, removeFromWatchlist, isInWatchlist } from '@/app/lib/watchlist';
import Image from 'next/image';
import PageWrapper from '@/app/components/PageWrapper';
import CinematicNav from '@/app/components/CinematicNav';

type AnimeDetailEdge = {
  node: {
    id: number;
    name?: { full: string; native?: string };
    title?: { english?: string; romaji: string; native?: string };
    coverImage?: { large: string; extraLarge?: string };
    format?: string;
    status?: string;
    averageScore?: number;
    type?: string;
    siteUrl?: string;
    image?: { large: string };
  };
  role?: string;
  relationType?: string;
  voiceActors?: Array<{ id: number; name: { full: string; native?: string }; language?: string; image?: { large: string }; siteUrl?: string }>;
  isMain?: boolean;
};

type AnimeRecEdge = {
  node: {
    mediaRecommendation: {
      id: number;
      title: { english?: string; romaji: string };
      coverImage?: { large: string };
      format?: string;
      status?: string;
      averageScore?: number;
      popularity?: number;
      siteUrl?: string;
    };
    rating?: number;
    userRating?: number;
  };
};

type AnimeExternalLink = {
  id: number;
  url: string;
  site: string;
};

type AnimeDetail = {
  id: number;
  title: { english?: string; romaji: string; native?: string };
  episodes?: number;
  status: string;
  format: string;
  genres: string[];
  description: string;
  averageScore?: number;
  duration?: number;
  coverImage: { extraLarge: string };
  bannerImage?: string;
  season?: string;
  seasonYear?: number;
  trailer?: { id: string; site: string; thumbnail: string };
  studios?: { edges: AnimeDetailEdge[] };
  characters?: { edges: AnimeDetailEdge[] };
  relations?: { edges: AnimeDetailEdge[] };
  recommendations?: { edges: AnimeRecEdge[] };
  externalLinks?: AnimeExternalLink[];
};

type AnimeDetailProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function AnimeDetailPage({ params }: AnimeDetailProps) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const [anime, setAnime] = useState<AnimeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);
  const animeId = parseInt(unwrappedParams.id, 10);

  useEffect(() => {
    async function loadAnimeDetails() {
      try {
        setLoading(true);
        const data = await fetchAnimeDetails(animeId);
        setAnime(data as unknown as AnimeDetail);
        setError('');
        
        // Check watchlist status
        const watchlistStatus = await isInWatchlist(String(animeId), 'anime');
        setInWatchlist(watchlistStatus);
      } catch (err) {
        console.error('Error loading anime details:', err);
        setError('Failed to load anime details. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    if (animeId) {
      loadAnimeDetails();
    }
  }, [animeId]);

  const handleWatchlistToggle = async () => {
    if (adding || !anime) return;
    
    setAdding(true);
    try {
      if (inWatchlist) {
        const success = await removeFromWatchlist(`anime-${anime.id}`);
        if (success) setInWatchlist(false);
      } else {
        const watchlistItem = {
          id: `anime-${anime.id}`,
          title: anime.title.english || anime.title.romaji,
          mediaType: 'anime' as const,
          mediaId: anime.id.toString(),
          imageUrl: anime.coverImage.extraLarge,
          totalEpisodes: anime.episodes,
          progress: 0,
          rating: 0,
          genres: anime.genres
        };
        
        const success = await addToWatchlistApi(watchlistItem);
        if (success) setInWatchlist(true);
      }
    } catch (error) {
      console.error('Error updating watchlist:', error);
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper showFloatingPosters={false}>
        <CinematicNav />
        <div className="flex justify-center items-center min-h-screen">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </PageWrapper>
    );
  }

  if (error || !anime) {
    return (
      <PageWrapper showFloatingPosters={false}>
        <CinematicNav />
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-gray-400">
          <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-lg">{error || 'Failed to load anime details'}</p>
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

  const title = anime.title.english || anime.title.romaji;
  const studios = anime.studios?.edges?.filter((edge: AnimeDetailEdge) => edge.isMain)?.map((edge: AnimeDetailEdge) => edge.node.name);
  const mainCharacters = anime.characters?.edges?.filter((edge: AnimeDetailEdge) => edge.role === 'MAIN')?.slice(0, 6);
  const recommendations = anime.recommendations?.edges?.slice(0, 12);
  const relations = anime.relations?.edges;

  return (
    <PageWrapper showFloatingPosters={false}>
      <CinematicNav />
      
      {/* Hero Backdrop */}
      <div className="relative h-[70vh] w-full">
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/50 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505] z-10" />
        {anime.bannerImage ? (
          <Image
            src={anime.bannerImage}
            alt={`${title} Banner`}
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
              <Image
                src={anime.coverImage.extraLarge}
                alt={title}
                fill
                className="object-cover"
                priority
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleWatchlistToggle}
                disabled={adding}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 interactive ${
                  inWatchlist 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                }`}
              >
                {adding ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : inWatchlist ? (
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
              {anime.trailer && (
                <a
                  href={`https://www.youtube.com/watch?v=${anime.trailer.id}`}
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
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs tracking-wider uppercase text-red-500 font-semibold">
                <span className="w-2 h-2 rounded-full bg-red-600" />
                {anime.format}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs tracking-wider uppercase text-gray-400">
                {anime.season} {anime.seasonYear}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs tracking-wider uppercase ${
                anime.status === 'RELEASING' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                anime.status === 'FINISHED' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                'bg-white/5 text-gray-400 border border-white/10'
              }`}>
                {anime.status.replace(/_/g, ' ')}
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter leading-tight mb-2">
              {title}
            </h1>
            
            {anime.title.native && (
              <p className="text-xl text-gray-500 mb-6">{anime.title.native}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-gray-400 mb-6">
              {anime.averageScore && (
                <div className="flex items-center gap-1 text-yellow-400 font-semibold">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {(anime.averageScore / 10).toFixed(1)}
                </div>
              )}
              {anime.episodes && (
                <>
                  <span className="w-1 h-1 bg-gray-600 rounded-full" />
                  <span>{anime.episodes} Episodes</span>
                </>
              )}
              {anime.duration && (
                <>
                  <span className="w-1 h-1 bg-gray-600 rounded-full" />
                  <span>{anime.duration} min/ep</span>
                </>
              )}
              {studios && studios.length > 0 && (
                <>
                  <span className="w-1 h-1 bg-gray-600 rounded-full" />
                  <span>{studios.join(', ')}</span>
                </>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {anime.genres?.map((genre: string) => (
                <span
                  key={genre}
                  className="px-4 py-1.5 bg-white/5 border border-white/10 text-gray-300 rounded-full text-sm"
                >
                  {genre}
                </span>
              ))}
            </div>

            <div 
              className="text-gray-400 text-lg leading-relaxed max-w-3xl prose prose-invert prose-p:text-gray-400"
              dangerouslySetInnerHTML={{ __html: anime.description }}
            />
          </div>
        </div>

        {/* Characters Section */}
        {mainCharacters && mainCharacters.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Main Characters</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mainCharacters.map((edge: AnimeDetailEdge) => {
                const character = edge.node;
                const voiceActor = edge.voiceActors?.[0];
                
                return (
                  <div key={character.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="relative w-16 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      {character.image?.large && (
                        <Image
                          src={character.image.large}
                          alt={character.name?.full ?? 'Character'}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{character.name?.full ?? 'Unknown'}</h3>
                      <p className="text-sm text-gray-500">{edge.role ?? ''}</p>
                      {voiceActor && (
                        <p className="text-sm text-gray-500 truncate mt-1">
                          VA: {voiceActor.name.full}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Related Anime */}
        {relations && relations.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Related</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {relations.slice(0, 6).map((edge: AnimeDetailEdge) => {
                const related = edge.node;
                if (related.type !== 'ANIME') return null;
                
                return (
                  <div
                    key={related.id}
                    onClick={() => router.push(`/anime/${related.id}`)}
                    className="group cursor-pointer rounded-xl overflow-hidden border border-white/10 bg-[#0f0f0f] hover:shadow-2xl hover:shadow-red-900/10 transition-all duration-300 hover:-translate-y-1 interactive"
                  >
                    <div className="relative aspect-[2/3]">
                      {related.coverImage?.large && (
                        <Image
                          src={related.coverImage.large}
                          alt={related.title?.romaji ?? 'Related'}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 16vw"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-sm truncate group-hover:text-red-400 transition-colors">
                        {related.title?.english || related.title?.romaji || 'Untitled'}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {edge.relationType?.replace(/_/g, ' ') ?? ''}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <section className="mt-16 pb-20">
            <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {recommendations.map((edge: AnimeRecEdge) => {
                const rec = edge.node.mediaRecommendation;
                
                return (
                  <div
                    key={rec.id}
                    onClick={() => router.push(`/anime/${rec.id}`)}
                    className="group cursor-pointer rounded-xl overflow-hidden border border-white/10 bg-[#0f0f0f] hover:shadow-2xl hover:shadow-red-900/10 transition-all duration-300 hover:-translate-y-1 interactive"
                  >
                    <div className="relative aspect-[2/3]">
                      {rec.coverImage?.large && (
                        <Image
                          src={rec.coverImage.large}
                          alt={rec.title.romaji}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 16vw"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      {rec.averageScore && (
                        <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-lg text-yellow-400 text-xs font-semibold flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {(rec.averageScore / 10).toFixed(1)}
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-sm truncate group-hover:text-red-400 transition-colors">
                        {rec.title.english || rec.title.romaji}
                      </h3>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Info Sidebar - External Links */}
        {anime.externalLinks && anime.externalLinks.length > 0 && (
          <section className="pb-20">
            <h2 className="text-2xl font-bold mb-6">External Links</h2>
            <div className="flex flex-wrap gap-3">
              {anime.externalLinks.map((link: AnimeExternalLink) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors interactive"
                >
                  {link.site}
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </PageWrapper>
  );
}