'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface CinematicNavProps {
  transparent?: boolean;
}

export default function CinematicNav({ transparent = false }: CinematicNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname?.startsWith(path);
  };

  const navLinks = [
    { path: '/', label: 'Home', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
      </svg>
    )},
    { path: '/shows', label: 'Shows', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2h6v4H7V5zm8 8v2h1v-2h-1zm-2-2H7v4h6v-4zm2 0h1V9h-1v2zm1-4V5h-1v2h1zM5 5v2H4V5h1zm0 4H4v2h1V9zm-1 4h1v2H4v-2z" clipRule="evenodd" />
      </svg>
    )},
    { path: '/anime', label: 'Anime', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" viewBox="0 0 20 20" fill="currentColor">
        <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
      </svg>
    )},
    { path: '/watchlist', label: 'Watchlist', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" viewBox="0 0 20 20" fill="currentColor">
        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
      </svg>
    )},
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ease-out-expo ${
      scrolled || !transparent
        ? 'bg-black/70 backdrop-blur-2xl border-b border-white/[0.06] py-3' 
        : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3 interactive">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-accent-primary to-red-700 flex items-center justify-center shadow-glow transition-all duration-400 ease-out-expo group-hover:shadow-glow-lg group-hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-transparent to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <span className="text-lg font-display font-semibold tracking-tight hidden sm:block">Streamline</span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-0.5 glass-card rounded-2xl p-1.5">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => router.push(link.path)}
              className={`interactive relative flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ease-out-expo overflow-hidden ${
                isActive(link.path) 
                  ? 'text-white' 
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              {isActive(link.path) && (
                <div className="absolute inset-0 bg-white/[0.08] rounded-xl" />
              )}
              <span className="relative z-10 transition-transform duration-300 ease-out-expo group-hover:scale-110">{link.icon}</span>
              <span className="hidden sm:inline text-sm font-medium relative z-10 tracking-wide">{link.label}</span>
              {isActive(link.path) && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-gradient-to-r from-accent-primary to-red-500 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Right side - search hint */}
        <div className="hidden md:flex items-center gap-3">
          <div className="text-sm text-text-tertiary flex items-center gap-2 hover:text-text-secondary transition-colors duration-300 cursor-pointer interactive">
            <kbd className="px-2 py-1 glass-card rounded-lg text-xs font-mono font-medium tracking-wide">⌘K</kbd>
            <span className="font-medium">Search</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
