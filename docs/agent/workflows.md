# workflows.md -- Task workflows for agents

Each workflow defines: what to read first, edit steps, verification, and what to record.

## fix bug

**When:** test fails, runtime error, unexpected behavior, regression.

**Read first:**
- `docs/agent/known-errors.md`
- `docs/agent/repo-map.md`

**Steps:**
1. Reproduce the bug with `npm run dev` and browser inspection.
2. If the bug class requires runtime evidence (API fetch, auth, state, async), collect it before hypothesizing.
3. Identify the narrowest source file responsible.
4. Add or update a test that fails before the fix.
5. Make the smallest code change at the first wrong state transition.
6. Run `bash scripts/self-test`.
7. If the failure pattern may recur, update `docs/agent/known-errors.md`.

**Do not:**
- Rewrite unrelated modules.
- Add dependencies before checking existing utilities.
- Fix symptoms without adding a regression test.

## add feature

**When:** new behavior, new route, new component, new data model.

**Read first:**
- `docs/agent/repo-map.md`
- Nearest existing feature's structure (e.g. copy an existing page/route pattern)

**Steps:**
1. Read the bounded spec from `specs/features/<task>.md`.
2. Find the nearest existing feature and match its structure.
3. Add types first (in `src/app/lib/` if shared).
4. Add route handler or page component.
5. Add tests at the lowest useful layer.
6. Run `bash scripts/self-test`.
7. Record any new pattern in `docs/agent/learnings.md`.

## refactor

**When:** restructuring code without changing behavior.

**Read first:**
- `docs/agent/repo-map.md`

**Steps:**
1. Confirm existing behavior with manual testing or existing tests.
2. Make the structural change.
3. Verify behavior is preserved via `npm run dev`.
4. Run `bash scripts/self-test`.
5. Update `docs/agent/repo-map.md` if structure changed.

## update UI

**When:** changing layout, styling, component structure.

**Read first:**
- Existing component patterns in `src/app/components/`
- `tailwind.config.ts` for theme tokens
- `src/app/globals.css` for CSS variables and animations

**Steps:**
1. List existing features visible in the UI. Do not remove features unless explicitly asked.
2. Propose component-level changes.
3. Implement changes using existing Tailwind tokens and CSS variables.
4. Run `bash scripts/self-test`.
5. Verify visually with `npm run dev`.

## add test

**When:** adding coverage. Note: no test framework exists yet.

**Steps:**
1. If adding tests for the first time, configure `vitest` as the test runner.
2. Follow the patterns described in `docs/agent/testing.md`.
3. Write tests co-located with source.
4. Run the specific test to confirm it passes.
5. Run `bash scripts/self-test`.

## update dependency

**When:** adding, removing, or upgrading a package.

**Steps:**
1. Check why the dependency is needed.
2. Prefer standard library or existing project utilities.
3. Run `npm install <package>` (or `npm update`).
4. Run `bash scripts/self-test`.
5. Update `docs/agent/testing.md` if setup changed.
