# PreFlight — problem & solution

## Problem

Code review has a blind spot: the last 30 seconds before a merge. Diffs get
skimmed, and the same cheap mistakes keep shipping — a pasted AWS key or GitHub
token, a `console.log` left in a payments path, an unresolved merge-conflict
marker, a migration with no way back, an env var read that was never
documented, a `package.json` bump without its lockfile, source changes with
zero test changes. Each is trivial to catch and expensive when missed:
credential leaks, broken deploys, irreversible migrations.

The existing answers are all heavyweight: secret scanners and Danger-style
bots need CI plumbing, repo permissions, and config files. Nothing sits in the
"just about to push" moment, where a solo dev or a reviewer with a `.patch`
file wants an instant second opinion.

## Solution

**PreFlight** is a zero-setup, local-first risk scanner for diffs. Paste or
drop the output of `git diff`, `git show`, `format-patch`, or a GitHub `.patch`
file; PreFlight parses it in-browser, runs 12 focused rules, and returns:

- an **A–F risk grade** with a plain-language verdict,
- **severity-ordered findings** with file, line, the offending snippet, and a
  concrete fix,
- a **reviewer checklist** and a **markdown report** that pastes straight into
  a PR.

Everything is client-side. Diffs routinely contain secrets — catching them is
half the product — so a scanner that uploads them would be self-defeating.
Local-first is the security model, not a limitation.

## Target user

Solo developers and small teams shipping fast without enterprise CI gates;
reviewers who want an automated second pass on a risky diff; anyone about to
`git push` after a long session.

## Business value

Code-review and secret-scanning is a proven market (GitGuardian, TruffleHog,
Danger.js, SAST suites — an industry spending billions on shift-left tooling).
PreFlight claims the unserved niche *before* CI: zero install, zero auth,
paste-and-go, privacy-first. That wedge — free web scanner, paid team features
(CI mode, custom rule packs, org dashboards) — is a standard and credible
open-core motion.

## Originality

Incumbents are CI bots or CLIs that need repository access and configuration.
A paste-and-go analyzer with a shareable A–F verdict, fully local by design, is
a genuinely different angle on a familiar problem — and the hero flow demos in
under a minute.
