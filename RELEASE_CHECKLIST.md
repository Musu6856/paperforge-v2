# PaperForge v2 Release Checklist

Use this checklist before promoting a PaperForge v2 change to production.
The goal is to make each release repeatable: local confidence, persistence
confidence, deployed-app confidence, and a short written record.

## Scope

- Repository: `D:\Agent测试\paperforge-v2`
- Production app: `https://paperforge-v2.vercel.app`
- GitHub remote: `https://github.com/Musu6856/paperforge-v2.git`
- Vercel project: the independent `paperforge-v2` project, not the original
  `paperforge` project.

Do not write secrets, API keys, database URLs, or Clerk keys into this file,
`NEXT_STEPS.md`, commits, screenshots, or issue comments.

## 1. Preflight

Run these from the repository root:

```powershell
git status --short --branch
git log --oneline -5
```

Pass criteria:

- The branch is the intended release branch.
- The worktree is clean, or every changed file is intentionally part of the
  release.
- `NEXT_STEPS.md` describes the current milestone and any known warnings.

## 2. Local Verification

```powershell
node --test "src/**/*.test.mjs"
npx tsc --noEmit
npm run lint
npm run build
git diff --check
```

Current expected warnings:

- `npm run lint` can report the existing `pane-splitter.tsx`
  `aria-orientation` warning while still exiting with 0 errors.
- `npm run build` can report the existing Turbopack tracing warning involving
  `next.config.ts` and `development-project-store.ts` while still completing.

Pass criteria:

- Tests report 0 failures.
- TypeScript exits 0.
- ESLint exits 0.
- Production build exits 0.
- `git diff --check` exits 0.

## 3. Local No-Database Browser Smoke

Use this when checking local fixtures without spending provider calls.

If `.env.local` contains Neon variables, start the dev server with database
variables intentionally blanked from the process environment so the
development file store is used:

```powershell
$env:DATABASE_URL=' '
$env:NEON_DATABASE_URL=' '
$env:NEON_POSTGRES_URL=' '
$env:NEON_DATABASE_URL_UNPOOLED=' '
$env:NEON_POSTGRES_URL_NON_POOLING=' '
npm run dev
```

Seed the stable fixtures in another terminal:

```powershell
npm run dev:seed:simple-equilibrium
npm run dev:seed:implicit-system
```

Smoke these URLs:

- `http://localhost:3000/research/00000000-0000-4000-8000-000000000124`
  for the solved simple-equilibrium fixture.
- `http://localhost:3000/research/00000000-0000-4000-8000-000000000123`
  for the implicit-system fixture.
- `http://localhost:3000/research?new=1` for the create-project flow.

Pass criteria:

- Refreshing a fixture restores the same project from
  `.paperforge-dev/projects.json`.
- The middle conversation still shows the detailed derivation content.
- The right-side assets pane remains usable when resized.
- The Agent tab shows workflow id, action, status, duration, steps, and
  structured details.
- The inline Agent trace under the latest assistant message can expand.
- The simple-equilibrium fixture shows the `Auto advance` / `自动推进` checkbox
  and it can be enabled.
- Browser console has no new app errors. Clerk development-key warnings are
  acceptable in local development.

## 4. Production Persistence Smoke

Run this only when the current shell points at a disposable, staging, or
intentionally verified production database environment:

```powershell
npm run smoke:production-persistence
```

If local Neon connectivity fails but the network is otherwise available through
the local proxy, use the proxy-aware Node path:

```powershell
$env:HTTP_PROXY='http://127.0.0.1:7890'
$env:HTTPS_PROXY='http://127.0.0.1:7890'
$env:NODE_OPTIONS='--use-env-proxy'
npm run smoke:production-persistence
```

Pass criteria:

- The smoke inserts a solved fixture row.
- The row reads back with Agent trace data.
- Updating the row preserves and appends Agent runs.
- Output includes the expected trace/persistence assertions such as
  `agentRunSteps` and `updateAgentRuns`.
- The smoke deletes its temporary row at the end.

## 5. GitHub And Deployment

```powershell
git status --short --branch
git push origin <branch>
git push origin HEAD:main
```

Deploy through the connected Vercel project, then record:

- commit hash;
- deployment id;
- deployment URL;
- production alias;
- Vercel status.

Pass criteria:

- The deployment belongs to `paperforge-v2`.
- It does not promote or mutate the original `paperforge` project.
- Build logs do not contain a new blocking error.
- Required Vercel env vars are present for Clerk, model provider fallback, and
  Neon.

## 6. Deployed-App Browser Smoke

Open `https://paperforge-v2.vercel.app`.

Smoke checklist:

- Home page returns 200.
- Sign in works.
- The bottom-left account/settings area is visible after login.
- Model settings can be opened.
- Create a new research project from `/research?new=1`.
- Refresh the project URL and confirm history persists.
- Generate or inspect Agent trace details in the right Agent tab.
- Confirm the middle detailed derivation content remains visible.
- Run a simple equilibrium or fixture-like path when feasible.
- If auto advance is enabled, confirm it does not bypass user-choice or
  pending-review states.
- Browser console has no new app errors.

## 7. Cleanup And Record

After the release smoke:

- Delete any disposable smoke projects created in production.
- Stop local dev servers that are no longer needed.
- Update `NEXT_STEPS.md` with:
  - verification commands and pass/fail results;
  - deployment URL and status;
  - deployed-app smoke notes;
  - known warnings or blockers;
  - the next recommended implementation step.

Do not mark the release ready when any pass criterion above is unresolved.
