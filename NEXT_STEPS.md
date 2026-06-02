# PaperForge v2 Handoff

This repository is the new Agent-focused PaperForge v2 workspace.

## Working Directory

- Current repo: `D:\Agent测试\paperforge-v2`
- Source baseline repo: `D:\Agent测试\Claude code test\paperforge`
- Do not modify the source baseline repo unless explicitly asked.

## Current Commits

- `77105b3 chore: import PaperForge baseline`
- `da968ca feat: route research generation through Mastra workflow`
- `32fbb03 feat: add local development project fallback`
- `885f368 feat: add symbolic solver and agent trace UI`
- `897d0d6 fix: persist local projects and normalize raw latex`
- `94b01ea fix: submit chat input on enter`
- `66c6297 docs: update handoff after local fixes`

## Product Direction

The goal is not to invent a totally new product from scratch. The goal is to turn the original PaperForge into a visible, standard Agent-framework-based project.

The chosen framework is Mastra because this codebase is already TypeScript/Next.js, and Mastra is the fastest fit for a small productized Agent demo.

The product bar is deliberately demo-oriented rather than solver-maximalist:

- For non-expert users, PaperForge should clearly feel like an Agent workspace: it plans, runs, records traces, preserves history, and exposes what it did.
- For users who understand theoretical platform/equilibrium research, PaperForge should demonstrate that it can solve and analyze simple, well-structured models.
- Complex bespoke mechanism models can fall back to reaction-function or implicit-system scaffolds instead of pretending to solve everything.
- Deep symbolic-solving coverage is useful only when it supports the demo and simple-model research experience; it is not the main product promise for this milestone.

Current scope:

- Keep the existing PaperForge research workflow as the product surface.
- Route research generation through a Mastra workflow.
- Preserve Agent execution traces as product-visible records.
- Make local development runnable without requiring a Neon database.
- Keep the work focused on a showable Agent product before rebuilding deeper solver logic.

## Completed

- Copied the original PaperForge baseline into this clean repo.
- Installed Mastra dependencies.
- Added `src/lib/agent-runtime/research-workflow.ts`.
- Wrapped `/api/research/generate` with `runResearchAgentWorkflow`.
- Added `AgentRunTrace` and `agentRuns` to `ResearchSession`.
- Added a right-side `Agent` assets tab that shows the latest Mastra run and steps.
- Added dev-only in-memory project storage when `NODE_ENV=development` and `DATABASE_URL` is missing.
- Verified the no-db local API path can generate, save, list, update, and delete projects.
- Added an Agent tab browser smoke checklist for the local create-project flow.
- Ran the checklist on `http://localhost:3001/research?new=1`: project creation passed, the `Agent` tab showed `paperforge-research-workflow`, `discover_directions`, run status, duration, and the three Mastra steps; browser error console was empty.
- Implemented the compact collapsible Agent trace layout: the run summary exposes status/action/workflow/duration, successful steps are compact by default, and failed steps default open with their failure summary.
- Re-verified the Agent tab after the compact layout change with a local project: the `Agent` tab opened, a step disclosure expanded to show the generation summary, and browser error console remained empty.
- Added a compact Agent progress surface under the latest assistant message in the middle conversation.
- Re-verified the middle conversation Agent progress surface with a local project: the summary appeared under the assistant reply, expanded to show workflow/action/duration and all three Mastra steps, and browser error console remained empty.
- Started the symbolic equilibrium milestone with a narrow deterministic Hotelling solver under `src/lib/symbolic-equilibrium-solver.ts`.
- The local solver now returns the closed-form commission/subsidy equilibrium only for the canonical two-platform, two-sided Hotelling structure.
- Noncanonical but still structured models no longer get forced into the default closed-form result:
  - canonical Hotelling demand with noncanonical profit equations returns `reaction_function`;
  - structured mechanism models that are not closed-form-ready return `implicit_system`;
  - unsupported platform structures still return `symbolic_failure`.
- `generateSymbolicEquilibrium` is wired through the deterministic solver, and property analysis is allowed for `solved`, `reaction_function`, and `implicit_system` while still blocking `symbolic_failure`.
- Provider parsing, provider fallback attachment, local fallback persistence, right-side patch application, flow labels, and workbench status labels now understand `reaction_function` and `implicit_system`.
- The Mastra Agent runtime has been split into a more standard structure under `src/lib/agent-runtime/`:
  - `workflows/research-workflow.ts` owns the Mastra workflow;
  - `steps/` owns the three workflow steps and their schemas;
  - `tools/research-generation-tool.ts` wraps the structured research generator;
  - `traces/research-trace.ts` owns trace labels, summaries, and run attachment.
- The compatibility entry `src/lib/agent-runtime/research-workflow.ts` still re-exports `runResearchAgentWorkflow`, so the API route and existing tests do not need import changes.
- Agent trace output now carries structured step details, not only step names:
  - `plan_research_action` records the local plan, expected output, and execution mode;
  - `run_research_generation` records whether the result came from the provider or fallback, the resulting phase, asset status/counts, pending patch summary, and assistant-message summary;
  - `summarize_research_output` records the final readable summary, resulting phase, and next pending action.
- The right-side Agent tab and the inline Agent trace under the latest assistant message both display these step summaries/details without altering the assistant's main derivation text.
- Development no-database project storage now persists to `.paperforge-dev/projects.json`, so local projects survive browser refreshes and dev server restarts.
- The markdown renderer now protects display math blocks and wraps standalone raw LaTeX formula lines before symbolic-token normalization, avoiding occasional red/raw formula rendering.
- The center chat composer now submits on plain Enter, keeps Shift+Enter for multiline drafts, and avoids submitting while IME composition is active.
- The user manually verified the latest local flow after these fixes and reported no obvious issues.
- The center conversation column now constrains Markdown/prose message bubbles to the available pane width, so property-analysis replies shrink correctly when the right research-assets pane is widened.
- Browser-smoked the enhanced Agent trace UI after the latest commits:
  - refreshing a local project kept the persisted history and opened the project record again;
  - the middle conversation still showed the detailed derivation content;
  - the inline Agent trace under the latest assistant message expanded to show workflow/action/duration plus plan, generation, and summary step details;
  - the right-side Agent tab showed `paperforge-research-workflow`, action, duration, structured step details, provider/fallback source, result phase, asset counts, and assistant-message summary;
  - no new browser console errors appeared during the smoke check; only the existing Clerk development-key warning was present.
- Rechecked the `implicit_system` path at the code level because no existing local browser project had that status: the targeted research-session, research-flow, generation-result, and symbolic-solver tests passed 43/43.
- `plan_research_action` and `summarize_research_output` should stay deterministic trace steps for now: they are cheap, stable, product-visible metadata and should not replace or hide the middle derivation text with extra model calls.
- The symbolic solver now carries supplied concrete utility/profit equations into `reaction_function` and `implicit_system` scaffolds. Concrete mechanism terms such as quality effort revenue/cost now appear in the FOC list, derivation text, and SymPy scaffold instead of being reduced to a generic `F(z,\theta)=0` placeholder. It still returns `reaction_function` or `implicit_system` until a closed form is actually proven.
- The symbolic solver now recognizes the narrow explicit quadratic-effort mechanism `\rho a_i n_i^B - c a_i^2/2` inside noncanonical profit equations. It keeps the result as `reaction_function`, but narrows the effort FOC to `\rho n_i^B-c a_i=0` and records `a_i^*=\rho n_i^B/c` with the condition `c>0`.
- Added a dev-only implicit-system fixture for repeatable browser smoke testing without spending a provider call:
  - run `npm run dev:seed:implicit-system` to seed `/research/00000000-0000-4000-8000-000000000123`;
  - the fixture project is already in `analysis` phase, has `equilibriumResult.status === "implicit_system"`, includes three property analyses, and carries a structured Mastra-style Agent run trace;
  - the development project store now reloads when `.paperforge-dev/projects.json` changes externally, so the seed command is visible to a running dev server without restarting it.
- Added a dev-only simple-equilibrium fixture for product demos where the local solver should visibly succeed:
  - run `npm run dev:seed:simple-equilibrium` to seed `/research/00000000-0000-4000-8000-000000000124`;
  - the fixture project is already in `analysis` phase, has `equilibriumResult.status === "solved"`, includes three property analyses, and carries a structured Mastra-style Agent run trace;
  - this gives local browser smoke tests a stable "simple model succeeds" counterpart to the implicit-system fixture's "complex model stays honest" path.
- Browser-smoked the implicit-system fixture on `http://localhost:3000/research/00000000-0000-4000-8000-000000000123`:
  - the right-side assets opened on the Properties tab and showed the implicit-system property-analysis path;
  - the middle derivation displayed the implicit system and property-analysis content;
  - the inline Agent trace expanded under the latest assistant message and showed workflow/action/duration plus fixture source, phase, status, and property count;
  - the right-side Agent tab showed `paperforge-research-workflow`, `analyze_properties`, `implicit_system`, and the three fixture trace steps;
  - browser console output had no new errors, only the existing Clerk development-key warning.
- Fixed the logged-in empty-workspace sidebar regression: both the normal project sidebar and the empty `/research?new=1` sidebar now reuse the same bottom account/settings toolbar, so model settings remain reachable before a project exists.
- Added a regression test for the empty research sidebar account/settings controls.
- Added shared Neon project row mappers:
  - `projectToInsertRow` is used by `/api/projects` and the production persistence smoke insert path;
  - `projectToUpdateRow` is used by `/api/projects/[id]` and the production persistence smoke update path;
  - the mapper regression test proves `researchSession.agentRuns` survives both insert and update payloads while update payloads do not mutate `ownerId` or `createdAt`.
- Enhanced `npm run smoke:production-persistence`: it now inserts a solved fixture with Agent trace data, reads it back, updates the same project with an additional Agent run, reads it back again, verifies `updateAgentRuns: 2`, and deletes the smoke row.
- Browser-smoked the empty local workspace on `http://localhost:3000/research?new=1`: the left sidebar showed the model summary and `设置` button, and opening settings showed `工作台设置`, language controls, and model settings. In the unauthenticated local browser, Clerk's `UserButton` itself renders empty; after login it uses the same toolbar slot.

## Verification Commands

Run these from `D:\Agent测试\paperforge-v2`:

```powershell
node --test "src/**/*.test.mjs"
npx tsc --noEmit
npm run lint
npm run build
```

Known current lint state:

- `npm run lint` exits with 0 errors and one existing warning in `src/components/research-workspace/pane-splitter.tsx` about `aria-orientation` on a button.

Latest verification on the current branch:

- `node --test "src/**/*.test.mjs"` passed, 245/245.
- `node --test src\components\research-workspace\research-sidebar-empty-state.test.mjs` passed.
- `node --test src\lib\project-records.test.mjs` passed, 8/8.
- `npx tsc --noEmit` passed.
- `npm run lint` passed with 0 errors and the existing `pane-splitter.tsx` `aria-orientation` warning.
- `npm run build` passed. It reported one Turbopack warning about `next.config.ts` / `development-project-store.ts` tracing, but the production build completed successfully.
- `npm run smoke:production-persistence` passed against the independent v2 Neon database when Node was run through the local proxy (`HTTP_PROXY`, `HTTPS_PROXY`, and `NODE_OPTIONS=--use-env-proxy`); output included `agentRunSteps: 3` and `updateAgentRuns: 2`. One earlier attempt hit a local `ECONNRESET` before assertions, consistent with the known intermittent local Neon/proxy connection issue.
- Targeted `implicit_system` tests passed, 43/43:
  - `src/lib/research-session.test.mjs`
  - `src/lib/research-flow.test.mjs`
  - `src/lib/research-generation-result.test.mjs`
  - `src/lib/symbolic-equilibrium-solver.test.mjs`

## Local Run

```powershell
npm run dev
```

If port 3000 is occupied:

```powershell
npm run dev -- --port 3001
```

In development, the app can run without `DATABASE_URL`. Project data is stored locally at `.paperforge-dev/projects.json` and survives browser refreshes and dev server restarts. Delete that file or directory to reset the local no-db workspace.

Seed a solved simple-model demo project:

```powershell
npm run dev:seed:simple-equilibrium
```

Then open `/research/00000000-0000-4000-8000-000000000124`.

## Agent Tab Browser Smoke Checklist

Purpose: verify the local no-db development flow makes the Mastra run visible after creating a research project.

Preconditions:

- Run from this repo, not the original baseline repo.
- Start the app with `npm run dev`; use `npm run dev -- --port 3001` if port 3000 is occupied.
- Leave `DATABASE_URL` unset for the local file-backed development project store, or use a disposable local database.

Steps:

1. Open `/research?new=1`.
2. Submit a concrete Chinese research idea in the center chat composer. Plain Enter should submit; Shift+Enter should add a newline.
3. Wait for navigation to `/research/<project-id>` and for the right asset pane to populate directions.
4. Click the right-side `Agent` asset tab.
   - If Clerk's keyless prompt overlaps the lower-right app area, collapse it first so it does not intercept tab clicks.
5. Confirm the Agent tab shows the latest run status, workflow id, action, duration, execution steps, and structured step details.
6. Confirm the expected Mastra steps are visible: `规划研究动作`, `执行研究生成`, and `整理结构化结果`.
7. If generation falls back because no model key is configured, confirm the Agent run still completes and the step details report `调用来源: 本地 fallback`.
8. Check browser console output for unexpected errors.

Pass criteria:

- A project is created and saved in the local development project store.
- After refreshing the browser, local project history remains available when running without `DATABASE_URL`.
- The `Agent` tab is reachable without collapsing or resizing the right pane.
- The tab exposes the Mastra workflow identity, action, status, step list, structured details, and failure reason area when applicable.
- No unhandled console error appears during the create-project flow.

## Production Readiness

Current production MVP shape:

- Clerk protects `/research`, `/projects`, and `/api` routes outside development guest mode.
- Neon/Drizzle is the production project store when `DATABASE_URL` is configured.
- GitHub remote is `https://github.com/Musu6856/paperforge-v2.git`; the latest v2 branch and `main` have been pushed.
- Vercel project is now the independent `paperforge-v2` project, not the old `paperforge` project.
- Vercel Marketplace Neon resource `paperforge-v2-postgres` is connected to the Vercel `paperforge-v2` project and exposes prefixed `NEON_` environment variables.
- The code resolves database URLs from `DATABASE_URL` first, then Neon-prefixed URLs such as `NEON_DATABASE_URL`; Drizzle migrations prefer unpooled Neon URLs when available.
- The connected v2 Neon database has been bootstrapped with the current `projects` table and indexes via Neon HTTP SQL because local `drizzle-kit push` still stalls on its websocket schema-pull step.
- `npm run smoke:production-persistence` passed against the independent v2 Neon database when Node was run through the local proxy (`HTTP_PROXY`, `HTTPS_PROXY`, and `NODE_OPTIONS=--use-env-proxy`).
- First Vercel deployment for the independent `paperforge-v2` project is ready at `https://paperforge-v2.vercel.app`; it does not touch the old `paperforge` project.
- The first deployment initially returned `500 Internal Server Error` because the new project was missing Clerk environment variables. `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, Clerk route URLs, and DeepSeek provider variables have now been added to the v2 production/development environments, and the production homepage returns `200 OK`.
- Latest production deployment after the sidebar account/settings fix:
  - deployment id: `dpl_ACm5HhYuNtXXUTqMFMYAqvzzNye1`;
  - production deployment URL: `https://paperforge-v2-hby9kirjz-musu6856s-projects.vercel.app`;
  - production alias: `https://paperforge-v2.vercel.app`;
  - Vercel status: `Ready`;
  - build completed successfully with the same existing Turbopack `development-project-store.ts` tracing warning.
- Local `.paperforge-dev/projects.json` storage is development-only and activates only in development guest mode without `DATABASE_URL`.
- Project assets are stored in the `projects` table. The `research_session` JSONB field carries messages, pending decisions, asset state, and `agentRuns`, so Agent traces persist with the project for the current MVP.
- Runtime model calls go through `/api/research/generate`, protected by user auth and the existing in-memory rate limiter.
- A production persistence smoke command is available once `DATABASE_URL` points at a disposable or staging Neon database:

```powershell
npm run smoke:production-persistence
```

  It inserts a solved simple-equilibrium project with Agent trace data, reads it back through the project row mapper, verifies the trace and property assets, updates the title, and deletes the smoke row.

上线前必须稳定的事项:

- Verify the deployed `paperforge-v2` app end to end in the browser now that Clerk and provider environment variables are present.
- Current local blocker: direct local connections to Neon still time out intermittently, and `npm run db:push` still stalls at "Pulling schema from database...". Local Neon HTTP smoke can pass by routing Node through the local proxy with `NODE_OPTIONS=--use-env-proxy`.
- Keep dev fixtures out of the production user flow. `npm run dev:seed:simple-equilibrium` and `npm run dev:seed:implicit-system` are regression tools, not product entry points.
- Preview environment variables still need a follow-up pass if Git branch previews are required. Production and development now have Clerk keys and DeepSeek following the code fallback order `DEEPSEEK_API_KEY` -> `OPENAI_COMPATIBLE_API_KEY` -> `MIMO_API_KEY` -> `OPENAI_API_KEY`; the v2 Neon variables are also present.
- Decide whether the in-memory rate limiter is acceptable for the first public demo; for multi-instance production it should move to durable storage.
- Decide whether embedded `researchSession.agentRuns` is enough for the MVP. A later production observability upgrade can split Agent runs into a separate table, but the current JSONB strategy is acceptable for a small launch.
- Run browser smoke checks for both the normal generated-project flow and the two dev fixtures before each release candidate.

## Next Priority

1. Keep polishing the visible Agent product loop: project persistence, trace readability, middle derivation preservation, right-side assets, and repeatable browser smoke checks.
2. Move from local-only confidence toward production readiness: verify the Neon-backed project path, database migration path, Clerk protection, provider envs, and Agent trace persistence under `DATABASE_URL`.
3. Use the simple-equilibrium and implicit-system fixtures for future browser regression checks whenever right-side assets, middle derivation, inline Agent trace, or property-analysis UI changes.
4. Keep the symbolic solver focused on simple, well-structured equilibrium examples that make the research demo credible.
5. Keep monitoring whether deterministic trace planning/summarization remains sufficient before making those steps model-backed.

Recommended next implementation step:

- Add an authenticated browser/API release smoke for the deployed app: login, create a simple project, verify it persists after refresh, confirm the latest Agent trace and middle derivation are visible, and then delete the smoke project.
- Improve the demo loop before adding more solver depth: make sure saved projects, Agent trace details, simple equilibrium solving, property analysis, and local fixtures remain easy to test and explain.
- If solver work continues, prefer generic simple-model coverage over narrow mechanism-specific extensions. Reaction-function and implicit-system outputs are acceptable for complex models as long as the UI presents them honestly.
- If planning/summarization become model-backed, keep them cheap and structured; do not replace the current middle derivation content with hidden or generic reasoning text.

## Boundaries

- Keep original PaperForge baseline repo untouched.
- Do not rebuild the whole app yet.
- Do not add a second root-level Agent framework directory.
- Keep Agent orchestration under `src/lib/agent-runtime/` for this v2 repo unless the architecture is intentionally changed.
- Do not disturb the middle conversation detailed process display unless explicitly requested.
- Property analysis and full paper drafting are still secondary to stable symbolic assets and Agent trace structure.
