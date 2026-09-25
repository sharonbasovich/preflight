# How we used IBM Bob 2.0

Honest accounting — who built what, and where the evidence lives.
*(≤500 words, as required.)*

## The setup

PreFlight was built across two AI development partners:

- **Devin** (Cognition) executed the overnight MVP under an automation: the
  diff parser, the rule engine, the A–F scoring, the report generator, the
  UI, and the test suite.
- **IBM Bob 2.0** picked the project up from there. Two official clients were
  used: **Bob IDE** (the hackathon-required artifact — task session summary
  PNGs in `bob_sessions/ide/`) and **Bob Shell** (optional CLI — full
  stream-json transcripts in `bob_sessions/shell-*/`).

## What Bob did — Bob IDE

*[Completed after IDE sign-in — task summary PNGs are committed under
`bob_sessions/ide/`.]*

## What Bob did — Bob Shell (supplementary)

Three real `bob run` task sessions produced committed code:

1. **New analysis rule.** Bob implemented `commented-out-code` in
   `src/rules.ts` per the AGENTS.md contract — a conservative detector for
   commented-out source (assignments, calls, control keywords) that
   escalates medium→high inside security-sensitive paths, plus the
   `CHECKLISTS` report entry and 8 tests (41 total, all passing).
2. **CI integration.** Bob upgraded `.github/workflows/dogfood.yml` so
   PreFlight posts (or updates) a single `<!-- preflight-report -->` comment
   on every PR via `actions/github-script@v7`, with fork-safe
   `continue-on-error` handling, and documented it in the README.
3. **Score calibration.** Bob audited the grading bands against the
   `fixtures/` corpus, found `borderline.diff` over-graded at D, and made the
   minimal band adjustment (C ≤44, D ≤64) with full reasoning in
   `docs/SCORE_AUDIT.md`.

Total spend: **~2.1 of the team's 40 Bobcoins** across four sessions —
deliberately economical, in line with the guide's best practices.

## Why the tasks fit Bob

Every prompt required repository context, not snippet completion: Bob read
`AGENTS.md`, located the rule contract, reused the existing `SENSITIVE_PATH`
convention, added tests in the project's own `diffOf()` style, and iterated
`npm test` / `npm run typecheck` until green — the agentic loop the
hackathon is scored on.

## Honesty note

The `bob_sessions/` exports are the source of truth. Bob Shell sessions are
logged as supplementary evidence only; the event's required IDE artifacts
live in `bob_sessions/ide/`. Nothing in this repo is fabricated.
