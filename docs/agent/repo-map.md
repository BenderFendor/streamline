# repo-map.md -- Directory layout and entry points for agents

## Stack

Next.js 15.1.7 (App Router), TypeScript 5 (strict), React 19, Tailwind CSS 3.4

## Package manager

npm (package-lock.json)

## Top-level directories

| Directory | Purpose |
|-----------|---------|
| `src/` | Application source code |
| `public/` | Static assets (SVGs, favicon) |
| `docs/` | Human and agent documentation |
| `scripts/` | Build, test, and utility scripts |
| `tools/` | Debug and verification tools |
| `.agent/` | Agent harness configuration |
| `specs/` | Feature specifications |
| `contracts/` | API and data contracts |
| `.next/` | Build output (generated) |
| `node_modules/` | Dependencies (generated) |

## Main entry points

- Dev server: `npm run dev` (Next.js with Turbopack)
- Production build: `npm run build`
- Production start: `npm run start`
- Root page: `src/app/page.tsx`

## Where things live

| Concern | Location |
|---------|----------|
| Page routes | `src/app/*/page.tsx` |
| API routes | `src/app/api/**/route.ts` |
| Shared components | `src/app/components/` |
| API/data functions | `src/app/lib/api.ts` (779 lines) |
| Types and helpers | `src/app/lib/watchlist.ts` |
| Global styles | `src/app/globals.css` |
| Root layout | `src/app/layout.tsx` |
| Config | `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `eslint.config.mjs` |
| Auth | `src/app/api/auth/[...nextauth]/route.ts` |
| Watchlist (in-memory) | `src/app/api/watchlist/route.ts`, `src/app/api/watchlist/[id]/route.ts` |
| Environment | `.env` (TMDB key), `.env.local` (optional) |

## Generated files

Do not edit these directly:

- `.next/` -- Next.js build output
- `next-env.d.ts` -- Next.js TypeScript declarations
- `package-lock.json` -- npm lockfile

## Architecture boundaries

- Pages import components and library functions
- Library functions (api.ts) call external APIs (TMDB, AniList) and internal API routes
- API routes handle watchlist CRUD (in-memory)
- Components are self-contained, no shared state library
- No database layer exists yet (planned: Prisma + PostgreSQL/Supabase)
- No middleware exists
- No test framework configured

## Known anti-patterns

- `next.config.ts` has `ignoreBuildErrors: true` and `ignoreDuringBuilds: true`
  which masks real TypeScript and ESLint errors during build
- `src/app/lib/api.ts` is 779 lines -- should be split by concern (tmdb.ts, anilist.ts, watchlist.ts)
- Watchlist is in-memory -- data lost on server restart
- No consistent error boundary pattern across pages
