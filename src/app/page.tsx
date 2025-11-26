'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import FloatingPosters from './components/FloatingPosters';
import CinematicNav from './components/CinematicNav';
import { ChevronRight } from 'lucide-react';

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
      setHover(!!el.closest('button') || !!el.closest('a') || !!el.closest('.interactive'));
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
      <div className={`absolute inset-0 rounded-full border border-white/60 transition-all duration-300 ${hover ? 'scale-[2] opacity-30' : 'scale-100 opacity-0'}`} />
    </div>
  );
}

// Tilt card wrapper
function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const [rot, setRot] = useState({ x: 0, y: 0 });
  const [hov, setHov] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    setRot({ x: ((y - r.height / 2) / (r.height / 2)) * -8, y: ((x - r.width / 2) / (r.width / 2)) * 8 });
    setHov(true);
  };
  const onLeave = () => { setHov(false); setRot({ x: 0, y: 0 }); };
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className={`relative transition-all duration-300 [transform-style:preserve-3d] ${className || ''}`} style={{ perspective: '1000px' }}>
      <div className="w-full h-full transition-transform duration-200 ease-out-expo shadow-elevated interactive" style={{ transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg) scale(${hov ? 1.03 : 1})` }}>
        {children}
        <div className="absolute inset-0 pointer-events-none rounded-2xl opacity-0" style={{ opacity: hov ? 0.2 : 0, background: 'linear-gradient(125deg,transparent 40%,rgba(255,255,255,0.4) 45%,transparent 50%)', backgroundSize: '200% 200%', backgroundPosition: hov ? '100% 100%' : '0% 0%', transition: 'background-position .5s ease-out, opacity .3s ease' }} />
      </div>
    </div>
  );
}

function HeroSection({ router }: { router: ReturnType<typeof useRouter> }) {
  return (
    <div className="px-6 max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center pt-12 pb-20 fade-up">
      <div className="flex-1 space-y-10 lg:pt-12 text-center lg:text-left z-20">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent-primary/20 bg-accent-primary/5 text-xs tracking-widest uppercase text-accent-primary font-semibold mb-4 shadow-glow backdrop-blur-sm">
            <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-primary opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-accent-primary" /></span>
            System Online v2.5
          </div>
          <h1 data-text="Streamline" className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-[0.95] text-glitch">
            Streamline<br />
            <span className="text-gradient">Your Reality.</span>
          </h1>
          <p className="text-lg text-text-secondary max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
            Stop switching apps. Track your movies, TV shows, anime, and books in one centralized, brutally efficient dashboard.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
          <button onClick={() => router.push('/shows')} className="interactive btn-primary group">
            <span className="relative flex items-center gap-2 font-semibold">
              Start Tracking 
              <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </button>
          <button onClick={() => router.push('/watchlist')} className="interactive btn-secondary font-medium">
            My Watchlist
          </button>
        </div>
      </div>
      <div className="flex-1 w-full max-w-2xl relative z-10 mt-12 lg:mt-0">
        <div className="absolute inset-0 bg-gradient-to-tr from-accent-primary/15 to-accent-tertiary/15 blur-[100px] rounded-full animate-pulse-slow" />
        <TiltCard className="absolute top-0 right-0 w-[60%] z-20">
          <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-[#111] shadow-elevated">
            <div className="aspect-[2/3] relative bg-[#a81e1e]">
              <img src="https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=2070&auto=format&fit=crop" alt="Poster" className="w-full h-full object-cover mix-blend-overlay opacity-60 grayscale transition-all duration-700" />
              <div className="absolute inset-0 flex flex-col justify-between p-6">
                <div className="text-yellow-400 font-display text-4xl sm:text-5xl font-bold tracking-tight drop-shadow-2xl text-center mt-4 uppercase border-4 border-yellow-400 p-2 -rotate-2">PULP<br />FICTION</div>
              </div>
            </div>
            <div className="absolute bottom-4 left-4 right-4 glass-card p-3 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-success opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-success" />
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-text-secondary">Watching</span>
              </div>
              <span className="text-[10px] font-mono text-accent-primary animate-pulse-slow">01:24:10</span>
            </div>
          </div>
        </TiltCard>
        <TiltCard className="absolute top-20 left-0 w-[55%] z-30">
          <div className="glass-card rounded-2xl p-5 text-sm shadow-elevated">
            <div className="flex justify-between items-center mb-4 border-b border-white/[0.06] pb-3">
              <span className="uppercase tracking-widest text-text-tertiary text-[10px] font-semibold">Active List</span>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-accent-primary/50" />
                <div className="w-2 h-2 rounded-full bg-accent-warning/50" />
                <div className="w-2 h-2 rounded-full bg-accent-success/50" />
              </div>
            </div>
            <div className="space-y-2">
              {[{ title: '2001: A Space Odyssey', checked: true }, { title: 'Blade Runner 2049', checked: false }, { title: 'Seven Samurai', checked: false }].map((it, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 hover:bg-white/[0.04] rounded-xl transition-all duration-300 cursor-pointer group">
                  <div className={`w-4 h-4 border border-white/20 flex items-center justify-center rounded transition-all duration-300 ${it.checked ? 'bg-accent-primary border-accent-primary' : 'group-hover:border-white/40'}`}>
                    {it.checked && <div className="w-2 h-2 bg-white rounded-[2px]" />}
                  </div>
                  <span className={`font-mono text-xs ${it.checked ? 'text-text-tertiary line-through' : 'text-text-secondary'} truncate group-hover:text-white transition-colors duration-300`}>{it.title}</span>
                </div>
              ))}
            </div>
          </div>
        </TiltCard>
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => { 
      if (containerRef.current) { 
        containerRef.current.style.setProperty('--mouse-x', `${e.clientX}px`); 
        containerRef.current.style.setProperty('--mouse-y', `${e.clientY}px`); 
      } 
    };
    window.addEventListener('mousemove', onMouseMove);
    return () => { window.removeEventListener('mousemove', onMouseMove); };
  }, []);

  return (
    <div ref={containerRef} className="font-body min-h-screen bg-[#030303] text-white relative overflow-hidden md:cursor-none selection:bg-accent-primary/80 selection:text-white">
      <CustomCursor />
      <FloatingPosters />
      
      {/* Ambient gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-15%] left-[-10%] w-[50vw] h-[50vw] bg-accent-primary/[0.08] rounded-full blur-[150px] animate-blob" />
        <div className="absolute top-[30%] right-[-15%] w-[40vw] h-[40vw] bg-accent-secondary/[0.05] rounded-full blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-20%] left-[30%] w-[45vw] h-[45vw] bg-accent-tertiary/[0.04] rounded-full blur-[140px] animate-blob animation-delay-4000" />
      </div>
      
      {/* Refined noise texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.025] z-[1]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
      
      {/* Interactive spotlight grid */}
      <div className="fixed inset-0 pointer-events-none z-[2]" style={{ backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '5rem 5rem', maskImage: 'radial-gradient(ellipse 700px 500px at var(--mouse-x, 50%) var(--mouse-y, 50%), black, transparent)', WebkitMaskImage: 'radial-gradient(ellipse 700px 500px at var(--mouse-x, 50%) var(--mouse-y, 50%), black, transparent)' }} />
      
      {/* Vignette effect */}
      <div className="fixed inset-0 pointer-events-none z-[3]" style={{ background: 'radial-gradient(ellipse at center, transparent 0%, transparent 50%, rgba(0,0,0,0.4) 100%)' }} />
      
      {/* Navigation */}
      <CinematicNav transparent />
      
      <main className="relative z-10 pt-24 min-h-screen flex flex-col">
        <HeroSection router={router} />
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
        
        .text-glitch { position: relative; }
        .text-glitch:before, .text-glitch:after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #030303;
        }
        .text-glitch:before {
          left: 2px;
          text-shadow: -1px 0 #ff00c1;
          clip-path: inset(44% 0 61% 0);
          animation: glitch-anim 2.5s infinite linear alternate-reverse;
        }
        .text-glitch:after {
          left: -2px;
          text-shadow: -1px 0 #00fff9;
          clip-path: inset(54% 0 21% 0);
          animation: glitch-anim2 3s infinite linear alternate-reverse;
        }
        @keyframes glitch-anim {
          0% { clip-path: inset(86% 0 9% 0); }
          20% { clip-path: inset(16% 0 54% 0); }
          40% { clip-path: inset(48% 0 36% 0); }
          60% { clip-path: inset(6% 0 77% 0); }
          80% { clip-path: inset(93% 0 5% 0); }
          100% { clip-path: inset(23% 0 68% 0); }
        }
        @keyframes glitch-anim2 {
          0% { clip-path: inset(22% 0 35% 0); }
          20% { clip-path: inset(67% 0 11% 0); }
          40% { clip-path: inset(9% 0 83% 0); }
          60% { clip-path: inset(98% 0 2% 0); }
          80% { clip-path: inset(40% 0 17% 0); }
          100% { clip-path: inset(66% 0 16% 0); }
        }
        
        .fade-up {
          animation: fadeUp 0.8s cubic-bezier(0.19, 1, 0.22, 1) forwards;
          opacity: 0;
          transform: translateY(30px);
        }
        @keyframes fadeUp {
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
