# Contributing

Small project, small rules:

1. `npm install && npm run dev` — the whole app is one page; everything else
   runs through `npm test`, `npm run typecheck`, `npm run build`.
2. **New rules** live in `src/rules.ts` — pure functions over the parsed diff,
   `{ id, name, severity, description, run(diff) → Finding[] }`. Add a
   `CHECKLISTS` entry in `src/report.ts` and positive + negative tests.
   See `AGENTS.md` for the full contract.
3. Keep the app local-first: no network calls, no analytics, no uploads —
   ever. The diffs it scans contain secrets; that's the point.
4. Keep dependencies at zero (runtime) — the engine is deliberately
   dependency-free so it can be lifted into CI later.
5. Match the existing terse style; no diff-narration comments.
