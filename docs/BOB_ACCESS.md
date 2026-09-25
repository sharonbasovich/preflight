# IBM Bob 2.0 access — what Sharon needs to do

PreFlight was built during the IBM Bob 2.0 hackathon. Devin (the automation
agent doing the overnight build) cannot log in to Bob — the hackathon Bob
account is provisioned against Sharon's registration and requires her SSO
login / API key. This file is the exact checklist for her to complete Bob's
part of the submission.

## Option A — Bob IDE (required by the hackathon guide)

1. Download Bob IDE: https://bob.ibm.com/download (Mac/Windows/Linux builds).
2. Sign in at `bob.ibm.com/login` with the IBMid / hackathon-provisioned
   account (registration at lablab.ai gates this).
3. Open this repository in Bob IDE, open the Bob chat, run `/init` so Bob
   writes AGENTS.md context, then work a few genuine tasks. Suggested prompts
   (they map to real stretch work):
   - "Explain the diff parser in src/diff.ts and where a GitHub-PR fetch mode
     could plug in."
   - "Add a rule that flags added `FIXME`/`XXX` only on lines inside
     security-sensitive paths." (compare with the existing rule set)
   - "Write a CONTRIBUTING.md section describing the rule engine contract."
   - "Suggest three improvements to src/score.ts grading bands and implement
     the best one."
4. Export every relevant task session for judging:
   Bob chat → **Views and More Actions → History** → open the task → export →
   save the report into `bob_sessions/` in this repo (one file per task).
   **Scrub any credentials before committing — IBM deactivates accounts that
   leak credentials in the repo.**

## Option B — Bob Shell (CLI alternative, scriptable)

```bash
curl -fsSL https://bob.ibm.com/download/bobshell.sh | bash
# create an API key (scope: Inference) in the Bob portal, then:
export BOB_API_KEY="..."
cd preflight
bob run "Review src/rules.ts and propose a rule for detection of commented-out code blocks" --accept-license
```

Session output can be captured with `bob run ... --format json` and the
transcript dropped into `bob_sessions/`.

## What is already prepared for Bob

- `bob_sessions/README.md` — where to put the exports.
- `docs/BOB_USAGE.md` — honest log of which parts were built by Bob vs Devin;
  update it as Bob sessions land.

## Honesty note

Do not fabricate Bob output. The judges score "application of technology" on
the exported reports; a handful of real sessions beats a padded folder.
