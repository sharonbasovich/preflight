# PreFlight ✈

**Pre-merge diff risk scanner. Drop a `git diff` in, get a risk report out — 100% in your browser.**

PreFlight catches the stuff humans skim past right before merge: pasted
credentials, unresolved conflict markers, debug leftovers, migrations with no
rollback, undeclared env vars, `package.json` bumps without the lockfile,
sensitive-area churn, missing tests. Paste the diff → get an A–F grade,
severity-ordered findings, a reviewer checklist, and a markdown report you can
drop straight into the PR.

Everything runs locally in the page. Diffs routinely *contain* secrets —
that's the point of the tool — so they never leave your browser.

## Demo

- Live demo: _see the deployment URL once published (GitHub Pages)_
- Try the built-in **Risky sample** — a deliberately toxic diff — then the
  **Clean sample** for contrast.

## Run it

```bash
npm install
npm run dev        # dev server
npm test           # vitest suite
npm run typecheck  # strict tsc
npm run build      # production build → dist/
npm run preview    # serve the production build
```

No backend, no API keys, no env vars. Node 20+ only.

## How it works

```
diff text ──▶ parser (src/diff.ts) ──▶ rule engine (src/rules.ts)
                                              │
                                              ▼
              report (src/report.ts) ◀── scoring (src/score.ts)
```

- **Parser** — unified-diff grammar: `diff --git` headers, `/dev/null`
  add/delete, renames, hunks with real new-file line numbers, binary blobs,
  bare `---/+++` diffs without git headers.
- **Rules** — 12 focused checks, each a pure function over the parsed diff:
  secret literals (AWS/GitHub/Stripe/Slack/JWT/DB-URL formats), high-entropy
  credential assignments, conflict markers, debug output, TODO/FIXME,
  security-sensitive paths, dependency manifests, lockfile drift, irreversible
  migrations, undeclared env vars, missing tests, diff size.
- **Scoring** — severity-weighted with diminishing returns per rule, so a
  hundred TODOs can't outweigh one AWS key.
- **Report** — markdown table + reviewer checklist, clipboard-ready.

## Architecture

Vanilla TypeScript + Vite. No framework — the whole UI is ~200 lines of DOM
code. The analysis engine is dependency-free and importable on its own (CI
mode is a roadmap item).

## Testing

`npm test` — 33 vitest cases covering the parser (multi-file, /dev/null,
binary, headerless diffs), every rule's positive and negative paths, the
grading bands, and the report generator.

## How we used IBM Bob 2.0 vs. Devin — honestly

The overnight MVP was built by **Devin** (Cognition's AI agent) under an
automation, because Bob access is bound to the hackathon-provisioned IBM
account that only Sharon can sign in to. Bob's contribution lands when she
runs the tasks in [`docs/BOB_ACCESS.md`](docs/BOB_ACCESS.md) and exports the
session reports into [`bob_sessions/`](bob_sessions/). The running tally lives
in [`docs/BOB_USAGE.md`](docs/BOB_USAGE.md). Nothing here is faked — the
`bob_sessions/` exports are the source of truth for the judges.

## License

MIT — see [LICENSE](LICENSE).
