import { NextResponse } from 'next/server';
import { getItemInfo } from '@/app/lib/watchlist';

type WatchlistItem = {
  id: string;
  title: string;
  mediaType: 'movie' | 'tv' | 'anime' | 'book';
  mediaId: string;
  progress?: number;
  rating?: number;
  imageUrl?: string;
  totalEpisodes?: number;
  totalPages?: number;
  genres?: string[];
  creator?: string;
  year?: string;
};

// In-memory storage for development
let watchlistItems: WatchlistItem[] = [];

// GET /api/watchlist
export async function GET() {
  try {
    // Enhance each item with additional information
    const enhancedItems = await Promise.all(
      watchlistItems.map(async (item) => {
        const info = await getItemInfo(item);
        return {
          ...item,
          ...info
        };
      })
    );

    return NextResponse.json(enhancedItems);
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    return NextResponse.json({ error: 'Failed to fetch watchlist' }, { status: 500 });
  }
}

// POST /api/watchlist
export async function POST(request: Request) {
  try {
    const item: WatchlistItem = await request.json();
    
    // Generate a unique ID
    item.id = Math.random().toString(36).substr(2, 9);
    
    // Add to in-memory storage
    watchlistItems.push(item);
    
    // Fetch additional information
    const info = await getItemInfo(item);
    const enhancedItem = { ...item, ...info };
    
    return NextResponse.json(enhancedItem);
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    return NextResponse.json({ error: 'Failed to add to watchlist' }, { status: 500 });
  }
}