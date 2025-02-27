// API functions for fetching and managing data
import type { WatchlistItem } from './watchlist';

// API Base URLs and Keys
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const JIKAN_BASE_URL = 'https://api.jikan.moe/v4'
const ANILIST_API_URL = 'https://graphql.anilist.co'
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
  id?: string | number;
}

// Anime Types
type AnimeResponse = {
  page: number;
  total_pages: number;
  hasNextPage: boolean;
  results: Array<{
    id: number;
    title: string;
    englishTitle?: string;
    nativeTitle?: string;
    coverImage: string;
    bannerImage?: string;
    episodes?: number;
    status: string;
    format: string;
    genres: string[];
    averageScore?: number;
    popularity?: number;
    season?: string;
    year?: number;
    studios?: string[];
    nextAiring?: {
      episode: number;
      timeUntilAiring: number;
    };
  }>;
}

type AnimeParams = {
  sort?: string;
  format?: string;
  status?: string;
  search?: string;
  genre?: string;
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

    // Fetch trending anime using AniList API
    const animeQuery = `
      query {
        Page(page: 1, perPage: 10) {
          media(type: ANIME, sort: TRENDING_DESC) {
            id
            title {
              english
              romaji
            }
            coverImage {
              extraLarge
            }
          }
        }
      }
    `;

    const animeResponse = await fetch(ANILIST_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ query: animeQuery }),
    });

    if (!animeResponse.ok) {
      throw new Error(`Anime API error: ${animeResponse.status}`);
    }
    const animeData = await animeResponse.json();
    if (!animeData?.data?.Page?.media) {
      throw new Error('Invalid anime data format');
    }

    // Process and combine all data
    const movies = movieData.results.map(item => ({
      id: item.id,
      title: item.title,
      imageUrl: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
      mediaType: 'movie',
    })) || []

    const tvShows = tvData.results.map(item => ({
      id: item.id,
      title: item.name || '',
      imageUrl: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
      mediaType: 'tv',
    })) || []

    const anime = animeData.data.Page.media.map(item => ({
      id: item.id,
      title: item.title.english || item.title.romaji,
      imageUrl: item.coverImage.extraLarge,
      mediaType: 'anime',
    })) || []

    // Combine and shuffle for varied content
    const allMedia = [...movies, ...tvShows, ...anime]
    
    // Fisher-Yates shuffle algorithm
    for (let i = allMedia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allMedia[i], allMedia[j]] = [allMedia[j], allMedia[i]];
    }
    
    return allMedia
  } catch (error) {
    console.error('Error fetching poster data:', error)
    return []
  }
}

// Fetch shows based on filters and search query
export async function fetchShows(params: ShowsParams): Promise<ShowsResponse> {
  const { mediaType, category, genre, query, page, id } = params
  
  let url: string
  let queryParams = new URLSearchParams({
    language: 'en-US',
    page: page.toString(),
    include_adult: 'false'
  })
  
  // If an ID is specified, fetch details for that specific show
  if (id) {
    url = `${TMDB_BASE_URL}/${mediaType}/${id}`
  }
  // If a search query is specified, use search endpoint
  else if (query) {
    url = `${TMDB_BASE_URL}/search/${mediaType}`
    queryParams.append('query', query)
  }
  // If genre is specified, use discover endpoint with genre filter
  else if (genre) {
    url = `${TMDB_BASE_URL}/discover/${mediaType}`
    queryParams.append('with_genres', genre)
  }
  // Otherwise, use standard category endpoint (popular, top_rated, etc.)
  else {
    url = `${TMDB_BASE_URL}/${mediaType}/${category}`
  }
  
  try {
    console.debug(`Fetching shows from: ${url}?${queryParams.toString()}`)
    
    const response = await fetch(`${url}?${queryParams.toString()}`, tmdbFetchOptions)
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Shows API Error:', {
        status: response.status,
        statusText: response.statusText,
        responseBody: errorText
      })
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
    }
    
    const data = await response.json()
    return {
      page: data.page,
      total_pages: data.total_pages,
      total_results: data.total_results,
      results: data.results || []
    }
  } catch (error) {
    console.error('Fetch shows error:', error)
    return { page: 0, total_pages: 0, total_results: 0, results: [] }
  }
}

// Fetch anime based on filters and search query using AniList API
export async function fetchAnime(params: AnimeParams): Promise<AnimeResponse> {
  const { sort = 'TRENDING_DESC', format, status, search, genre, page = 1 } = params;
  
  // Build the GraphQL query
  let query = `
    query ($page: Int, $perPage: Int, $search: String, $format: MediaFormat, $status: MediaStatus, $genre: String, $sort: [MediaSort]) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          hasNextPage
          currentPage
          total
          lastPage
        }
        media(type: ANIME, search: $search, format: $format, status: $status, genre: $genre, sort: $sort) {
          id
          episodes
          status
          format
          genres
          averageScore
          popularity
          season
          seasonYear
          studios {
            nodes {
              name
            }
          }
          coverImage {
            large
            extraLarge
          }
          bannerImage
          nextAiringEpisode {
            episode
            timeUntilAiring
          }
          title {
            english
            romaji
            native
          }
        }
      }
    }
  `;
  
  // Build variables object
  const variables = {
    page: page,
    perPage: 20,
    sort: [sort]
  };
  
  // Add optional filters if they exist
  if (search) variables['search'] = search;
  if (format) variables['format'] = format;
  if (status) variables['status'] = status;
  if (genre) variables['genre'] = genre;

  try {
    const response = await fetch(ANILIST_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AniList API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    
    if (data.errors) {
      throw new Error(`AniList GraphQL error: ${data.errors[0].message}`);
    }

    const pageInfo = data.data.Page.pageInfo;
    const mediaItems = data.data.Page.media;
    
    // Transform the data to match our expected format
    return {
      page: pageInfo.currentPage,
      total_pages: pageInfo.lastPage || 500, // AniList typically has a limit
      hasNextPage: pageInfo.hasNextPage,
      results: mediaItems.map(item => ({
        id: item.id,
        title: item.title.english || item.title.romaji,
        englishTitle: item.title.english,
        nativeTitle: item.title.native,
        coverImage: item.coverImage.extraLarge || item.coverImage.large,
        bannerImage: item.bannerImage,
        episodes: item.episodes,
        status: item.status,
        format: item.format,
        genres: item.genres,
        averageScore: item.averageScore,
        popularity: item.popularity,
        season: item.season,
        year: item.seasonYear,
        studios: item.studios?.nodes?.map(studio => studio.name) || [],
        nextAiring: item.nextAiringEpisode ? {
          episode: item.nextAiringEpisode.episode,
          timeUntilAiring: item.nextAiringEpisode.timeUntilAiring
        } : undefined
      }))
    };
  } catch (error) {
    console.error('Fetch anime error:', error);
    return { page: 0, total_pages: 0, hasNextPage: false, results: [] };
  }
}

// Fetch specific anime details by ID
export async function fetchAnimeDetails(id: number): Promise<any> {
  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        id
        title {
          romaji
          english
          native
        }
        description
        startDate {
          year
          month
          day
        }
        endDate {
          year
          month
          day
        }
        season
        seasonYear
        episodes
        duration
        status
        averageScore
        meanScore
        popularity
        favourites
        format
        genres
        tags {
          name
          description
          category
          rank
          isGeneralSpoiler
          isMediaSpoiler
          isAdult
        }
        studios {
          edges {
            node {
              id
              name
              siteUrl
            }
            isMain
          }
        }
        staff {
          edges {
            node {
              id
              name {
                full
                native
              }
              language
              primaryOccupations
              image {
                large
              }
              siteUrl
            }
            role
          }
        }
        characters {
          edges {
            node {
              id
              name {
                full
                native
              }
              image {
                large
              }
              description
              siteUrl
            }
            role
            voiceActors(language: JAPANESE) {
              id
              name {
                full
                native
              }
              language
              image {
                large
              }
              siteUrl
            }
          }
        }
        relations {
          edges {
            node {
              id
              title {
                romaji
                english
              }
              type
              format
              status
              coverImage {
                large
              }
              siteUrl
            }
            relationType
          }
        }
        recommendations {
          edges {
            node {
              mediaRecommendation {
                id
                title {
                  romaji
                  english
                }
                format
                status
                averageScore
                popularity
                coverImage {
                  large
                }
                siteUrl
              }
              rating
              userRating
            }
          }
        }
        trailer {
          id
          site
          thumbnail
        }
        siteUrl
        nextAiringEpisode {
          airingAt
          timeUntilAiring
          episode
        }
        streamingEpisodes {
          title
          thumbnail
          url
          site
        }
        reviews {
          nodes {
            id
            summary
            rating
            ratingAmount
            user {
              id
              name
              avatar {
                large
              }
              siteUrl
            }
            siteUrl
          }
        }
        rankings {
          id
          rank
          type
          format
          year
          season
          allTime
          context
        }
        coverImage {
          extraLarge
        }
        bannerImage
        externalLinks {
          id
          site
          url
          type
          language
          color
          icon
          notes
          isDisabled
        }
        source
        hashtag
        updatedAt
      }
    }
  `;

  try {
    const response = await fetch(ANILIST_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { id }
      }),
    });
    
    if (!response.ok) {
      throw new Error(`AniList API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.errors) {
      throw new Error(`AniList GraphQL error: ${data.errors[0].message}`);
    }

    return data.data.Media;
  } catch (error) {
    console.error('Fetch anime details error:', error);
    throw error;
  }
}

// Fetch anime filters to use in the UI
export function getAnimeFilters() {
  const formats = {
    TV: 'TV Show',
    MOVIE: 'Movie',
    OVA: 'OVA',
    ONA: 'ONA',
    SPECIAL: 'Special',
    MUSIC: 'Music'
  };
  
  const statuses = {
    FINISHED: 'Finished',
    RELEASING: 'Currently Airing',
    NOT_YET_RELEASED: 'Coming Soon',
    CANCELLED: 'Cancelled',
    HIATUS: 'On Hiatus'
  };
  
  const sorts = {
    TRENDING_DESC: 'Trending',
    POPULARITY_DESC: 'Popular',
    SCORE_DESC: 'Top Rated',
    START_DATE_DESC: 'Newest',
    EPISODES_DESC: 'Most Episodes',
    FAVOURITES_DESC: 'Most Favorites'
  };
  
  const genres = [
    'Action',
    'Adventure',
    'Comedy',
    'Drama',
    'Fantasy',
    'Horror',
    'Mecha',
    'Music',
    'Mystery',
    'Psychological',
    'Romance',
    'Sci-Fi',
    'Slice of Life',
    'Sports',
    'Supernatural',
    'Thriller',
    'Ecchi',
  ];
  
  return { formats, statuses, sorts, genres };
}

// Fetch watchlist items
export async function fetchWatchlist(): Promise<WatchlistItem[]> {
  try {
    const response = await fetch('/api/watchlist');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fetch watchlist error:', error);
    return [];
  }
}

// Fetch details for a specific show (movie or TV)
export async function fetchShowDetails(id: string | number): Promise<any> {
  // Try movie first
  try {
    const movieResponse = await fetch(
      `${TMDB_BASE_URL}/movie/${id}?append_to_response=credits,videos,similar`,
      tmdbFetchOptions
    );

    // If not found as movie, try TV show
    if (movieResponse.status === 404) {
      const tvResponse = await fetch(
        `${TMDB_BASE_URL}/tv/${id}?append_to_response=credits,videos,similar`,
        tmdbFetchOptions
      );

      if (!tvResponse.ok) {
        throw new Error(`Failed to fetch TV show: ${tvResponse.status}`);
      }

      const tvData = await tvResponse.json();
      return {
        ...tvData,
        title: tvData.name,
        release_date: tvData.first_air_date,
      };
    }

    if (!movieResponse.ok) {
      throw new Error(`Failed to fetch movie: ${movieResponse.status}`);
    }

    return await movieResponse.json();
  } catch (error) {
    console.error('Error fetching show details:', error);
    throw error;
  }
}