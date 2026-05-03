# layers.md -- Architecture boundaries and dependency rules

## Current architecture (monolith single-tier)

```
Pages (src/app/*/page.tsx)
  |
  v
Components (src/app/components/)
  |
  v
Library functions (src/app/lib/api.ts)
  |
  +--> External APIs (TMDB, AniList, Jikan)
  +--> Internal API routes (src/app/api/watchlist/)
```

## Dependency rules

1. Pages may import components and library functions.
2. Components may import library functions.
3. Library functions may call external APIs and internal API routes.
4. API routes handle data mutations (watchlist CRUD).
5. There is no service layer or repository layer yet.
6. There is no database layer (watchlist is in-memory).

## Planned architecture (from outline.md)

```
Pages
  |
  v
Components
  |
  v
SWR/React Query (data fetching with caching)
  |
  v
API Routes
  |
  v
Prisma ORM
  |
  v
PostgreSQL / Supabase

Auth: NextAuth.js (GitHub provider, planned)
```

## Files not yet split

- `src/app/lib/api.ts` (779 lines) contains TMDB, AniList, and watchlist functions.
  It should be split into `api/tmdb.ts`, `api/anilist.ts`, `api/watchlist.ts`.
