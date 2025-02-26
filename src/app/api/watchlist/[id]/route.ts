import { NextResponse } from 'next/server';
import type { WatchlistItem } from '@/app/lib/watchlist';

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
    const item = watchlistItems.find(item => item.id === id);

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Update item
    Object.assign(item, updates);

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error updating item:', error);
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

// DELETE /api/watchlist/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const index = watchlistItems.findIndex(item => item.id === id);

  if (index === -1) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }

  watchlistItems.splice(index, 1);
  return new NextResponse(null, { status: 204 });
}