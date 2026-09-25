# Concept — PreFlight

## Problem

Every developer has merged a diff they only skimmed. The failure modes are
embarrassingly repeatable: a pasted AWS key, a `console.log` left in a payments
path, a migration with no rollback, an env var read that never got documented,
a `package.json` bump with no lockfile, conflict markers that survived a rebase.
These are cheap mistakes that escape review and get expensive downstream —
leaked credentials, undeployable builds, failed migrations — and they're exactly
the kind of thing humans are worst at noticing in a wall of diff text.

## Solution

**PreFlight** is a zero-setup, local-first risk scanner for your diff.
Drop or paste the output of `git diff` / `git show` / `format-patch` / a GitHub
`.patch` — PreFlight parses it, runs a dozen focused rules, and returns:

- an A–F risk grade with a plain-language verdict,
- per-finding annotations (file + line, offending snippet, concrete fix),
- a reviewer checklist and a copy-paste markdown report for the PR.

100% client-side: the diff never leaves the browser. That is a feature — diffs
routinely contain secrets (that's half the point of the tool), so a scanner that
uploads them anywhere would be self-defeating.

## Target user

Solo devs and small teams shipping fast without heavyweight CI gates; reviewers
who want a second pair of eyes on a risky diff; anyone about to `git push` after
a long session. Extendable to CI later (the engine is a pure function).

## Why it wins on the rubric

- **Business value**: code-review/secret-scanning is a proven market
  (GitGuardian, TruffleHog, Danger.js, SAST vendors). PreFlight occupies the
  unserved "last 30 seconds before merge" niche — no install, no auth, no CI
  config. Revenue model: free web scanner → paid CI/team features.
- **Originality**: incumbent tools are CI bots or CLIs needing repo access and
  setup. A paste-and-go, privacy-first analyzer with a shareable verdict is a
  genuinely fresh angle.
- **Application of technology**: working demo URL, real repo, full feature demo.
- **Presentation**: the hero flow demos in <60 seconds — paste a toxic diff,
  watch it get flagged.

## MVP (shipped)

- Unified-diff parser (multi-file, added/deleted/renamed, binary, `format-patch`)
- 12 rules: secret literals, high-entropy assignments, conflict markers, debug
  leftovers, TODO/FIXME, sensitive paths, dependency manifests, lockfile
  mismatch, migration without rollback, undeclared env vars, missing tests,
  large-diff
- A–F grading with diminishing-return scoring per rule
- Severity-ordered findings UI + markdown report export + reviewer checklist
- Vitest suite over parser/rules/scoring/report

## Stretch / roadmap

- GitHub Action + `gh` snippet export; PR-comment mode
- `.har`/OpenAPI diff mode (breaking-change detection)
- Custom rule packs per repo (`.preflight.yml`)
- Watch mode on a repo working tree
- Team dashboard of flagged-pr trends
