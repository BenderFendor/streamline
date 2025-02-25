Okay, here's the revised Entertainment Tracker Migration Plan to Next.js, reorganized to remove the phased timeline and focus on features and components:

Entertainment Tracker Migration Plan: Django to Next.js

Project Overview

We will migrate your entertainment tracking application from Django to a modern Next.js frontend with an AMOLED dark theme. The goal is to replicate the core functionality, enhance performance and user experience, and adopt a modern TypeScript stack.

Its new name is "Streamline".

Tech Stack

Use TypeScript for type safety and improved developer experience.


Next.js 14 (App Router)
Tailwind CSS (for styling)
SWR/React Query (for data fetching)
NextAuth.js (for authentication)
Prisma + PostgreSQL or Supabase (for database)
content_copy
download
Use code with caution.

Project Structure

entertainment-tracker/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/route.ts
│   │   ├── watchlist/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── shows/
│   │   │   └── route.ts
│   │   ├── anime/
│   │   │   └── route.ts
│   │   └── books/
│   │       └── route.ts
│   ├── components/
│   │   ├── MediaCard.tsx
│   │   ├── FilterBar.tsx
│   │   ├── Rating.tsx
│   │   ├── WatchlistActions.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── FloatingPosters.tsx
│   │   └── Nav.tsx
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── api.ts
│   │   ├── db.ts
│   │   └── utils.ts
│   ├── layout.tsx
│   ├── page.tsx
│   ├── shows/
│   │   └── page.tsx
│   ├── watchlist/
│   │   └── page.tsx
│   ├── anime/
│   │   └── page.tsx
│   └── books/
│       └── page.tsx
├── public/
│   ├── favicon.ico
│   └── placeholder.png
├── tailwind.config.js
└── tsconfig.json
content_copy
download
Use code with caution.

Design System: AMOLED Dark Theme

// filepath: tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // AMOLED dark theme
        background: {
          primary: '#000000',    // Pure black for AMOLED screens
          secondary: '#0A0A0A',  // Slightly lighter black for cards
          tertiary: '#141414',   // For hover states
        },
        accent: {
          primary: '#FF3D71',    // Pink/red accent similar to your original theme
          secondary: '#0095FF',  // Blue accent for highlights
        },
        text: {
          primary: '#FFFFFF',    // White text
          secondary: '#B3B3B3',  // Gray text
          tertiary: '#6C6C6C',   // Darker gray for less emphasis
        },
      },
      animation: {
        'float': 'float 8s ease-in-out infinite',
        'float-delay': 'float 12s ease-in-out infinite 2s',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) translateX(0) rotate(0deg)' },
          '25%': { transform: 'translateY(-10px) translateX(5px) rotate(2deg)' },
          '50%': { transform: 'translateY(5px) translateX(-5px) rotate(-1deg)' },
          '75%': { transform: 'translateY(-5px) translateX(10px) rotate(1deg)' },
        }
      }
    },
  },
  plugins: [],
}
content_copy
download
Use code with caution.

Use TypeScript for type safety and improved developer experience.

Core Components

Layout Component (app/layout.tsx):

Sets up the main structure of the application.

Applies global styles, including the AMOLED dark theme from tailwind.config.js.

Includes the Nav component for site-wide navigation.

Navigation Component (components/Nav.tsx):

Provides navigation links to different sections of the site (Home, Shows, Anime, Books, Watchlist).

Styled to fit the AMOLED dark theme.

Home Page (app/page.tsx):

Displays the hero section with the title and description.

Includes "Get Started" and "My Watchlist" call-to-action buttons.

Features "Floating Posters" in the background for visual appeal.

Utilizes FeatureCard components to highlight key functionalities.

FloatingPosters Component (components/FloatingPosters.tsx):

Fetches trending movie and anime posters using API calls.

Renders posters as Image components in a visually engaging, floating layout.

Uses CSS animations (@keyframes float) for the floating effect.

FeatureCard Component (components/FeatureCard.tsx):

A reusable component to showcase key features on the home page.

Displays an icon, title, and description for each feature.

MediaCard Component (components/MediaCard.tsx):

Displays a card for a single media item (movie, show, anime, book).

Includes the media poster, title, rating, and release year.

Features an "Add to Watchlist" button with loading and "in watchlist" states.

Uses hover effects to reveal more information and actions.

Links to the detail page for each media item.

Shows Page (app/shows/page.tsx):

Displays a browseable list of movies and TV shows.

Includes filters for media type (movie/TV), category (popular, top-rated, etc.), and genre.

Implements search functionality with debouncing.

Uses infinite scrolling to load more content as the user scrolls.

Renders MediaCard components for each show/movie.

Watchlist Page (app/watchlist/page.tsx):

Displays the user's personal watchlist.

Allows filtering the watchlist by media type (all, movies, TV shows, anime, manga, books).

For each watchlist item, displays:

Media poster and title

Progress tracker (episodes/pages/percentage)

Rating component

"Remove from Watchlist" action.

FilterBar Component (components/FilterBar.tsx):

A reusable component to encapsulate filtering controls (media type, category, genre).

Provides dropdowns/toggles for selecting filter options.

Rating Component (components/Rating.tsx):

A reusable component for displaying and updating ratings (star-based).

Handles user interaction for rating media items.

WatchlistActions Component (components/WatchlistActions.tsx):

Encapsulates actions related to watchlist items (share, view details, delete).

Provides buttons or icons for these actions within the watchlist.

LoadingSpinner Component (components/LoadingSpinner.tsx):

A simple, reusable loading indicator (e.g., a spinner).

Used to provide visual feedback during data fetching operations.

API Structure

// API functions for fetching and managing data

// TMDB API for shows and movies
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

// Jikan API for anime and manga
const JIKAN_BASE_URL = 'https://api.jikan.moe/v4'

// OpenLibrary API for books
const OPEN_LIBRARY_BASE_URL = 'https://openlibrary.org'

// Fetch trending items for the main page
export async function getPosterData() {
  try {
    // Fetch trending movies
    const movieResponse = await fetch(
      `${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`
    )
    const movieData = await movieResponse.json()

    // Fetch trending TV shows
    const tvResponse = await fetch(
      `${TMDB_BASE_URL}/trending/tv/week?api_key=${TMDB_API_KEY}`
    )
    const tvData = await tvResponse.json()

    // Fetch trending anime
    const animeResponse = await fetch(
      `${JIKAN_BASE_URL}/top/anime?filter=airing`
    )
    const animeData = await animeResponse.json()

    // Process and combine all data
    const movies = movieData.results.map(item => ({
      id: item.id,
      title: item.title,
      imageUrl: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
      mediaType: 'movie',
    }))
    const tvShows = tvData.results.map(item => ({
      id: item.id,
      title: item.name,
      imageUrl: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
      mediaType: 'tv',
    }))
    const anime = animeData.data.map(item => ({
      id: item.mal_id,
      title: item.title,
      imageUrl: item.images.jpg.image_url,
      mediaType: 'anime',
    }))

    return [...movies, ...tvShows, ...anime].sort(() => Math.random() - 0.5).slice(0, 15) // Take only 15 random posters
  } catch (error) {
    console.error("Error fetching poster data:", error)
    return []
  }
}


// Fetch shows based on filters and search query
export async function fetchShows({ mediaType, category, genre, query, page }) {
  const params = new URLSearchParams({
    api_key: TMDB_API_KEY,
    language: 'en-US',
    page: page,
    include_adult: 'false',
  })

  if (query) {
    params.append('query', query)
  } else if (genre) {
    params.append('with_genres', genre)
  }

  const baseUrl = query ? `${TMDB_BASE_URL}/search/${mediaType}` : `${TMDB_BASE_URL}/${mediaType}/${category}`
  const url = `${baseUrl}?${params.toString()}`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return {
      page: data.page,
      total_pages: data.total_pages,
      results: data.results.map(item => ({
        id: item.id,
        title: mediaType === 'movie' ? item.title : item.name,
        poster_path: item.poster_path,
        vote_average: item.vote_average,
        release_date: item.release_date,
        first_air_date: item.first_air_date,
      })),
    }
  } catch (error) {
    console.error("Fetch shows error:", error)
    return { page: 0, total_pages: 0, results: [] }
  }
}


// Fetch user's watchlist
export async function fetchWatchlist() {
  try {
    const response = await fetch('/api/watchlist') // Next.js API route
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error("Fetch watchlist error:", error)
    return []
  }
}

// Update watchlist item (progress, rating, etc.)
export async function updateWatchlistItem(id, updates) {
  try {
    const response = await fetch(`/api/watchlist/${id}`, { // Next.js API route
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error("Update watchlist item error:", error)
    throw error
  }
}

// Add item to watchlist
export async function addToWatchlist(item) {
  try {
    const response = await fetch('/api/watchlist', { // Next.js API route
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error("Add to watchlist error:", error)
    throw error
  }
}


// Remove item from watchlist
export async function removeFromWatchlist(id) {
  try {
    const response = await fetch(`/api/watchlist/${id}`, { // Next.js API route
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error("Remove from watchlist error:", error)
    throw error
  }
}
content_copy
download
Use code with caution.
Again this all should use Typescript; don't forget to add types to your functions.

## Typescript Types

- Fetch shows function: define types for input parameters and return type.
- Fetch watchlist function: define types for return type.
- Update watchlist item function: define types for input parameters and return type.
- Add to watchlist function: define types for input parameter and return type.
- Remove from watchlist function: define types for input parameter and return type.

Deployment

Deploy to Vercel or Netlify, configuring environment variables for API keys and database connection details.

This revised plan provides a feature-focused approach to the migration, outlining the key components, pages, and functionalities needed for the Next.js Entertainment Tracker. Let me know if you have any other questions!