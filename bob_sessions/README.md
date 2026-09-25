# bob_sessions/

Evidence of genuine IBM Bob usage for the IBM Bob 2.0 hackathon.

## Required evidence — Bob IDE (the qualifying artifact)

Per the official hackathon guide, **Bob IDE is required** and the qualifying
artifact is the **task session summary screenshot** captured in the IDE via
**Tasks → task header → summary (PNG export)**.

- `ide/` — Bob IDE task session summary PNGs, one folder or file per task.
  Scrub credentials before committing — the hackathon guide warns that
  detected IBM Bob/Cloud credentials in the repo trigger account
  deactivation.

## Supplementary evidence — Bob Shell (optional client)

`shell-*/` folders contain transcripts from **Bob Shell** (`bob run`,
headless CLI), which the guide marks *optional*. Each folder holds:

- `prompt.md` — the exact prompt sent to Bob
- `transcript.stream.jsonl` — the raw `--format stream-json` session
- `summary.md` — task ID, duration, tool calls, Bobcoins consumed
- `changes.patch` — the exact diff Bob produced

| Session | Task | Task ID | Bobcoins |
| ------- | ---- | ------- | -------- |
| shell-01 | `commented-out-code` rule + tests | `6533984d4305f18196998b416bd27abc` | 1.13 |
| shell-02 | PR-comment CI integration | `1be6a4c7c2a4f6006adcafeb627fd613` | 0.33 |
| shell-03 | Score-band calibration audit | `9ff9d28398cd366438fa4d31cd352725` | 0.62 |

Nothing here is fabricated — every session corresponds to a real `bob run`
whose diff is in the git history. See `docs/BOB_USAGE.md` for the honest
Devin-vs-Bob ledger and `docs/BOB_ACCESS.md` for the access notes.
