# Streamline Debug Recipes

## API fetch failures

1. Check `NEXT_PUBLIC_TMDB_API_KEY` is set in `.env.local` or `.env`.
2. Run `node -e "console.log(process.env.NEXT_PUBLIC_TMDB_API_KEY)"` from the project root.
3. TMDB uses Bearer token auth. The key in `tmdbFetchOptions` must be a v4 access token, not a v3 API key.
4. AniList API is public (no auth). Rate limit: 90 requests/minute.

## Build succeeds but runtime fails

- `next.config.ts` has `ignoreBuildErrors: true` and `ignoreDuringBuilds: true`.
  This means TypeScript errors and ESLint errors do not fail the build.
  Run `npx tsc --noEmit` and `npm run lint` separately to catch real issues.

## Watchlist disappears on page refresh

- Watchlist is stored in-memory (array in `src/app/api/watchlist/route.ts`).
  Data is lost on server restart. This is by design until a database is added.

## Image loading failures

- Check `next.config.ts` for `images.remotePatterns`. Add new hostnames there.
- TMDB images: `image.tmdb.org`
- AniList images: `s4.anilist.co`
- MyAnimeList images: `cdn.myanimelist.net`
