'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import LoadingSpinner from '../../components/LoadingSpinner';

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

  useEffect(() => {
    const fetchShowDetails = async () => {
      if (!process.env.NEXT_PUBLIC_TMDB_API_KEY) {
        console.error('TMDB API key is not configured');
        setIsLoading(false);
        return;
      }

      try {
        // Try fetching as a movie first
        let response = await fetch(
          `https://api.themoviedb.org/3/movie/${params.id}?language=en-US&append_to_response=credits,videos,similar`,
          { 
            headers: { 
              'accept': 'application/json',
              'Authorization': `Bearer ${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
            } 
          }
        );

        let data;
        // If movie fetch fails, try as a TV show
        if (!response.ok && response.status === 404) {
          response = await fetch(
            `https://api.themoviedb.org/3/tv/${params.id}?language=en-US&append_to_response=credits,videos,similar`,
            { 
              headers: { 
                'accept': 'application/json',
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
              } 
            }
          );
        }

        if (!response.ok) {
          if (response.status === 401) {
            console.error('Authentication Error:', {
              status: response.status,
              statusText: response.statusText,
              headers: Object.fromEntries(response.headers.entries()),
              apiKey: process.env.NEXT_PUBLIC_TMDB_API_KEY ? 'Present' : 'Missing'
            });
            throw new Error('Authentication failed - Please check your API key configuration');
          } else if (response.status === 404) {
            throw new Error('Show not found');
          } else {
            throw new Error(`Failed to fetch show details: ${response.status}`);
          }
        }

        data = await response.json();
        // Normalize the data structure for TV shows
        const normalizedData = {
          ...data,
          title: data.title || data.name, // TV shows use 'name' instead of 'title'
          release_date: data.release_date || data.first_air_date,
        };
        setShow(normalizedData);
      } catch (error) {
        console.error('Error fetching show details:', error);
        setShow(null); // Ensure show is set to null on error
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchShowDetails();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!show) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl text-text-primary mb-4">Show not found</h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-accent-primary text-text-primary rounded-lg hover:bg-accent-secondary transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary">
      <div className="relative h-[50vh] w-full">
        <div className="absolute inset-0 bg-gradient-to-t from-background-primary to-transparent z-10" />
        {show.backdrop_path ? (
          <img
            src={`https://image.tmdb.org/t/p/original${show.backdrop_path}`}
            alt={show.title || show.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-background-secondary" />
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-20">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-64 flex-shrink-0">
            {show.poster_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
                alt={show.title || show.name}
                className="w-full rounded-lg shadow-lg"
              />
            ) : (
              <div className="w-full aspect-[2/3] bg-background-tertiary rounded-lg flex items-center justify-center text-text-secondary">
                No Image
              </div>
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-4xl font-bold text-text-primary mb-4">
              {show.title || show.name}
            </h1>

            <div className="flex items-center gap-4 text-text-secondary mb-6">
              <span>★ {show.vote_average.toFixed(1)}</span>
              <span>•</span>
              <span>
                {new Date(show.release_date || show.first_air_date || '').getFullYear() || 'N/A'}
              </span>
              {show.runtime && (
                <>
                  <span>•</span>
                  <span>{show.runtime} min</span>
                </>
              )}
              {show.number_of_seasons && (
                <>
                  <span>•</span>
                  <span>{show.number_of_seasons} seasons</span>
                </>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {show.genres.map((genre) => (
                <span
                  key={genre.id}
                  className="px-3 py-1 bg-background-tertiary text-text-secondary rounded-full text-sm"
                >
                  {genre.name}
                </span>
              ))}
            </div>

            <p className="text-text-primary text-lg leading-relaxed mb-8">
              {show.overview}
            </p>

            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-accent-primary text-text-primary rounded-lg hover:bg-accent-secondary transition-colors mb-8"
            >
              Back to Shows
            </button>

            {/* Cast Section */}
            {show.credits?.cast && show.credits.cast.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-text-primary mb-4">Cast</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {show.credits.cast.slice(0, 10).map((actor) => (
                    <div key={actor.id} className="bg-background-secondary rounded-lg p-2 text-center">
                      {actor.profile_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                          alt={actor.name}
                          className="w-full h-40 object-cover rounded-lg mb-2"
                        />
                      ) : (
                        <div className="w-full h-40 bg-background-tertiary rounded-lg mb-2 flex items-center justify-center">
                          <span className="text-text-secondary">No Image</span>
                        </div>
                      )}
                      <h3 className="text-text-primary font-medium text-sm">{actor.name}</h3>
                      <p className="text-text-secondary text-xs">{actor.character}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Directors Section */}
            {show.credits?.crew && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-text-primary mb-4">Directors</h2>
                <div className="flex flex-wrap gap-4">
                  {show.credits.crew
                    .filter((crew) => crew.job === 'Director')
                    .map((director) => (
                      <div key={director.id} className="bg-background-secondary rounded-lg p-4">
                        <h3 className="text-text-primary font-medium">{director.name}</h3>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Similar Shows Section */}
            {show.similar?.results && show.similar.results.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-text-primary mb-4">
                  Similar {show.runtime ? 'Movies' : 'Shows'}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {show.similar.results.slice(0, 6).map((similar) => (
                    <div
                      key={similar.id}
                      onClick={() => {
                        router.push(`/shows/${similar.id}`);
                        window.scrollTo(0, 0);
                      }}
                      className="cursor-pointer hover:scale-105 transition-transform"
                    >
                      {similar.poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w185${similar.poster_path}`}
                          alt={similar.title || similar.name}
                          className="w-full rounded-lg shadow-lg mb-2"
                        />
                      ) : (
                        <div className="w-full aspect-[2/3] bg-background-tertiary rounded-lg flex items-center justify-center mb-2">
                          <span className="text-text-secondary">No Image</span>
                        </div>
                      )}
                      <h3 className="text-text-primary text-sm font-medium truncate">
                        {similar.title || similar.name}
                      </h3>
                      <p className="text-text-secondary text-xs">★ {similar.vote_average.toFixed(1)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}