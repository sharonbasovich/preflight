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

Bob IDE 2.2.0 was signed in via the portal OAuth flow
(`sharon@basovich.com`, Enterprise plan, `ibm-hackathon-lablab` team —
40-Bobcoin budget). Task evidence lives in `bob_sessions/ide/`:

| Task | Evidence | What changed | Bobcoins |
| ---- | -------- | ------------ | -------- |
| SARIF 2.1.0 output mode (`--sarif`) | `ide/02-task-sarif-header-summary.png` + `ide/bob-task-sarif.json` (task `9632df34…`) | New `src/sarif.ts` (`toSarif`), `--sarif` flag in `src/cli.ts`, 12 new tests (56 total) | 0.84 |
| Score-band audit (also in IDE task history) | `ide/01-task-score-audit-header-summary.png` + `ide/bob-task-score-audit.json` (task `9ff9d283…`) | Same work as `shell-03` — the IDE task list shares the Bob task store, so its header summary is exportable in the IDE | (counted above) |

`ide/00-signin-account-settings.png` shows the signed-in account, plan,
and remaining budget.

## What is NOT claimed

- Only the SARIF task was executed inside the IDE GUI; the score-audit task
  ran via Bob Shell but is truthfully exportable from the IDE's shared task
  history.
- Bob Shell work is genuine and committed, but is logged here as
  *supplementary*, not as the event's required evidence.
