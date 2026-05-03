# known-errors.md -- Recurring errors with symptom, cause, and fix

## TMDB API 401 Unauthorized

**Symptom:**
```
Movie API Error Details: { status: 401, statusText: "Unauthorized" }
```

**Cause:**
- `NEXT_PUBLIC_TMDB_API_KEY` is missing or invalid.
- Using v3 API key instead of v4 access token (TMDB now requires Bearer token).
- `.env` file exists but variable not prefixed with `NEXT_PUBLIC_`.

**Fix:**
1. Get a TMDB API access token (not API key) from https://www.themoviedb.org/settings/api
2. Add to `.env.local`: `NEXT_PUBLIC_TMDB_API_KEY=eyJ...`
3. Restart dev server.

---

## TypeScript errors pass during build

**Symptom:**
- `npm run build` succeeds but `npx tsc --noEmit` shows errors.

**Cause:**
- `next.config.ts` has `typescript: { ignoreBuildErrors: true }`.

**Fix:**
- Run `npx tsc --noEmit` separately. Fix errors before relying on the build passing.

---

## Next.js Image component fails to load external images

**Symptom:**
```
Error: Invalid src prop (...) on `next/image`, hostname "..." is not configured
```

**Cause:**
- Image hostname not in `images.remotePatterns` in `next.config.ts`.

**Fix:**
- Add the hostname to `remotePatterns` in `next.config.ts`.
- Current allowed hosts: `image.tmdb.org`, `cdn.myanimelist.net`, `s4.anilist.co`.

---

## AniList API rate limiting

**Symptom:**
```
AniList API error: 429
```

**Cause:**
- AniList has a rate limit of 90 requests/minute per IP.

**Fix:**
- Add client-side caching or debouncing to reduce requests.
- Implement exponential backoff for retries.

---

## Watchlist data disappears after server restart

**Symptom:**
- Watchlist is empty after restarting `npm run dev`.

**Cause:**
- Watchlist is stored in-memory (module-level array in `src/app/api/watchlist/route.ts`).
- No database persistence yet.

**Fix:**
- This is expected behavior until a database is added (planned: Prisma + PostgreSQL).
