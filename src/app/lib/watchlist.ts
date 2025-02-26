import { fetchShows } from './api';

export type WatchlistItem = {
  id: string;
  title: string;
  mediaType: 'movie' | 'tv' | 'anime' | 'book';
  mediaId: string;
  progress?: number;
  rating?: number;
  imageUrl?: string;
  totalEpisodes?: number;
  currentEpisode?: number;
  totalPages?: number;
  genres?: string[];
  creator?: string;
  year?: string;
};

type TMDBShowData = {
  id: number;
  title?: string;
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
  number_of_episodes?: number;
  media_type?: 'movie' | 'tv';
};

type ShowInfo = {
  genres: string[];
  creator: string;
  year: string;
  rating: number;
  totalEpisodes?: number;
  currentEpisode?: number;
};

export async function getItemInfo(item: WatchlistItem): Promise<ShowInfo> {
  if (item.mediaType === 'movie' || item.mediaType === 'tv') {
    try {
      // Fetch basic show information
      const response = await fetchShows({
        mediaType: item.mediaType,
        category: 'popular',
        page: 1,
        id: item.mediaId
      });

      const showData = response.results?.[0] as TMDBShowData | undefined;
      
      if (!showData) {
        throw new Error('Show data not found');
      }

      return {
        genres: showData.genre_ids?.map(id => id.toString()) || [],
        creator: 'Unknown', // Would come from credits data
        year: new Date(showData.release_date || showData.first_air_date || '').getFullYear().toString(),
        rating: showData.vote_average || 0,
        totalEpisodes: showData.number_of_episodes
      };
    } catch (error) {
      console.error('Error fetching show info:', error);
      return {
        genres: [],
        creator: 'Unknown',
        year: '',
        rating: 0
      };
    }
  }

  // TODO: Implement info fetching for anime and books
  return {
    genres: [],
    creator: 'Unknown',
    year: '',
    rating: 0
  };
}

export async function getWatchlist(): Promise<WatchlistItem[]> {
  try {
    const response = await fetch('/api/watchlist');
    if (!response.ok) {
      throw new Error('Failed to fetch watchlist');
    }
    const items: WatchlistItem[] = await response.json();

    // Enhance each item with additional information
    const enhancedItems = await Promise.all(
      items.map(async (item) => {
        const info = await getItemInfo(item);
        return {
          ...item,
          ...info
        };
      })
    );

    return enhancedItems;
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    return [];
  }
}

export async function addToWatchlist(item: WatchlistItem): Promise<WatchlistItem | null> {
  try {
    const response = await fetch('/api/watchlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    });

    if (!response.ok) {
      throw new Error('Failed to add item to watchlist');
    }

    const savedItem = await response.json();
    const info = await getItemInfo(savedItem);
    
    return {
      ...savedItem,
      ...info
    };
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    return null;
  }
}

export async function updateWatchlistItem(item: WatchlistItem): Promise<boolean> {
  try {
    const response = await fetch(`/api/watchlist/${item.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    });

    return response.ok;
  } catch (error) {
    console.error('Error updating watchlist item:', error);
    return false;
  }
}

export async function removeFromWatchlist(itemId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/watchlist/${itemId}`, {
      method: 'DELETE',
    });

    return response.ok;
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    return false;
  }
}