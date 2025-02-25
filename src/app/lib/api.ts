// API functions for fetching and managing data

// API Base URLs and Keys
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const JIKAN_BASE_URL = 'https://api.jikan.moe/v4'
const OPEN_LIBRARY_BASE_URL = 'https://openlibrary.org'

const tmdbFetchOptions = {
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${TMDB_API_KEY}`
  }
}

// Types
type MediaItem = {
  id: string | number;
  title: string;
  imageUrl: string;
  mediaType: 'movie' | 'tv' | 'anime' | 'book';
}

type ShowsResponse = {
  page: number;
  total_pages: number;
  total_results: number;
  results: Array<{
    id: number;
    title: string;
    name?: string;
    poster_path: string;
    backdrop_path: string;
    overview: string;
    genre_ids: number[];
    vote_average: number;
    vote_count: number;
    popularity: number;
    release_date?: string;
    first_air_date?: string;
    original_language: string;
    adult: boolean;
    media_type?: 'movie' | 'tv';
  }>;
}

type ShowsParams = {
  mediaType: 'movie' | 'tv';
  category: string;
  genre?: string;
  query?: string;
  page: number;
}

// Fetch trending items for the main page
export async function getPosterData(): Promise<MediaItem[]> {
  try {
    // Fetch trending movies
    // Fetch trending movies with detailed error logging
    const movieUrl = `${TMDB_BASE_URL}/trending/movie/week`
    console.debug('Fetching movies from:', movieUrl)
    console.debug('Using fetch options:', JSON.stringify(tmdbFetchOptions))
    
    const movieResponse = await fetch(movieUrl, tmdbFetchOptions)
    if (!movieResponse.ok) {
      // Log detailed error information for debugging
      const errorText = await movieResponse.text()
      console.error('Movie API Error Details:', {
        status: movieResponse.status,
        statusText: movieResponse.statusText,
        headers: Object.fromEntries(movieResponse.headers.entries()),
        responseBody: errorText
      })
      if (movieResponse.status === 401) {
        throw new Error('TMDB API authentication failed. Please check your API key.')
      }
      throw new Error(`Movie API error: ${movieResponse.status} - ${errorText}`)
    }
    const movieData = await movieResponse.json()
    if (!movieData?.results) throw new Error('Invalid movie data format')

    // Fetch trending TV shows
    // Fetch trending TV shows with detailed error logging
    const tvUrl = `${TMDB_BASE_URL}/trending/tv/week`
    console.debug('Fetching TV shows from:', tvUrl)
    
    const tvResponse = await fetch(tvUrl, tmdbFetchOptions)
    if (!tvResponse.ok) {
      // Log detailed error information for debugging
      const errorText = await tvResponse.text()
      console.error('TV API Error Details:', {
        status: tvResponse.status,
        statusText: tvResponse.statusText,
        headers: Object.fromEntries(tvResponse.headers.entries()),
        responseBody: errorText
      })
      if (tvResponse.status === 401) {
        throw new Error('TMDB API authentication failed. Please check your API key.')
      }
      throw new Error(`TV API error: ${tvResponse.status} - ${errorText}`)
    }
    const tvData = await tvResponse.json()
    if (!tvData?.results) throw new Error('Invalid TV data format')

    // Fetch trending anime
    const animeResponse = await fetch(
      `${JIKAN_BASE_URL}/top/anime?filter=airing`
    )
    if (!animeResponse.ok) throw new Error(`Anime API error: ${animeResponse.status}`)
    const animeData = await animeResponse.json()
    if (!animeData?.data) throw new Error('Invalid anime data format')

    // Process and combine all data
    const movies = movieData.results.map(item => ({
      id: item.id,
      title: item.title,
      imageUrl: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
      mediaType: 'movie',
    })) || []

    const tvShows = tvData.results.map(item => ({
      id: item.id,
      title: item.name,
      imageUrl: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
      mediaType: 'tv',
    })) || []

    const anime = animeData.data.map(item => ({
      id: item.mal_id,
      title: item.title,
      imageUrl: item.images?.jpg?.image_url || '',
      mediaType: 'anime',
    })) || []

    const combinedResults = [...movies, ...tvShows, ...anime]
      .filter(item => item.imageUrl) // Filter out items without images
      .sort(() => Math.random() - 0.5)
      .slice(0, 15) // Take only 15 random posters

    return combinedResults
  } catch (error) {
    console.error("Error fetching poster data:", error)
    return []
  }
}

// Fetch shows based on filters and search query
export async function fetchShows(params: ShowsParams): Promise<ShowsResponse> {
  const { mediaType, category, genre, query, page } = params
  const searchParams = new URLSearchParams({
    language: 'en-US',
    page: page.toString(),
    include_adult: 'false',
  })

  if (query) {
    searchParams.append('query', query)
  } else if (genre) {
    searchParams.append('with_genres', genre)
  }

  const baseUrl = query
    ? `${TMDB_BASE_URL}/search/${mediaType}`
    : `${TMDB_BASE_URL}/${mediaType}/${category}`
  const url = `${baseUrl}?${searchParams.toString()}`

  try {
    // Log request details for debugging
    console.debug('Fetching shows from:', url)
    console.debug('Using fetch options:', JSON.stringify(tmdbFetchOptions))
    
    const response = await fetch(url, tmdbFetchOptions)
    if (!response.ok) {
      // Log detailed error information for debugging
      const errorText = await response.text()
      console.error('Shows API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        responseBody: errorText,
        requestUrl: url
      })
      
      // Provide specific error messages for common issues
      if (response.status === 401) {
        throw new Error('TMDB API authentication failed. Please check your API key.')
      } else if (response.status === 404) {
        throw new Error(`The requested ${mediaType} content was not found.`)
      } else if (response.status === 429) {
        throw new Error('TMDB API rate limit exceeded. Please try again later.')
      }
      
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
    }
    const data = await response.json()
    return {
      page: data.page,
      total_pages: data.total_pages,
      total_results: data.total_results,
      results: data.results.map(item => ({
        id: item.id,
        title: mediaType === 'movie' ? item.title : item.name,
        name: mediaType === 'tv' ? item.name : undefined,
        poster_path: item.poster_path,
        backdrop_path: item.backdrop_path,
        overview: item.overview,
        genre_ids: item.genre_ids,
        vote_average: item.vote_average,
        vote_count: item.vote_count,
        popularity: item.popularity,
        release_date: item.release_date,
        first_air_date: item.first_air_date,
        original_language: item.original_language,
        adult: item.adult,
        media_type: mediaType
      })),
    }
  } catch (error) {
    console.error("Fetch shows error:", error)
    return { page: 0, total_pages: 0, results: [] }
  }
}

// Watchlist Types
type WatchlistItem = {
  id: string;
  title: string;
  mediaType: 'movie' | 'tv' | 'anime' | 'book';
  progress?: number;
  rating?: number;
  imageUrl?: string;
  totalEpisodes?: number;
  totalPages?: number;
};

// Fetch watchlist items
export async function fetchWatchlist(): Promise<WatchlistItem[]> {
  try {
    const response = await fetch('/api/watchlist');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch watchlist error:', error);
    return [];
  }
}