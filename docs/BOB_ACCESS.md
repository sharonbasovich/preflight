# IBM Bob 2.0 access — corrected per the official hackathon guide

**Correction (verified against the official guide,
`#the-hackathon-expectation` + `#2-bob-shell-optional`):** the event requires
**Bob IDE** — "to be eligible for judging, your solution must showcase IBM
Bob IDE as a core component." Bob Shell is explicitly *optional*; Shell
transcripts in `bob_sessions/shell-*/` are supplementary evidence only and do
not by themselves satisfy the event.

The required artifact is the **Bob IDE task session summary screenshot**:
in the IDE, open **Tasks → task header → summary** and save the PNG into
`bob_sessions/ide/` (guide section `#upload-bob-task-session-summary`).

## Current status

- **Bob IDE 2.2.0** was installed on a temporary Linux VM from the official
  `IBM-Bob-linux-amd64-1.126.0+bob2.2.0.deb` at `bob.ibm.com/download`.
  That VM has no protected OS keyring, so its unauthenticated test profile was
  discarded. Do not sign in there using weaker encryption. Use an official
  installer in an environment with a protected credential store instead.
- **Sign-in**: IDE auth is browser SSO (`bob.ibm.com/login`, IBMid or
  Google/GitHub OAuth) into the hackathon-provisioned team
  **`ibm-hackathon-lablab`** for sharon@basovich.com. API keys are documented
  for Bob Shell only — they do not sign in the IDE. IBMid/GitHub SSO and any
  required account approval are still pending; no IDE session has run.
- **Bob Shell 2.0.5** is installed and authenticated via `BOB_API_KEY`
  (scope: Inference). Three real task sessions already landed code — see
  `bob_sessions/shell-*/`.

## Bob IDE tasks (run after sign-in)

These map to real remaining work in this codebase, chosen so an IDE session
produces a genuine, reviewable diff:

1. **Document understanding / repo onboarding** — "Read AGENTS.md and
   README.md, then explain where a `github-pr-url` fetch mode would plug
   into src/cli.ts without breaking the local-first contract."
2. **Extend the engine** — "Add a rule flagging added `FIXME`/`XXX` markers
   only inside security-sensitive paths (reuse SENSITIVE_PATH), with tests."
3. **UI polish** — "Add a one-line rules legend to the UI listing the loaded
   rule names from listRules()."
4. **Docs** — "Write docs/RULES.md documenting each rule's intent and
   severity."

## Export steps (per task)

Bob IDE → **Tasks** → open the task → **task header → summary** → save the
PNG into `bob_sessions/ide/<task-slug>.png`.
**Scrub any credentials before committing — IBM deactivates accounts that
leak credentials in the repo.**

## Bob Shell (optional, already used)

```bash
curl -fsSL https://bob.ibm.com/download/bobshell.sh | bash
export BOB_API_KEY="..."   # scope: Inference
cd preflight
bob run "task prompt" --trust --accept-license --format stream-json
```

Transcripts captured with `--format stream-json` live in
`bob_sessions/shell-*/`.

## Honesty note

Do not fabricate Bob output or screenshots. A few real IDE sessions with
exported summaries beat a padded folder — judges cross-check the artifacts.
