'use client';

import { useEffect, useState } from 'react';
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

  if (isLoading) {
    return <div className="w-full h-full bg-background-primary" />;
  }

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-background-primary">
      <div className="absolute inset-0 flex flex-wrap justify-center items-center gap-8 opacity-20">
        {posters.map((poster, index) => {
          const randomRotate = Math.random() * 20 - 10; // Random rotation between -10 and 10 degrees
          const randomDelay = Math.random() * 5; // Random delay between 0 and 5s
          const randomDuration = 15 + Math.random() * 10; // Random duration between 15 and 25s

          return (
            <div
              key={poster.id}
              className="relative w-48 h-72 transform-gpu transition-all duration-1000 ease-in-out hover:scale-110 hover:opacity-80"
              style={{
                animation: `float ${randomDuration}s ease-in-out ${randomDelay}s infinite`,
                transform: `rotate(${randomRotate}deg)`,
                perspective: '1000px',
              }}
            >
              <div 
                className="w-full h-full rounded-xl overflow-hidden shadow-2xl transition-transform duration-500 ease-in-out hover:rotate-y-12"
                style={{
                  backfaceVisibility: 'hidden',
                  transformStyle: 'preserve-3d',
                }}
              >
                <Image
                  src={poster.imageUrl}
                  alt={poster.title}
                  fill
                  className="object-cover rounded-xl"
                  sizes="(max-width: 192px) 100vw, 192px"
                  priority={index < 4}
                />
              </div>
            </div>
          );
        })}
      </div>
      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-20px) translateX(10px);
          }
          50% {
            transform: translateY(0) translateX(20px);
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

        .hover\\:rotate-y-12:hover {
          transform: rotateY(12deg);
        }
      `}</style>
    </div>
  );
}