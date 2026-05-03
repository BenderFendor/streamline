# learnings.md -- Per-session discoveries agents should reuse

Append entries when you discover a missing command, recurring error, surprising framework behavior, or better verification path.

---

## 2026-05-03 -- Repo harness bootstrap, lint/type fixes, Next.js 16 upgrade

**Context:**
- Initial repo-harness bootstrap for Streamline Next.js project.
- Fixed 25 ESLint errors and 20+ TypeScript errors across 11 files.
- Upgraded from Next.js 15.1.7 to 16.2.4.

**What worked:**
- Detected all project characteristics from package.json, tsconfig.json, eslint.config.mjs, next.config.ts.
- Generated harness tailored to the actual project structure (App Router, in-memory watchlist, TMDB/AniList APIs).
- Self-test revealed pre-existing lint/type issues that `next build` silently ignored.
- `next-auth` was imported but not in package.json -- added it to fix type errors.

**What failed:**
- Initial attempt to use `_token` for unused destructured param still triggered the lint rule; removed entirely.
- Using `Record<string, unknown>` as API return types created downstream type mismatches; used `as unknown as T` casts in consumers.
- `next lint` was removed in Next.js 16 -- switched to `eslint .` in package.json scripts.
- `eslint-config-next` changed to native flat config array in v16 -- simplified eslint.config.mjs.
- `next.config.ts` `eslint.ignoreDuringBuilds` removed in v16 -- deleted the key.
- Next.js 16 auto-changed `jsx: "preserve"` to `jsx: "react-jsx"` in tsconfig.json.

**Next.js 15 to 16 breaking changes encountered:**
- `next lint` removed -- use `eslint .` directly.
- `eslint` config key removed from `next.config.ts`.
- API route handler params must be `Promise<{ id: string }>` (already true in 15, enforced in 16).
- Page component params must be unwrapped with `use()` (same as 15).
- Stricter React hook rules (`set-state-in-effect`, `purity`).

**Future agents should:**
- Note that watchlist is in-memory -- no persistence.
- When defining API return types, prefer using cast patterns in consumers rather than trying to define complete external API types.
- API route handler params: always use `Promise<{...}>` and `await params`.
- Page component params: always use `use(params)` to unwrap.
