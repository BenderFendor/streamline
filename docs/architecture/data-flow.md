# data-flow.md -- How data moves through the system

## Page load flow

1. User navigates to page (e.g. /shows, /anime, /watchlist).
2. Page component mounts, calls library function (e.g. `fetchShows`).
3. Library function calls external API (TMDB or AniList) or internal API route.
4. State is updated, UI re-renders.

## Watchlist flow

1. User clicks "Add to Watchlist" on a media item.
2. POST request to `/api/watchlist` with item data.
3. Server stores item in in-memory array.
4. Response returns updated watchlist.
5. User navigates to `/watchlist` to view.

## Navigation flow

- `CinematicNav` is rendered on all pages via `PageWrapper` or directly.
- Links navigate between routes using Next.js `Link` or `useRouter`.

## Search/filter flow

- Shows page: debounced search input -> `fetchShows({ query })` -> TMDB search API.
- Anime page: filter state changes -> `fetchAnime({ sort, format, genre, search })` -> AniList GraphQL API.
- No server-side caching or deduplication between requests.

## Environment variables

- `NEXT_PUBLIC_TMDB_API_KEY` -- used client-side for TMDB API calls.
- `GITHUB_ID` / `GITHUB_SECRET` -- used server-side only for NextAuth.
