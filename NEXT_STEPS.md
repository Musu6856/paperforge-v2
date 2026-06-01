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

In development, the app can run without `DATABASE_URL`. Project data then lives in memory and resets when the dev server restarts.

## Next Priority

1. Open the local app and run the full UI flow: create a research idea, confirm the generated project, and inspect the right-side `Agent` tab.
2. Make the Agent trace more useful in the product: show action, status, workflow steps, and any failure reason in a compact collapsible layout.
3. Improve the middle conversation so Agent progress is visible there too, not only on the right.
4. After the Agent shell feels real, decide whether the next milestone is guided model setup or symbolic equilibrium solving.

Recommended next implementation step:

- Add a small UI-level smoke test or manual browser checklist for the Agent tab after creating a research project.

## Boundaries

- Keep original PaperForge baseline repo untouched.
- Do not rebuild the whole app yet.
- Do not add a second root-level Agent framework directory.
- Keep Agent orchestration under `src/lib/agent-runtime/` for this v2 repo unless the architecture is intentionally changed.
- Property analysis and full paper drafting are not the priority for the next step.
