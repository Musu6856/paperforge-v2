<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project facts

- PaperForge is a Chinese theoretical research workspace for symbolic equilibrium, comparative statics, and paper export.
- Root docs that matter now: `README.md` for onboarding and `src/` for implementation.
- Process artifacts and old agent docs were removed from the repository; do not reintroduce `docs/superpowers/`, `.agents/`, `skills-lock.json`, or the old root planning docs unless a future task explicitly restores them.
- The active model source fallback order in code is `DEEPSEEK_API_KEY` → `OPENAI_COMPATIBLE_API_KEY` → `MIMO_API_KEY` → `OPENAI_API_KEY`.
