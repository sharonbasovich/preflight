# How we used IBM Bob 2.0

Honest accounting — who built what, and where the evidence lives.

## The setup

PreFlight was built across two AI development partners:

- **Devin** (Cognition) executed the overnight MVP build under an automation:
  the diff parser, the 12-rule engine, the A–F scoring, the report generator,
  the UI, and the test suite. Devin's session logs are available on request;
  its commits are the early history of this repository.
- **IBM Bob 2.0** was used for [ Sharon: describe here what Bob actually did —
  e.g., repository onboarding via `/init`, the rules it reviewed or extended,
  refactors it performed, docs it wrote ]. The exported task-session reports
  are in [`bob_sessions/`](../bob_sessions/) — that folder, not this file, is
  the primary evidence for the judges.

## Why Bob could not run unattended

Bob's auth is bound to the hackathon-provisioned IBM account — SSO at
`bob.ibm.com/login` or a `BOB_API_KEY` minted in the portal (scope:
Inference). Both require Sharon's credentials, so the automated overnight
session could not run Bob itself. Rather than fabricate session reports — IBM
explicitly disqualifies repos containing fake or credential-leaking exports —
we left a ready-to-run Bob playbook in `docs/BOB_ACCESS.md`: install
instructions, exact prompts mapped to real stretch work in this codebase, and
the export steps (`Views and More Actions → History → export → bob_sessions/`).

## What Bob was pointed at

The suggested tasks are real gaps in this codebase, chosen so Bob sessions
produce genuine, verifiable diffs rather than screenshots for the folder:

1. Review `src/diff.ts` and identify where a "fetch diff from a GitHub PR URL"
   mode would integrate — then implement it behind a feature flag.
2. Extend `src/rules.ts` with a commented-out-code detector (a real gap —
   the rule set deliberately avoids it today because it is noisy).
3. Audit `src/score.ts` grading bands against a corpus of benign and hostile
   diffs and tune the boundaries.
4. Generate `CONTRIBUTING.md` documenting the rule-engine contract
   (id, name, severity, `run(diff) → Finding[]`).

## What we would tell the judges

The interesting story here is *comparative*: one codebase, two AI dev
partners, an honest ledger (`docs/BOB_USAGE.md`) of which did what. Bob's
strength — deep repository context — is exactly what the stretch tasks
exercise: every prompt above requires understanding how the parser, rules,
and scorer fit together, not snippet-level completion.
