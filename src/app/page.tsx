'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import FloatingPosters from './components/FloatingPosters';
import CinematicNav from './components/CinematicNav';
import { ChevronRight } from 'lucide-react';
import { Space_Grotesk } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' });

// Custom cursor for magnetic effect
function CustomCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hover, setHover] = useState(false);
  useEffect(() => {
    const move = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    const over = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      setHover(!!el.closest('button') || !!el.closest('a') || !!el.closest('.interactive'));
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseover', over);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseover', over); };
  }, []);
  return (
    <div className="fixed pointer-events-none z-[100] mix-blend-difference" style={{ left: pos.x, top: pos.y, transform: `translate(-50%,-50%) scale(${hover ? 2.4 : 1})` }}>
      <div className="w-4 h-4 bg-white rounded-full opacity-80" />
      <div className={`absolute inset-0 rounded-full border border-white opacity-40 transition-all duration-300 ${hover ? 'scale-150 animate-pulse' : 'scale-100'}`} />
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
    setRot({ x: ((y - r.height / 2) / (r.height / 2)) * -10, y: ((x - r.width / 2) / (r.width / 2)) * 10 });
    setHov(true);
  };
  const onLeave = () => { setHov(false); setRot({ x: 0, y: 0 }); };
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className={`relative transition-all duration-200 [transform-style:preserve-3d] ${className || ''}`} style={{ perspective: '1000px' }}>
      <div className="w-full h-full transition-transform duration-100 ease-linear shadow-xl interactive" style={{ transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg) scale(${hov ? 1.05 : 1})` }}>
        {children}
        <div className="absolute inset-0 pointer-events-none opacity-0" style={{ opacity: hov ? 0.3 : 0, background: 'linear-gradient(125deg,transparent 40%,rgba(255,255,255,0.4) 45%,transparent 50%)', backgroundSize: '200% 200%', backgroundPosition: hov ? '100% 100%' : '0% 0%', transition: 'background-position .5s ease-out, opacity .3s ease' }} />
      </div>
    </div>
  );
}

function HeroSection({ router }: { router: ReturnType<typeof useRouter> }) {
  return (
    <div className="px-6 max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center pt-12 pb-20 fade-up">
      <div className="flex-1 space-y-10 lg:pt-12 text-center lg:text-left z-20">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-red-500/20 bg-red-900/10 text-xs tracking-wider uppercase text-red-400 font-bold mb-4 shadow-[0_0_15px_rgba(220,38,38,0.1)]">
            <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" /></span>
            System Online v2.5
          </div>
          <h1 data-text="Streamline" className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tighter leading-[0.9] text-glitch">
            Streamline<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-100 via-gray-300 to-gray-600">Your Reality.</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">Stop switching apps. Track your movies, TV shows, anime, and books in one centralized, brutally efficient dashboard.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
          <button onClick={() => router.push('/shows')} className="interactive relative px-8 py-4 bg-red-600 text-white font-bold tracking-wide transition-all overflow-hidden rounded-sm hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(220,38,38,0.3)]">
            <span className="relative flex items-center gap-2">Start Tracking <ChevronRight className="w-4 h-4" /></span>
          </button>
          <button onClick={() => router.push('/watchlist')} className="interactive px-8 py-4 border border-white/20 text-white font-medium tracking-wide transition-all bg-black/50 backdrop-blur-sm rounded-sm hover:bg-white/5 hover:scale-105 active:scale-95">My Watchlist</button>
        </div>
      </div>
      <div className="flex-1 w-full max-w-2xl relative z-10 mt-12 lg:mt-0">
        <div className="absolute inset-0 bg-gradient-to-tr from-red-600/20 to-purple-600/20 blur-[80px] rounded-full animate-pulse" />
        <TiltCard className="absolute top-0 right-0 w-[60%] z-20">
          <div className="relative rounded-xl overflow-hidden border border-white/10 bg-[#111]">
            <div className="aspect-[2/3] relative bg-[#a81e1e]">
              <img src="https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=2070&auto=format&fit=crop" alt="Poster" className="w-full h-full object-cover mix-blend-overlay opacity-60 grayscale transition-all duration-700" />
              <div className="absolute inset-0 flex flex-col justify-between p-6">
                <div className="text-yellow-400 font-serif text-5xl font-bold tracking-tighter drop-shadow-2xl text-center mt-4 uppercase border-4 border-yellow-400 p-2 -rotate-2">PULP<br />FICTION</div>
              </div>
            </div>
            <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-md p-3 rounded-lg border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2"><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" /></span><span className="text-[10px] font-bold uppercase tracking-wider text-gray-200">Watching</span></div>
              <span className="text-[10px] font-mono text-red-400 animate-pulse">01:24:10</span>
            </div>
          </div>
        </TiltCard>
        <TiltCard className="absolute top-20 left-0 w-[55%] z-30">
          <div className="bg-[#0f0f0f]/90 backdrop-blur-xl border border-white/10 rounded-xl p-5 font-mono text-sm">
            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2"><span className="uppercase tracking-widest text-gray-500 text-[10px]">Active List</span><div className="flex gap-1"><div className="w-2 h-2 rounded-full bg-red-500/50" /><div className="w-2 h-2 rounded-full bg-yellow-500/50" /><div className="w-2 h-2 rounded-full bg-green-500/50" /></div></div>
            <div className="space-y-3">
              {[{ title: '2001: A Space Odyssey', checked: true }, { title: 'Blade Runner 2049', checked: false }, { title: 'Seven Samurai', checked: false }].map((it, i) => (
                <div key={i} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded transition-colors cursor-pointer group">
                  <div className={`w-4 h-4 border border-white/30 flex items-center justify-center rounded-sm transition-all ${it.checked ? 'bg-red-600 border-red-600' : 'group-hover:border-white'}`}>{it.checked && <div className="w-2 h-2 bg-white rounded-[1px]" />}</div>
                  <span className={`${it.checked ? 'text-gray-600 line-through' : 'text-gray-300'} truncate group-hover:text-white`}>{it.title}</span>
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
    const onMouseMove = (e: MouseEvent) => { if (containerRef.current) { containerRef.current.style.setProperty('--mouse-x', `${e.clientX}px`); containerRef.current.style.setProperty('--mouse-y', `${e.clientY}px`); } };
    window.addEventListener('mousemove', onMouseMove);
    return () => { window.removeEventListener('mousemove', onMouseMove); };
  }, []);

  return (
    <div ref={containerRef} className={`${spaceGrotesk.variable} font-[var(--font-space-grotesk)] min-h-screen bg-background-primary text-text-primary relative overflow-hidden cursor-none`}>
      <CustomCursor />
      <FloatingPosters />
      {/* Ambient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-red-900/20 rounded-full blur-[120px] animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-[35vw] h-[35vw] bg-blue-900/10 rounded-full blur-[100px] animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-10%] left-[20%] w-[45vw] h-[45vw] bg-purple-900/10 rounded-full blur-[120px] animate-blob animation-delay-4000" />
      </div>
      {/* Noise */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.05] z-[1] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
      {/* Spotlight grid */}
      <div className="fixed inset-0 pointer-events-none z-[2]" style={{ backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '4rem 4rem', maskImage: 'radial-gradient(circle 600px at var(--mouse-x, 50%) var(--mouse-y, 50%), black, transparent)', WebkitMaskImage: 'radial-gradient(circle 600px at var(--mouse-x, 50%) var(--mouse-y, 50%), black, transparent)' }} />
      
      {/* Navigation - use shared CinematicNav */}
      <CinematicNav transparent />
      
      <main className="relative z-10 pt-24 min-h-screen flex flex-col"><HeroSection router={router} /></main>
      <style jsx global>{`
        @keyframes blob {0%{transform:translate(0,0) scale(1);}33%{transform:translate(30px,-50px) scale(1.1);}66%{transform:translate(-20px,20px) scale(.9);}100%{transform:translate(0,0) scale(1);}}
        .animate-blob{animation:blob 10s infinite;}
        .animation-delay-2000{animation-delay:2s;}
        .animation-delay-4000{animation-delay:4s;}
        .text-glitch{position:relative;}
        .text-glitch:before,.text-glitch:after{content:attr(data-text);position:absolute;top:0;left:0;width:100%;height:100%;background:#020202;}
        .text-glitch:before{left:2px;text-shadow:-1px 0 #ff00c1;clip-path:inset(44% 0 61% 0);animation:glitch-anim 2.5s infinite linear alternate-reverse;}
        .text-glitch:after{left:-2px;text-shadow:-1px 0 #00fff9;clip-path:inset(54% 0 21% 0);animation:glitch-anim2 3s infinite linear alternate-reverse;}
        @keyframes glitch-anim{0%{clip-path:inset(86% 0 9% 0);}20%{clip-path:inset(16% 0 54% 0);}40%{clip-path:inset(48% 0 36% 0);}60%{clip-path:inset(6% 0 77% 0);}80%{clip-path:inset(93% 0 5% 0);}100%{clip-path:inset(23% 0 68% 0);}}
        @keyframes glitch-anim2{0%{clip-path:inset(22% 0 35% 0);}20%{clip-path:inset(67% 0 11% 0);}40%{clip-path:inset(9% 0 83% 0);}60%{clip-path:inset(98% 0 2% 0);}80%{clip-path:inset(40% 0 17% 0);}100%{clip-path:inset(66% 0 16% 0);}}
        .fade-up{animation:fadeUp .6s cubic-bezier(.16,1,.3,1) forwards;opacity:0;transform:translateY(20px);}
        @keyframes fadeUp{to{opacity:1;transform:translateY(0);}}
      `}</style>
    </div>
  );
}
