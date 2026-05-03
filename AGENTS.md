# Agent Rules

## Core Principle

The agent is an untrusted code generator inside a compiler-like verification harness.
The agent proposes. The harness disposes.

## Orientation

Before editing code:

1. Run `bash scripts/agent-summary` to orient yourself in the repo.
2. Read `docs/agent/repo-map.md` for directory layout and entry points.
3. Read `docs/agent/workflows.md` for the task-matching workflow.
4. Read `docs/agent/known-errors.md` for recurring failure patterns.
5. Identify the stack: Next.js 15, TypeScript 5, React 19, Tailwind CSS 3.4, npm.

## Core Working Rule

Do not consider a task complete until you have run the strongest available verification (`bash scripts/self-test`), diagnosed any failures, and reported exactly what passed or failed.

## Required Agent Behavior

### Before editing code

1. Read the task spec from `specs/features/<task>.md` or receive a bounded spec.
2. Identify affected files from the task spec's `allowed_files`.
3. Identify invariants from `.agent/invariants.yaml` and the task spec.
4. Create a task IR: intent and risk, files expected to change, invariants, verification commands.
5. If the plan touches files outside `allowed_files`, stop and explain.

### During editing

- Make the smallest diff that satisfies the spec.
- Prefer existing project patterns over new abstractions.
- Do not rename files unless the task requires it.
- Do not move unrelated code.
- Do not change formatting outside touched blocks.
- Do not add dependencies without explaining why.
- Write or update tests before or alongside code changes.
- Do not modify files outside the task's `allowed_files` scope.

### After editing

1. Run `bash scripts/self-test`.
2. Write an agent trace to `.agent/traces/<task-id>.md`.
3. Update `docs/agent/learnings.md` if you discovered a missing command, recurring error, surprising framework behavior, or better verification path.
4. Update `docs/agent/known-errors.md` if the failure has a reusable symptom and fix.

### Completion rule

A task is not done because code was edited.
A task is done only when `bash scripts/self-test` passes or the remaining failure is documented with exact command output.

## High-Risk Paths

The following paths require human review before merge:

- `src/app/api/auth/**`
- `src/app/api/watchlist/**`
- `.env*` files
- Image/API configuration in `next.config.ts`

## No Silent Broadening

Do not widen the scope of a task without notice. Examples:
- Task: add CSV export. Bad: adds export for all users instead of admins.
- Task: fix mobile layout. Bad: rewrites the dashboard grid system.

## Debug Before Patch Rule

For these bug classes, collect runtime evidence before patching:
- auth/permission failures
- API response parsing bugs
- UI event/state bugs
- race conditions in data fetching
- bugs where the stack trace points only to a symptom

Runtime evidence means: console logs, network traces, debugger breakpoints, or failing test with inspected variables.

## Risk Tiers

- **low**: copy changes, CSS-only, tests-only
- **medium**: new UI feature, API endpoint, new component
- **high**: auth, API key handling, file uploads, production config
- **blocked**: deleting data, rotating secrets, disabling tests, weakening auth

## Provenance

Every patch must leave a trace to `.agent/traces/<task-id>.md`. Required fields:
- changed files, commands run and results, tests added, assumptions, risk tier, rollback plan.

## Invariants

Before editing, check `.agent/invariants.yaml`. These constraints must survive any patch.
