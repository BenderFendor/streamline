'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { fetchPersonDetails } from '../../lib/api';
import PageWrapper from '../../components/PageWrapper';
import CinematicNav from '../../components/CinematicNav';

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
  const [showFullBio, setShowFullBio] = useState(false);

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
    router.push(`/shows/${id}?type=${mediaType}`);
  };

  if (loading) {
    return (
      <PageWrapper>
        <CinematicNav />
        <div className="flex justify-center items-center min-h-screen">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <CinematicNav />
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-gray-400">
          <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-lg">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors"
          >
            Go Back
          </button>
        </div>
      </PageWrapper>
    );
  }

  if (!person) return null;

  const knownFor = person.combined_credits?.cast
    ?.sort((a: any, b: any) => b.popularity - a.popularity)
    .slice(0, 12) || [];

  const actingCredits = person.combined_credits?.cast
    ?.sort((a: any, b: any) => {
      const dateA = new Date(a.release_date || a.first_air_date || '');
      const dateB = new Date(b.release_date || b.first_air_date || '');
      return dateB.getTime() - dateA.getTime();
    }) || [];

  return (
    <PageWrapper showFloatingPosters={false}>
      <CinematicNav />
      
      <div className="pt-28 pb-20 px-6 max-w-7xl mx-auto">
        {/* Person Header */}
        <div className="flex flex-col lg:flex-row gap-12 mb-16 fade-up">
          {/* Profile Image */}
          <div className="w-full lg:w-1/3 xl:w-1/4">
            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              {person.profile_path ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w500${person.profile_path}`}
                  alt={person.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Person Info */}
          <div className="flex-1 lg:pt-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs tracking-wider uppercase text-red-500 font-semibold mb-4">
              <span className="w-2 h-2 rounded-full bg-red-600" /> 
              {person.known_for_department || 'Actor'}
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter leading-tight mb-6">
              {person.name}
            </h1>
            
            {/* Stats */}
            <div className="flex flex-wrap gap-6 mb-8 pb-8 border-b border-white/10">
              {person.birthday && (
                <div>
                  <div className="text-sm text-gray-500 uppercase tracking-wider mb-1">Born</div>
                  <div className="font-medium">
                    {new Date(person.birthday).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              )}
              {person.place_of_birth && (
                <div>
                  <div className="text-sm text-gray-500 uppercase tracking-wider mb-1">Birthplace</div>
                  <div className="font-medium">{person.place_of_birth}</div>
                </div>
              )}
              {person.deathday && (
                <div>
                  <div className="text-sm text-gray-500 uppercase tracking-wider mb-1">Died</div>
                  <div className="font-medium">
                    {new Date(person.deathday).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              )}
              {actingCredits.length > 0 && (
                <div>
                  <div className="text-sm text-gray-500 uppercase tracking-wider mb-1">Credits</div>
                  <div className="font-medium">{actingCredits.length} titles</div>
                </div>
              )}
            </div>

            {/* Biography */}
            {person.biography && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Biography</h2>
                <div className="relative">
                  <p className={`text-gray-400 leading-relaxed whitespace-pre-line ${!showFullBio && person.biography.length > 500 ? 'line-clamp-4' : ''}`}>
                    {person.biography}
                  </p>
                  {person.biography.length > 500 && (
                    <button
                      onClick={() => setShowFullBio(!showFullBio)}
                      className="mt-2 text-red-500 hover:text-red-400 text-sm font-medium transition-colors"
                    >
                      {showFullBio ? 'Show less' : 'Read more'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Known For Section */}
        {knownFor.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Known For</h2>
              <span className="text-sm text-gray-500">{knownFor.length} popular titles</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {knownFor.map((credit: any) => (
                <div
                  key={`${credit.id}-${credit.media_type}`}
                  onClick={() => handleShowClick(credit.id, credit.media_type)}
                  className="group cursor-pointer rounded-xl overflow-hidden border border-white/10 bg-[#0f0f0f] hover:shadow-2xl hover:shadow-red-900/10 transition-all duration-300 hover:-translate-y-1 interactive"
                >
                  <div className="relative aspect-[2/3]">
                    {credit.poster_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w300${credit.poster_path}`}
                        alt={credit.title || credit.name}
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
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm truncate group-hover:text-red-400 transition-colors">
                      {credit.title || credit.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(credit.release_date || credit.first_air_date || '').getFullYear() || 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Acting Credits Section */}
        {actingCredits.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Filmography</h2>
              <span className="text-sm text-gray-500">{actingCredits.length} credits</span>
            </div>
            <div className="space-y-3">
              {actingCredits.map((credit: any) => (
                <div
                  key={`${credit.id}-${credit.media_type}-${credit.credit_id || Math.random()}`}
                  onClick={() => handleShowClick(credit.id, credit.media_type)}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 cursor-pointer transition-all duration-300 group interactive"
                >
                  <div className="relative w-16 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    {credit.poster_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w92${credit.poster_path}`}
                        alt={credit.title || credit.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold group-hover:text-red-400 transition-colors truncate">
                      {credit.title || credit.name}
                    </h3>
                    {credit.character && (
                      <p className="text-sm text-gray-400 truncate">as {credit.character}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      <span>{new Date(credit.release_date || credit.first_air_date || '').getFullYear() || 'N/A'}</span>
                      <span className="w-1 h-1 bg-gray-600 rounded-full" />
                      <span className={`px-2 py-0.5 rounded text-xs ${credit.media_type === 'tv' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                        {credit.media_type === 'tv' ? 'TV Show' : 'Movie'}
                      </span>
                    </div>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 group-hover:text-gray-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </PageWrapper>
  );
}