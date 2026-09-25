# AGENTS.md — guidance for AI agents working in this repo

## What this is

PreFlight: a local-first, pre-merge **diff risk scanner**. Vanilla TypeScript +
Vite, no framework, no backend, no network calls — the app must never send a
diff anywhere (diffs contain secrets; that is the product's security model).

## Layout

- `src/diff.ts` — unified-diff parser. Public: `parseDiff`, `fileName`,
  `addedLines`, `addedText`.
- `src/rules.ts` — the rule engine. Each rule is `{ id, name, severity,
  description, run(diff): Finding[] }`; `runRules` aggregates + sorts.
- `src/score.ts` — severity-weighted scoring → A–F grade + verdict.
- `src/report.ts` — markdown report builder (+ reviewer checklist map).
- `src/main.ts` — all DOM code (~200 lines).
- `src/cli.ts` — terminal entry (`npm run cli`); same engine, prints the
  markdown report, exit 1 on grade C/D/F (pre-push/CI gate).
- `fixtures/` — `risky.diff` (deliberately toxic demo input) and `clean.diff`,
  imported as `?raw` in `main.ts` and read from disk in tests.
- `tests/` — vitest; `diffOf()` helper fabricates one-file diffs.
- `submission/`, `docs/` — hackathon deliverables.

## Commands

`npm run dev` · `npm test` · `npm run typecheck` · `npm run build` · `npm run preview` · `npm run cli`

## Contracts worth preserving

- **Rules are pure functions** — no I/O, no DOM, no globals. They see the
  parsed diff only. This is what makes the engine CI-portable; keep it pure.
- **`severity`** is one of `critical|high|medium|low|info`; scoring weights
  live in `score.ts` (`WEIGHTS`) with diminishing returns per rule id.
- **Findings carry `file`, optional `line`, `message`, `snippet`,
  `suggestion`** — the UI renders all of them; keep them human.
- **`ENV_EXAMPLE`-class files are exempt** from secret rules — match the
  existing convention when adding rules (see `secret-literal`, `entropy-secret`).
- **New rules need:** the rule object, a `CHECKLISTS` entry in `report.ts`,
  positive+negative tests, and it will appear automatically in the UI's
  rules list (it renders `listRules()`).

## Style

Strict TS (`noUnusedLocals` on). No comments unless they describe the code
generally — never diff-narration comments. Match the terse style.
