import Image from 'next/image';
import Link from 'next/link';
import FloatingPosters from './components/FloatingPosters';

export default function Home() {
  return (
    <div className="min-h-screen bg-background-primary text-text-primary relative overflow-hidden">
      <FloatingPosters />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <main className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
            Streamline Your Entertainment
          </h1>
          <p className="text-lg sm:text-xl text-text-secondary mb-12 max-w-2xl mx-auto">
            Track, discover, and manage all your movies, TV shows, anime, and books in one place.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link 
              href="/shows"
              className="px-8 py-3 bg-accent-primary hover:bg-accent-primary/90 text-white rounded-full font-medium transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/watchlist"
              className="px-8 py-3 border-2 border-accent-secondary hover:bg-accent-secondary/10 text-accent-secondary rounded-full font-medium transition-colors"
            >
              My Watchlist
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="p-6 bg-background-secondary rounded-xl hover:bg-background-tertiary transition-colors">
              <div className="w-12 h-12 mb-4 mx-auto bg-accent-primary/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h18M3 16h18" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Everything</h3>
              <p className="text-text-secondary">Keep track of your movies, shows, anime, and books all in one place.</p>
            </div>

            <div className="p-6 bg-background-secondary rounded-xl hover:bg-background-tertiary transition-colors">
              <div className="w-12 h-12 mb-4 mx-auto bg-accent-secondary/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-accent-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Discover New Content</h3>
              <p className="text-text-secondary">Find new favorites with personalized recommendations.</p>
            </div>

            <div className="p-6 bg-background-secondary rounded-xl hover:bg-background-tertiary transition-colors">
              <div className="w-12 h-12 mb-4 mx-auto bg-accent-primary/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Rate & Review</h3>
              <p className="text-text-secondary">Share your thoughts and see what others think.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
