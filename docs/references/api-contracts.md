# api-contracts.md -- API shape expectations

## External APIs

### TMDB (The Movie Database)
- Base URL: `https://api.themoviedb.org/3`
- Auth: Bearer token in `Authorization` header
- Key endpoints used:
  - `GET /trending/{media_type}/week` -- trending movies/TV
  - `GET /{media_type}/{category}` -- popular, top_rated, etc.
  - `GET /search/{media_type}` -- search
  - `GET /discover/{media_type}` -- genre-based discovery
  - `GET /{media_type}/{id}` -- detailed info with credits, videos, similar
  - `GET /person/{id}` -- person details with combined credits

### AniList (GraphQL)
- URL: `https://graphql.anilist.co`
- Auth: None (public API)
- Rate limit: 90 requests/minute
- Queries used:
  - `Page.media` -- anime listing with filters (format, status, genre, sort)
  - `Media` -- anime details (characters, staff, relations, recommendations, reviews, etc.)

## Internal API Routes

### Watchlist
- `GET /api/watchlist` -- returns all watchlist items
- `POST /api/watchlist` -- adds item (body: WatchlistItem)
- `GET /api/watchlist/[id]` -- returns single item
- `PATCH /api/watchlist/[id]` -- updates item (body: partial WatchlistItem)
- `DELETE /api/watchlist/[id]` -- removes item

### Auth (planned, not functional)
- `GET /api/auth/[...nextauth]` -- NextAuth.js handler (GitHub provider)

## Watchlist item shape

```typescript
type WatchlistItem = {
  id: string;
  mediaId: number;
  title: string;
  mediaType: 'movie' | 'tv' | 'anime';
  posterPath: string;
  addedAt: string; // ISO date
  status: 'planning' | 'watching' | 'completed';
  progress: number;
  rating: number;
};
```
