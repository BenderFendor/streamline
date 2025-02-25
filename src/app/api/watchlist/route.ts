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

// PUT /api/watchlist/[id]
export async function PUT(request: Request) {
  try {
    const item: WatchlistItem = await request.json();
    const index = watchlistItems.findIndex(i => i.id === item.id);
    
    if (index === -1) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    
    // Update the item
    watchlistItems[index] = { ...watchlistItems[index], ...item };
    
    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Error updating watchlist item:', error);
    return NextResponse.json({ error: 'Failed to update watchlist item' }, { status: 500 });
  }
}

// DELETE /api/watchlist/[id]
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    
    const index = watchlistItems.findIndex(item => item.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    
    // Remove the item
    watchlistItems = watchlistItems.filter(item => item.id !== id);
    
    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Error deleting watchlist item:', error);
    return NextResponse.json({ error: 'Failed to delete watchlist item' }, { status: 500 });
  }
}