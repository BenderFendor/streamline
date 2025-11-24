'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Space_Grotesk } from 'next/font/google';
import FloatingPosters from './FloatingPosters';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' });

interface PageWrapperProps {
  children: React.ReactNode;
  showFloatingPosters?: boolean;
}

// Custom cursor for magnetic effect
function CustomCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hover, setHover] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };
    const over = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      setHover(!!el.closest('button') || !!el.closest('a') || !!el.closest('.interactive') || !!el.closest('[role="button"]'));
    };
    const leave = () => setIsVisible(false);
    
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseover', over);
    document.addEventListener('mouseleave', leave);
    
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseover', over);
      document.removeEventListener('mouseleave', leave);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed pointer-events-none z-[100] mix-blend-difference hidden md:block" 
      style={{ left: pos.x, top: pos.y, transform: `translate(-50%,-50%) scale(${hover ? 2.4 : 1})` }}
    >
      <div className="w-4 h-4 bg-white rounded-full opacity-80 transition-transform duration-200" />
      <div className={`absolute inset-0 rounded-full border border-white opacity-40 transition-all duration-300 ${hover ? 'scale-150 animate-pulse' : 'scale-100'}`} />
    </div>
  );
}

export default function PageWrapper({ children, showFloatingPosters = true }: PageWrapperProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        containerRef.current.style.setProperty('--mouse-x', `${e.clientX}px`);
        containerRef.current.style.setProperty('--mouse-y', `${e.clientY}px`);
      }
    };
    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={`${spaceGrotesk.variable} font-[var(--font-space-grotesk)] min-h-screen bg-[#050505] text-white relative overflow-x-hidden selection:bg-red-500 selection:text-white md:cursor-none`}
    >
      <CustomCursor />
      
      {showFloatingPosters && <FloatingPosters />}
      
      {/* Ambient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-red-900/20 rounded-full blur-[120px] animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-[35vw] h-[35vw] bg-blue-900/10 rounded-full blur-[100px] animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-10%] left-[20%] w-[45vw] h-[45vw] bg-purple-900/10 rounded-full blur-[120px] animate-blob animation-delay-4000" />
      </div>
      
      {/* Noise texture */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.04] z-[1] mix-blend-overlay" 
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` 
        }} 
      />
      
      {/* Spotlight grid */}
      <div 
        className="fixed inset-0 pointer-events-none z-[2]" 
        style={{ 
          backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)', 
          backgroundSize: '4rem 4rem', 
          maskImage: 'radial-gradient(circle 600px at var(--mouse-x, 50%) var(--mouse-y, 50%), black, transparent)', 
          WebkitMaskImage: 'radial-gradient(circle 600px at var(--mouse-x, 50%) var(--mouse-y, 50%), black, transparent)' 
        }} 
      />

      {/* Main content */}
      <main className="relative z-10">
        {children}
      </main>

      <style jsx global>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -30px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(30px, 30px) scale(1.05); }
        }
        .animate-blob { animation: blob 20s ease-in-out infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.8s ease-out forwards; }
      `}</style>
    </div>
  );
}
