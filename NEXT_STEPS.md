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

## Product Direction

The goal is not to invent a totally new product from scratch. The goal is to turn the original PaperForge into a visible, standard Agent-framework-based project.

The chosen framework is Mastra because this codebase is already TypeScript/Next.js, and Mastra is the fastest fit for a small productized Agent demo.

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
- The local solver now returns the closed-form commission/subsidy equilibrium only for the canonical two-platform, two-sided Hotelling structure; unresolved mechanism functions or noncanonical profit equations return `symbolic_failure` instead of reusing the default closed-form result.
- `generateSymbolicEquilibrium` is now wired through the deterministic solver, and property analysis is blocked unless the equilibrium result is actually `solved`.
- Development no-database project storage now persists to `.paperforge-dev/projects.json`, so local projects survive browser refreshes and dev server restarts.
- The markdown renderer now protects display math blocks and wraps standalone raw LaTeX formula lines before symbolic-token normalization, avoiding occasional red/raw formula rendering.
- The center chat composer now submits on plain Enter, keeps Shift+Enter for multiline drafts, and avoids submitting while IME composition is active.
- The user manually verified the latest local flow after these fixes and reported no obvious issues.

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

## Local Run

```powershell
npm run dev
```

If port 3000 is occupied:

```powershell
npm run dev -- --port 3001
```

In development, the app can run without `DATABASE_URL`. Project data is stored locally at `.paperforge-dev/projects.json` and survives browser refreshes and dev server restarts. Delete that file or directory to reset the local no-db workspace.

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
5. Confirm the Agent tab shows the latest run status, workflow id, action, duration, and execution steps.
6. Confirm the expected Mastra steps are visible: `规划研究动作`, `执行研究生成`, and `整理结构化结果`.
7. If generation falls back because no model key is configured, confirm the Agent run still completes and the step summary reports `source=fallback`.
8. Check browser console output for unexpected errors.

Pass criteria:

- A project is created and saved in the local development project store.
- After refreshing the browser, local project history remains available when running without `DATABASE_URL`.
- The `Agent` tab is reachable without collapsing or resizing the right pane.
- The tab exposes the Mastra workflow identity, action, status, step list, and failure reason area when applicable.
- No unhandled console error appears during the create-project flow.

## Next Priority

1. Continue the symbolic equilibrium milestone beyond the canonical Hotelling core.

Recommended next implementation step:

- Extend solver coverage only when the model structure is explicit enough to verify: first add a typed reaction-function/implicit-system result for concretized mechanisms, then add UI copy that explains how to narrow unsupported models.

## Boundaries

- Keep original PaperForge baseline repo untouched.
- Do not rebuild the whole app yet.
- Do not add a second root-level Agent framework directory.
- Keep Agent orchestration under `src/lib/agent-runtime/` for this v2 repo unless the architecture is intentionally changed.
- Property analysis and full paper drafting are not the priority for the next step.
