'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAnimeDetails } from '@/app/lib/api';
import { addToWatchlist as addToWatchlistApi } from '@/app/lib/watchlist';
import Image from 'next/image';
import LoadingSpinner from '@/app/components/LoadingSpinner';

type AnimeDetailProps = {
  params: {
    id: string;
  };
};

export default function AnimeDetailPage({ params }: AnimeDetailProps) {
  const router = useRouter();
  const [anime, setAnime] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const animeId = parseInt(params.id, 10);

  useEffect(() => {
    async function loadAnimeDetails() {
      try {
        setLoading(true);
        const data = await fetchAnimeDetails(animeId);
        setAnime(data);
        setError('');
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

  const addToWatchlist = async () => {
    if (adding || !anime) return;
    
    setAdding(true);
    try {
      const watchlistItem = {
        id: '',
        title: anime.title.english || anime.title.romaji,
        mediaType: 'anime' as const,
        mediaId: anime.id.toString(),
        imageUrl: anime.coverImage.extraLarge,
        totalEpisodes: anime.episodes,
        progress: 0,
        rating: 0,
        genres: anime.genres
      };
      
      await addToWatchlistApi(watchlistItem);
      // Could show a success message here
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      // Could show an error message here
    } finally {
      setAdding(false);
    }
  };

  const formatDate = (date: { year?: number; month?: number; day?: number }) => {
    if (!date || !date.year) return 'Unknown';
    return `${date.month}/${date.day}/${date.year}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !anime) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-600/20 border border-red-600 text-red-600 p-4 rounded-lg">
          {error || 'Failed to load anime details'}
        </div>
        <button 
          onClick={() => router.back()} 
          className="mt-4 bg-accent hover:bg-accent/80 text-white px-4 py-2 rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  const title = anime.title.english || anime.title.romaji;
  const studios = anime.studios?.edges?.filter((edge: any) => edge.isMain)?.map((edge: any) => edge.node.name);
  const directors = anime.staff?.edges?.filter((edge: any) => edge.role?.includes('Director'))?.map((edge: any) => edge.node.name.full);
  const mainCharacters = anime.characters?.edges?.filter((edge: any) => edge.role === 'MAIN')?.slice(0, 6);
  const recommendations = anime.recommendations?.edges?.slice(0, 6);
  const relations = anime.relations?.edges;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero section with banner, poster and basic info */}
      <div className="relative mb-8">
        {/* Banner image */}
        {anime.bannerImage && (
          <div className="w-full h-64 md:h-80 relative rounded-xl overflow-hidden">
            <Image
              src={anime.bannerImage}
              alt={`${title} Banner`}
              fill
              className="object-cover opacity-60"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background-primary via-background-primary/80 to-transparent" />
          </div>
        )}

        {/* Poster and basic info */}
        <div className={`${anime.bannerImage ? 'absolute bottom-0 left-0 w-full' : ''} p-4`}>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Poster */}
            <div className="w-40 md:w-60 shrink-0 rounded-lg overflow-hidden shadow-lg">
              <Image
                src={anime.coverImage.extraLarge}
                alt={title}
                width={240}
                height={360}
                className="w-full h-auto"
              />
            </div>

            {/* Basic info */}
            <div className="flex-grow">
              <h1 className="text-2xl md:text-4xl font-bold mb-2">{title}</h1>
              {anime.title.native && (
                <h2 className="text-lg mb-4 text-text-secondary">{anime.title.native}</h2>
              )}
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-accent/20 text-accent px-2 py-1 rounded text-sm">
                  {anime.format}
                </span>
                <span className="bg-background-secondary px-2 py-1 rounded text-sm">
                  {anime.season} {anime.seasonYear}
                </span>
                <span className="bg-background-secondary px-2 py-1 rounded text-sm">
                  {anime.status.replace(/_/g, ' ')}
                </span>
                {anime.episodes && (
                  <span className="bg-background-secondary px-2 py-1 rounded text-sm">
                    {anime.episodes} Episodes
                  </span>
                )}
              </div>

              {anime.genres && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {anime.genres.map((genre: string) => (
                    <span key={genre} className="bg-background-secondary px-2 py-1 rounded text-xs">
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 mb-4">
                {anime.averageScore && (
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-semibold">{anime.averageScore / 10}</span>
                    <span className="text-text-secondary text-sm ml-1">/ 10</span>
                  </div>
                )}
                
                <div className="text-sm text-text-secondary">
                  {anime.popularity.toLocaleString()} fans
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={addToWatchlist}
                  disabled={adding}
                  className="bg-accent hover:bg-accent/80 text-white px-4 py-2 rounded flex items-center gap-2"
                >
                  {adding ? (
                    <>
                      <LoadingSpinner size="small" />
                      Adding...
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
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Watch Trailer
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description and details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Synopsis</h2>
          <div 
            className="text-text-secondary mb-6"
            dangerouslySetInnerHTML={{ __html: anime.description }}
          />

          {/* Characters section */}
          {mainCharacters && mainCharacters.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Main Characters</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {mainCharacters.map((edge: any) => {
                  const character = edge.node;
                  const voiceActor = edge.voiceActors?.[0];
                  
                  return (
                    <div key={character.id} className="bg-background-secondary rounded-lg overflow-hidden shadow-md">
                      <div className="flex">
                        {/* Character image */}
                        <div className="w-16 h-20 relative">
                          <Image
                            src={character.image.large}
                            alt={character.name.full}
                            fill
                            className="object-cover"
                          />
                        </div>
                        
                        {/* Character info */}
                        <div className="p-2">
                          <h3 className="font-semibold text-sm line-clamp-1">{character.name.full}</h3>
                          <p className="text-xs text-text-secondary line-clamp-1">{edge.role}</p>
                          
                          {voiceActor && (
                            <p className="text-xs text-text-secondary mt-1 line-clamp-1">
                              VA: {voiceActor.name.full}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Related anime */}
          {relations && relations.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Related Anime</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {relations.slice(0, 4).map((edge: any) => {
                  const related = edge.node;
                  if (related.type !== 'ANIME') return null;
                  
                  return (
                    <div 
                      key={related.id} 
                      className="bg-background-secondary rounded-lg overflow-hidden shadow-md cursor-pointer"
                      onClick={() => router.push(`/anime/${related.id}`)}
                    >
                      <div className="relative aspect-[2/3] w-full">
                        {related.coverImage?.large && (
                          <Image
                            src={related.coverImage.large}
                            alt={related.title.romaji}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="p-2">
                        <h3 className="font-semibold text-sm line-clamp-1">
                          {related.title.english || related.title.romaji}
                        </h3>
                        <p className="text-xs text-text-secondary">
                          {edge.relationType.replace(/_/g, ' ')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Recommendations */}
          {recommendations && recommendations.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">You Might Also Like</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {recommendations.map((edge: any) => {
                  const rec = edge.node.mediaRecommendation;
                  
                  return (
                    <div 
                      key={rec.id} 
                      className="bg-background-secondary rounded-lg overflow-hidden shadow-md cursor-pointer"
                      onClick={() => router.push(`/anime/${rec.id}`)}
                    >
                      <div className="relative aspect-[2/3] w-full">
                        {rec.coverImage?.large && (
                          <Image
                            src={rec.coverImage.large}
                            alt={rec.title.romaji}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="p-2">
                        <h3 className="font-semibold text-xs line-clamp-2">
                          {rec.title.english || rec.title.romaji}
                        </h3>
                        {rec.averageScore && (
                          <div className="flex items-center mt-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-yellow-400 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-xs">{rec.averageScore / 10}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        
        <div>
          {/* Info sidebar */}
          <div className="bg-background-secondary rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold mb-2 pb-2 border-b border-background-secondary">Information</h2>
            <dl className="space-y-2">
              <div>
                <dt className="text-text-secondary">Format</dt>
                <dd>{anime.format}</dd>
              </div>
              <div>
                <dt className="text-text-secondary">Episodes</dt>
                <dd>{anime.episodes || 'Unknown'}</dd>
              </div>
              <div>
                <dt className="text-text-secondary">Episode Duration</dt>
                <dd>{anime.duration ? `${anime.duration} minutes` : 'Unknown'}</dd>
              </div>
              <div>
                <dt className="text-text-secondary">Status</dt>
                <dd>{anime.status.replace(/_/g, ' ')}</dd>
              </div>
              <div>
                <dt className="text-text-secondary">Start Date</dt>
                <dd>{formatDate(anime.startDate)}</dd>
              </div>
              {anime.status === 'FINISHED' && (
                <div>
                  <dt className="text-text-secondary">End Date</dt>
                  <dd>{formatDate(anime.endDate)}</dd>
                </div>
              )}
              <div>
                <dt className="text-text-secondary">Season</dt>
                <dd>{anime.season} {anime.seasonYear}</dd>
              </div>
              <div>
                <dt className="text-text-secondary">Studios</dt>
                <dd>{studios?.join(', ') || 'Unknown'}</dd>
              </div>
              <div>
                <dt className="text-text-secondary">Source</dt>
                <dd>{anime.source || 'Unknown'}</dd>
              </div>
            </dl>
          </div>
          
          {/* External links */}
          {anime.externalLinks && anime.externalLinks.length > 0 && (
            <div className="bg-background-secondary rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-2 pb-2 border-b border-background-secondary">External Links</h2>
              <div className="space-y-2">
                {anime.externalLinks.map((link: any) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block py-1 px-2 hover:bg-background-primary/50 rounded transition-colors"
                  >
                    {link.site}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}