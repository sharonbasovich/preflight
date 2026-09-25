# Bob usage log — honest accounting

This file distinguishes work done by **IBM Bob** from work done by **Devin**
(the AI agent that executed the overnight MVP build under automation). It
exists so the repo tells a true story about how the product was made.

## Built by Devin (Fri Sep 25)

Everything that existed before the Bob sessions below:

- Full MVP: unified-diff parser, 12-rule analysis engine, A–F scoring,
  markdown report generator, single-page UI
- Vitest suite, TypeScript strict typecheck, Vite build
- Docs: event notes, concept, this file, BOB_ACCESS
- Submission assets under `submission/`
- Repo plumbing: CI, GitHub Pages deploy, dogfood workflow, fixtures

## Built by IBM Bob — Shell (evidence: `bob_sessions/shell-*/`)

Bob Shell is the *optional* client per the official guide — this work is real
and landed in the codebase, but the qualifying artifact is the IDE evidence
below.

| Task | Bob session | What changed | Bobcoins |
| ---- | ----------- | ------------ | -------- |
| `commented-out-code` rule | `shell-01-commented-out-code` (task `6533984d…`) | New rule in `src/rules.ts` (medium → high on sensitive paths), `CHECKLISTS` entry in `src/report.ts`, 8 new tests (41 total) | 1.13 |
| PR-comment CI integration | `shell-02-pr-comment-ci` (task `1be6a4c7…`) | `dogfood.yml` posts/updates a single `<!-- preflight-report -->` PR comment via `actions/github-script@v7`, fork-safe via `continue-on-error`, README "CI integration" section | 0.33 |
| Score-band audit | `shell-03-score-audit` (task `9ff9d283…`) | Audited bands against `fixtures/`; raised C ceiling 29→44, D 49→64 so `borderline.diff` lands at C; wrote `docs/SCORE_AUDIT.md` | 0.62 |

A 0.02 Bobcoin connectivity check also ran (`f4aac5da…`, reply-only).
**Total consumed: ~2.1 of 40.**

Each `shell-*` folder contains the exact prompt, the raw stream-json
transcript, the session summary, and the diff Bob produced — no
fabrications.

## Built by IBM Bob — IDE (the qualifying evidence)

| Task | IDE session summary PNG | Notes |
| ---- | ----------------------- | ----- |
| _pending sign-in_ | `bob_sessions/ide/` | No IDE sessions yet. The temporary Linux VM lacked a protected keyring; use a secure IDE environment and export genuine summaries after sign-in. |

## What is NOT claimed

- Bob IDE usage is **not claimed** until `bob_sessions/ide/` contains the
  official task session summary PNGs.
- Bob Shell work is genuine and committed, but is logged here as
  *supplementary*, not as the event's required evidence.
