# testing.md -- Setup and verification commands for agents

## Setup

```bash
npm install
```

Create `.env.local` with:

```
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_access_token
```

## Commands

| Check | Command |
|-------|---------|
| Lint | `npm run lint` |
| Typecheck | `npx tsc --noEmit` |
| Build | `npm run build` |
| Dev server | `npm run dev` |
| Production start | `npm run start` |
| Full verification | `bash scripts/self-test` |
| Audit | `npm audit --audit-level=high` |

## Full verification

```bash
bash scripts/self-test
```

Runs: lint -> typecheck -> build

## Environment requirements

- Node.js >= 18 (Next.js 15 requirement)
- npm (or pnpm/yarn/bun)
- TMDB API access token (for `NEXT_PUBLIC_TMDB_API_KEY`)

## Known missing checks

- **Unit tests** -- no test framework configured (vitest or jest needed)
- **E2E tests** -- no Playwright or Cypress setup
- **Format check** -- no Prettier configured
- **Security audit** -- `npm audit` only, no SAST tooling
- **Accessibility** -- no axe or Lighthouse CI

## Test conventions (when tests are added)

- Test files should live in `__tests__/` directories co-located with source
- Test naming: `*.test.ts` or `*.test.tsx`
- Use `vitest` (recommended for Next.js projects)
- Fixtures: `src/__fixtures__/` or inline test data
- Mock external APIs (TMDB, AniList) using `msw` or `vi.mock`
