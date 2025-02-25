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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background-secondary/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-accent-primary">
              Streamline
            </Link>
          </div>
          <div className="hidden sm:block">
            <div className="flex space-x-4">
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                      ? 'bg-background-tertiary text-text-primary'
                      : 'text-text-secondary hover:bg-background-tertiary hover:text-text-primary'
                    }`}
                  >
                    {link.label}
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