'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { getPosterData } from '../lib/api';

type Poster = {
  id: string | number;
  title: string;
  imageUrl: string;
  mediaType: 'movie' | 'tv' | 'anime' | 'book';
};

export default function FloatingPosters() {
  const [posters, setPosters] = useState<Poster[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPosters() {
      try {
        const data = await getPosterData();
        setPosters(data);
      } catch (error) {
        console.error('Error loading posters:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadPosters();
  }, []);

  const posterStyles = useMemo(() => {
    return posters.map((poster) => ({
      id: poster.id,
      rotate: (poster.id.toString().charCodeAt(0) % 16) - 8,
      delay: (poster.id.toString().charCodeAt(1) || 0) % 5,
      duration: 20 + ((poster.id.toString().charCodeAt(2) || 0) % 15),
      scale: 0.9 + ((poster.id.toString().charCodeAt(3) || 0) % 20) / 100,
    }));
  }, [posters]);

  if (isLoading) {
    return <div className="w-full h-full bg-background-primary" />;
  }

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-background-primary">
      <div className="absolute inset-0 flex flex-wrap justify-center items-center gap-10 opacity-[0.12]">
        {posters.map((poster, index) => {
          const style = posterStyles[index];

          return (
            <div
              key={poster.id}
              className="relative w-44 h-64 transform-gpu transition-all duration-700 ease-out-expo hover:scale-110 hover:opacity-100 hover:z-10"
              style={{
                animation: `posterFloat ${style.duration}s ease-in-out ${style.delay}s infinite`,
                transform: `rotate(${style.rotate}deg) scale(${style.scale})`,
                perspective: '1000px',
              }}
            >
              <div 
                className="w-full h-full rounded-2xl overflow-hidden shadow-card transition-all duration-500 ease-out-expo hover:shadow-elevated group"
                style={{
                  backfaceVisibility: 'hidden',
                  transformStyle: 'preserve-3d',
                }}
              >
                <Image
                  src={poster.imageUrl}
                  alt={poster.title}
                  fill
                  className="object-cover rounded-2xl transition-transform duration-700 ease-out-expo group-hover:scale-105"
                  sizes="(max-width: 176px) 100vw, 176px"
                  priority={index < 4}
                />
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </div>
          );
        })}
      </div>
      <style jsx global>{`
        @keyframes posterFloat {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-25px) translateX(15px);
          }
          50% {
            transform: translateY(5px) translateX(25px);
          }
          75% {
            transform: translateY(20px) translateX(10px);
          }
        }

        @property --rotate-y {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
      `}</style>
    </div>
  );
}