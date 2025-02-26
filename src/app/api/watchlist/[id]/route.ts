import { NextResponse } from 'next/server';

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

// Import from parent route file
import { watchlistItems } from '../route';

// GET /api/watchlist/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const item = watchlistItems.find(item => item.id === id);
  
  if (!item) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }
  
  return NextResponse.json(item);
}

// PATCH /api/watchlist/[id] - For updating progress, status, or rating
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const updates = await request.json();
    
    const itemIndex = watchlistItems.findIndex(item => item.id === id);
    if (itemIndex === -1) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    
    // Update only the provided fields
    watchlistItems[itemIndex] = {
      ...watchlistItems[itemIndex],
      ...updates
    };
    
    return NextResponse.json(watchlistItems[itemIndex]);
  } catch (error) {
    console.error('Error updating watchlist item:', error);
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

// DELETE /api/watchlist/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const itemIndex = watchlistItems.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    
    const deletedItem = watchlistItems.splice(itemIndex, 1)[0];
    return NextResponse.json({ success: true, item: deletedItem });
  } catch (error) {
    console.error('Error deleting watchlist item:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}