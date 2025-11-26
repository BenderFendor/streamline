'use client';

import React, { useEffect, useRef, useState } from 'react';
import FloatingPosters from './FloatingPosters';

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
      style={{ 
        left: pos.x, 
        top: pos.y, 
        transform: `translate(-50%,-50%) scale(${hover ? 2.2 : 1})`,
        transition: 'transform 0.2s cubic-bezier(0.19, 1, 0.22, 1)'
      }}
    >
      <div className="w-3.5 h-3.5 bg-white rounded-full opacity-90" />
      <div className={`absolute inset-0 rounded-full border border-white/60 transition-all duration-300 ease-out-expo ${hover ? 'scale-[2] opacity-30' : 'scale-100 opacity-0'}`} />
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
      className="font-body min-h-screen bg-[#030303] text-white relative overflow-x-hidden selection:bg-accent-primary/80 selection:text-white md:cursor-none"
    >
      <CustomCursor />
      
      {showFloatingPosters && <FloatingPosters />}
      
      {/* Ambient gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-15%] left-[-10%] w-[50vw] h-[50vw] bg-accent-primary/[0.08] rounded-full blur-[150px] animate-blob" />
        <div className="absolute top-[30%] right-[-15%] w-[40vw] h-[40vw] bg-accent-secondary/[0.05] rounded-full blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-20%] left-[30%] w-[45vw] h-[45vw] bg-accent-tertiary/[0.04] rounded-full blur-[140px] animate-blob animation-delay-4000" />
      </div>
      
      {/* Refined noise texture */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.025] z-[1]" 
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` 
        }} 
      />
      
      {/* Interactive spotlight grid */}
      <div 
        className="fixed inset-0 pointer-events-none z-[2]" 
        style={{ 
          backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)', 
          backgroundSize: '5rem 5rem', 
          maskImage: 'radial-gradient(ellipse 700px 500px at var(--mouse-x, 50%) var(--mouse-y, 50%), black, transparent)', 
          WebkitMaskImage: 'radial-gradient(ellipse 700px 500px at var(--mouse-x, 50%) var(--mouse-y, 50%), black, transparent)' 
        }} 
      />

      {/* Vignette effect */}
      <div 
        className="fixed inset-0 pointer-events-none z-[3]" 
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, transparent 50%, rgba(0,0,0,0.4) 100%)'
        }}
      />

      {/* Main content */}
      <main className="relative z-10">
        {children}
      </main>

      <style jsx global>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(30px, -40px) scale(1.05); }
          50% { transform: translate(-25px, 25px) scale(0.95); }
          75% { transform: translate(35px, 35px) scale(1.02); }
        }
        .animate-blob { animation: blob 25s ease-in-out infinite; }
        .animation-delay-2000 { animation-delay: 3s; }
        .animation-delay-4000 { animation-delay: 6s; }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .animate-float { animation: float 8s ease-in-out infinite; }
        
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.8s cubic-bezier(0.19, 1, 0.22, 1) forwards; }
      `}</style>
    </div>
  );
}
