'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { fetchPersonDetails } from '../../lib/api';
import LoadingSpinner from '../../components/LoadingSpinner';

interface PersonPageProps {
  params: {
    id: string;
  };
}

export default function PersonPage({ params }: PersonPageProps) {
  const router = useRouter();
  const [person, setPerson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPerson = async () => {
      try {
        const data = await fetchPersonDetails(params.id);
        setPerson(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load person details');
      } finally {
        setLoading(false);
      }
    };

    loadPerson();
  }, [params.id]);

  const handleShowClick = (id: number, mediaType: string) => {
    router.push(`/shows/${id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-text-secondary">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-lg">{error}</p>
      </div>
    );
  }

  if (!person) return null;

  // Get known for shows/movies, sorted by popularity
  const knownFor = person.combined_credits?.cast
    ?.sort((a: any, b: any) => b.popularity - a.popularity)
    .slice(0, 12) || [];

  // Get all acting credits sorted by release date
  const actingCredits = person.combined_credits?.cast
    ?.sort((a: any, b: any) => {
      const dateA = new Date(a.release_date || a.first_air_date || '');
      const dateB = new Date(b.release_date || b.first_air_date || '');
      return dateB.getTime() - dateA.getTime();
    }) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Person header */}
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        {/* Profile image */}
        <div className="w-full md:w-1/3 lg:w-1/4">
          {person.profile_path ? (
            <img
              src={`https://image.tmdb.org/t/p/w500${person.profile_path}`}
              alt={person.name}
              className="w-full rounded-lg shadow-lg"
            />
          ) : (
            <div className="w-full aspect-[2/3] bg-background-secondary rounded-lg flex items-center justify-center text-text-secondary">
              No Image Available
            </div>
          )}
        </div>

        {/* Person info */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-4">{person.name}</h1>
          
          {person.birthday && (
            <div className="mb-3">
              <span className="text-text-secondary">Born: </span>
              {new Date(person.birthday).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
              {person.place_of_birth && ` in ${person.place_of_birth}`}
            </div>
          )}
          
          {person.deathday && (
            <div className="mb-3">
              <span className="text-text-secondary">Died: </span>
              {new Date(person.deathday).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          )}

          {person.known_for_department && (
            <div className="mb-3">
              <span className="text-text-secondary">Known for: </span>
              {person.known_for_department}
            </div>
          )}

          {person.biography && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-3">Biography</h2>
              <p className="text-text-secondary whitespace-pre-line">{person.biography}</p>
            </div>
          )}
        </div>
      </div>

      {/* Known For section */}
      {knownFor.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Known For</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {knownFor.map((credit: any) => (
              <div
                key={`${credit.id}-${credit.media_type}`}
                onClick={() => handleShowClick(credit.id, credit.media_type)}
                className="cursor-pointer group"
              >
                {credit.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w300${credit.poster_path}`}
                    alt={credit.title || credit.name}
                    className="w-full rounded shadow-md group-hover:shadow-lg transition-shadow duration-200"
                  />
                ) : (
                  <div className="w-full aspect-[2/3] bg-background-secondary rounded flex items-center justify-center text-text-secondary text-sm">
                    No Image
                  </div>
                )}
                <h3 className="mt-2 text-sm font-medium group-hover:text-accent-primary truncate">
                  {credit.title || credit.name}
                </h3>
                <p className="text-xs text-text-secondary">
                  {new Date(credit.release_date || credit.first_air_date || '').getFullYear() || 'N/A'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Acting Credits section */}
      {actingCredits.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-6">Acting Credits</h2>
          <div className="space-y-4">
            {actingCredits.map((credit: any) => (
              <div
                key={`${credit.id}-${credit.media_type}`}
                onClick={() => handleShowClick(credit.id, credit.media_type)}
                className="flex items-center gap-4 p-4 rounded-lg bg-background-secondary/50 hover:bg-background-secondary cursor-pointer transition-colors"
              >
                {credit.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w92${credit.poster_path}`}
                    alt={credit.title || credit.name}
                    className="w-16 h-24 object-cover rounded"
                  />
                ) : (
                  <div className="w-16 h-24 bg-background-secondary rounded flex items-center justify-center text-text-secondary text-xs">
                    No Image
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-medium hover:text-accent-primary">
                    {credit.title || credit.name}
                  </h3>
                  {credit.character && (
                    <p className="text-sm text-text-secondary">as {credit.character}</p>
                  )}
                  <p className="text-sm text-text-secondary mt-1">
                    {new Date(credit.release_date || credit.first_air_date || '').getFullYear() || 'N/A'} 
                    {credit.media_type === 'tv' ? ' · TV Show' : ' · Movie'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}