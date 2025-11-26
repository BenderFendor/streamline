'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Define types for filter values
export type SortOption = 'TRENDING_DESC' | 'POPULARITY_DESC' | 'SCORE_DESC' | 'START_DATE_DESC' | 'EPISODES_DESC' | 'FAVOURITES_DESC';
export type FormatOption = 'TV' | 'MOVIE' | 'OVA' | 'ONA' | 'SPECIAL' | 'MUSIC' | '';
export type StatusOption = 'FINISHED' | 'RELEASING' | 'NOT_YET_RELEASED' | 'CANCELLED' | 'HIATUS' | '';

export type FilterValues = {
  sort: SortOption;
  format: FormatOption;
  status: StatusOption;
  genre: string;
  search: string;
}

type AnimeNavbarProps = {
  headerVisible: boolean;
  searchInput: string;
  setSearchInput: (value: string) => void;
  filterValues: FilterValues;
  onSearch: (e: React.FormEvent) => void;
  onFilterChange: (key: keyof FilterValues, value: string) => void;
  onApplyFilters: () => void;
  onClearSearch: () => void;
  sorts: Record<string, string>;
  formats: Record<string, string>;
  statuses: Record<string, string>;
  genres: string[];
};

const AnimeNavbar: React.FC<AnimeNavbarProps> = ({
  headerVisible,
  searchInput,
  setSearchInput,
  filterValues,
  onSearch,
  onFilterChange,
  onApplyFilters,
  onClearSearch,
  sorts,
  formats,
  statuses,
  genres,
}) => {
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const filterButtonRef = useRef<HTMLDivElement>(null);
  const [filterPosition, setFilterPosition] = useState({ top: 0, right: 0 });
  
  // Update filter dropdown position when button is clicked
  useEffect(() => {
    if (showFilters && filterButtonRef.current) {
      const rect = filterButtonRef.current.getBoundingClientRect();
      setFilterPosition({
        top: rect.bottom + window.scrollY + 8, // Add some spacing
        right: window.innerWidth - rect.right
      });
    }
  }, [showFilters]);
  
  // Close filters dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showFilters && 
        filterButtonRef.current && 
        !filterButtonRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('.filter-dropdown')
      ) {
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilters]);
  
  return (
    <>
      {/* Main navigation bar */}
      <div className="relative mb-6 flex justify-between items-center glass-card p-3 rounded-2xl z-10 transition-all duration-400 ease-out-expo" style={{ top: headerVisible ? 0 : -64 }}>
        <div className="flex items-center gap-1">
          <button
            onClick={() => router.push('/')}
            className="px-3 py-2 rounded-xl hover:bg-white/[0.06] transition-all duration-300 ease-out-expo flex items-center gap-2 text-text-secondary hover:text-white group"
            aria-label="Home"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] transition-transform duration-300 group-hover:scale-110" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span className="hidden sm:inline text-sm font-medium">Home</span>
          </button>
          <button
            onClick={() => router.push('/shows')}
            className="px-3 py-2 rounded-xl hover:bg-white/[0.06] transition-all duration-300 ease-out-expo flex items-center gap-2 text-text-secondary hover:text-white group"
            aria-label="Shows"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] transition-transform duration-300 group-hover:scale-110" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2h6v4H7V5zm8 8v2h1v-2h-1zm-2-2H7v4h6v-4zm2 0h1V9h-1v2zm1-4V5h-1v2h1zM5 5v2H4V5h1zm0 4H4v2h1V9zm-1 4h1v2H4v-2z" clipRule="evenodd" />
            </svg>
            <span className="hidden sm:inline text-sm font-medium">Shows</span>
          </button>
          <button
            onClick={() => router.push('/anime')}
            className="px-3 py-2 rounded-xl bg-accent-primary/15 text-accent-primary font-medium transition-all duration-300 ease-out-expo flex items-center gap-2 group"
            aria-label="Anime"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] transition-transform duration-300 group-hover:scale-110" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
            </svg>
            <span className="hidden sm:inline text-sm">Anime</span>
          </button>
          <button
            onClick={() => router.push('/watchlist')}
            className="px-3 py-2 rounded-xl hover:bg-white/[0.06] transition-all duration-300 ease-out-expo flex items-center gap-2 text-text-secondary hover:text-white group"
            aria-label="Watchlist"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] transition-transform duration-300 group-hover:scale-110" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
            <span className="hidden sm:inline text-sm font-medium">Watchlist</span>
          </button>
        </div>
        <div className="flex items-center gap-3">
          {/* Search bar */}
          <form onSubmit={onSearch} className="relative hidden sm:block">
            <input
              type="text"
              placeholder="Search anime..."
              className="w-56 lg:w-64 py-2.5 pl-10 pr-4 rounded-xl bg-white/[0.04] text-white placeholder:text-text-tertiary border border-white/[0.06] hover:border-white/[0.12] focus:border-accent-primary/50 focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all duration-300 text-sm font-medium"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button 
              type="submit"
              className="absolute inset-y-0 left-0 px-3 flex items-center text-text-tertiary hover:text-accent-primary transition-colors duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>

          {/* Filter button */}
          <div className="relative" ref={filterButtonRef}>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 glass-card text-white px-4 py-2.5 rounded-xl hover:bg-white/[0.08] transition-all duration-300 ease-out-expo group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] text-text-secondary group-hover:text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="text-sm font-medium">Filters</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-4 w-4 text-text-tertiary transition-transform duration-300 ease-out-expo ${showFilters ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Filter dropdown - Positioned absolutely below the filter button with high z-index */}
      {showFilters && (
        <div 
          className="fixed filter-dropdown z-[9999] animate-fadeUp"
          style={{
            top: `${filterPosition.top}px`,
            right: `${filterPosition.right}px`,
            animationDuration: '0.3s',
          }}
        >
          <div className="w-72 glass-card rounded-2xl shadow-elevated p-5">
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <h3 className="font-display font-semibold text-white">Filter Anime</h3>
                <button 
                  onClick={() => setShowFilters(false)}
                  className="p-1.5 hover:bg-white/[0.08] rounded-lg transition-colors duration-300"
                  aria-label="Close filters"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-text-tertiary" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-text-tertiary uppercase tracking-wider mb-2">Sort By</label>
                <select
                  value={filterValues.sort}
                  onChange={(e) => onFilterChange('sort', e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl p-2.5 text-sm text-white focus:border-accent-primary/50 focus:ring-2 focus:ring-accent-primary/20 transition-all duration-300"
                >
                  {Object.entries(sorts).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-text-tertiary uppercase tracking-wider mb-2">Format</label>
                <select
                  value={filterValues.format}
                  onChange={(e) => onFilterChange('format', e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl p-2.5 text-sm text-white focus:border-accent-primary/50 focus:ring-2 focus:ring-accent-primary/20 transition-all duration-300"
                >
                  <option value="">All Formats</option>
                  {Object.entries(formats).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-text-tertiary uppercase tracking-wider mb-2">Status</label>
                <select
                  value={filterValues.status}
                  onChange={(e) => onFilterChange('status', e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl p-2.5 text-sm text-white focus:border-accent-primary/50 focus:ring-2 focus:ring-accent-primary/20 transition-all duration-300"
                >
                  <option value="">All Status</option>
                  {Object.entries(statuses).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-text-tertiary uppercase tracking-wider mb-2">Genre</label>
                <select
                  value={filterValues.genre}
                  onChange={(e) => onFilterChange('genre', e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl p-2.5 text-sm text-white focus:border-accent-primary/50 focus:ring-2 focus:ring-accent-primary/20 transition-all duration-300"
                >
                  <option value="">All Genres</option>
                  {genres.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={() => {
                  onApplyFilters();
                  setShowFilters(false);
                }}
                className="w-full btn-primary text-sm"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Mobile search bar */}
      <div className="sm:hidden mb-4">
        <form onSubmit={onSearch} className="relative">
          <input
            type="text"
            placeholder="Search anime..."
            className="w-full py-2.5 pl-10 pr-4 rounded-xl bg-white/[0.04] text-white placeholder:text-text-tertiary border border-white/[0.06] hover:border-white/[0.12] focus:border-accent-primary/50 focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all duration-300 text-sm"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button 
            type="submit"
            className="absolute inset-y-0 left-0 px-3 flex items-center text-text-tertiary hover:text-accent-primary transition-colors duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>
      </div>

      {/* Active filter chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {/* Sort filter chip */}
        {filterValues.sort !== 'TRENDING_DESC' && sorts[filterValues.sort] && (
          <div className="flex items-center gap-2 bg-accent-primary/10 text-accent-primary px-3 py-1.5 rounded-full text-sm font-medium border border-accent-primary/20 hover:bg-accent-primary/15 transition-colors duration-300">
            <span>{sorts[filterValues.sort]}</span>
            <button
              onClick={() => onFilterChange('sort', 'TRENDING_DESC')}
              className="hover:text-white transition-colors duration-200"
              aria-label="Clear sort filter"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {/* Format filter chip */}
        {filterValues.format && formats[filterValues.format] && (
          <div className="flex items-center gap-2 bg-accent-primary/10 text-accent-primary px-3 py-1.5 rounded-full text-sm font-medium border border-accent-primary/20 hover:bg-accent-primary/15 transition-colors duration-300">
            <span>{formats[filterValues.format]}</span>
            <button
              onClick={() => onFilterChange('format', '')}
              className="hover:text-white transition-colors duration-200"
              aria-label="Clear format filter"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {/* Status filter chip */}
        {filterValues.status && statuses[filterValues.status] && (
          <div className="flex items-center gap-2 bg-accent-primary/10 text-accent-primary px-3 py-1.5 rounded-full text-sm font-medium border border-accent-primary/20 hover:bg-accent-primary/15 transition-colors duration-300">
            <span>{statuses[filterValues.status]}</span>
            <button
              onClick={() => onFilterChange('status', '')}
              className="hover:text-white transition-colors duration-200"
              aria-label="Clear status filter"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {/* Genre filter chip */}
        {filterValues.genre && (
          <div className="flex items-center gap-2 bg-accent-primary/10 text-accent-primary px-3 py-1.5 rounded-full text-sm font-medium border border-accent-primary/20 hover:bg-accent-primary/15 transition-colors duration-300">
            <span>{filterValues.genre}</span>
            <button
              onClick={() => onFilterChange('genre', '')}
              className="hover:text-white transition-colors duration-200"
              aria-label="Clear genre filter"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {/* Search filter chip */}
        {filterValues.search && (
          <div className="flex items-center gap-2 bg-accent-secondary/10 text-accent-secondary px-3 py-1.5 rounded-full text-sm font-medium border border-accent-secondary/20 hover:bg-accent-secondary/15 transition-colors duration-300">
            <span className="truncate max-w-[150px]">"{filterValues.search}"</span>
            <button
              onClick={onClearSearch}
              className="hover:text-white transition-colors duration-200"
              aria-label="Clear search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {/* Clear all filters button */}
        {(filterValues.sort !== 'TRENDING_DESC' || filterValues.format || filterValues.status || filterValues.genre || filterValues.search) && (
          <button
            onClick={() => {
              onFilterChange('sort', 'TRENDING_DESC');
              onFilterChange('format', '');
              onFilterChange('status', '');
              onFilterChange('genre', '');
              onClearSearch();
              onApplyFilters();
            }}
            className="flex items-center gap-1.5 bg-red-500/10 text-red-400 px-3 py-1.5 rounded-full text-sm font-medium border border-red-500/20 hover:bg-red-500/20 hover:text-red-300 transition-all duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Clear all
          </button>
        )}
      </div>
    </>
  );
};

export default AnimeNavbar;