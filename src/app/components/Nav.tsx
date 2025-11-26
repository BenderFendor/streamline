'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavLink = {
  href: string;
  label: string;
};

const links: NavLink[] = [
  { href: '/', label: 'Home' },
  { href: '/shows', label: 'Shows' },
  { href: '/anime', label: 'Anime' },
  { href: '/books', label: 'Books' },
  { href: '/watchlist', label: 'Watchlist' },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background-secondary/70 backdrop-blur-2xl border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-display font-semibold tracking-tight text-accent-primary hover:opacity-80 transition-opacity duration-300">
              Streamline
            </Link>
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-1">
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ease-out-expo ${isActive
                      ? 'text-white bg-white/[0.08]'
                      : 'text-text-secondary hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-gradient-to-r from-accent-primary to-red-500 rounded-full" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}