---
marp: true
theme: default
paginate: true
---

# PreFlight ✈

**Pre-merge diff risk scanner.**
Drop a `git diff` in, get an A–F risk report out — 100% in your browser.

IBM Bob 2.0 Hackathon · Waterloo Workflow Lab · Sharon Basovich

---

# The problem: diffs get skimmed

- The same cheap mistakes keep shipping: pasted keys, debug leftovers,
  unresolved conflict markers, migrations with no rollback, undeclared env
  vars, lockfile drift, missing tests.
- Trivial to catch. **Expensive when missed** — credential leaks, broken
  deploys, irreversible migrations.
- Incumbent scanners need CI plumbing, repo permissions, config files.
  **Nothing lives in the last 30 seconds before push.**

---

# The hero flow

- Paste or drop `git diff`, `git show`, `format-patch`, GitHub `.patch`.
- 12 focused rules run locally in <10 ms.
- Grade, file:line findings with fixes, reviewer checklist, markdown report
  for the PR.
- The built-in toxic sample scores **F — 26 findings, 3 critical — in one click.**

---

# How it works

```
git diff ─▶ parser ─▶ 12 rules ─▶ A–F score ─▶ markdown report
           (multi-file, /dev/null, renames, hunks, binary)
```

- Secrets (AWS, GitHub, Stripe, Slack, JWT, DB URLs) + high-entropy assignments
- Conflict markers · debug leftovers · TODO/FIXME · sensitive paths
- Manifest↔lockfile drift · irreversible migrations · undeclared env vars ·
  missing tests · diff size
- **Local-first is the security model** — diffs contain secrets; they never
  leave the browser.

---

# Business value

- **Proven market:** GitGuardian, TruffleHog, Danger.js, SAST vendors —
  billions spent on shift-left security and review tooling.
- **Unserved wedge:** the pre-CI moment — solo devs and small teams, zero
  install, zero auth, paste-and-go.
- **Revenue model:** free web scanner → paid team tier (CI gate, custom rule
  packs, org dashboards). Classic open-core.
- **Originality:** a shareable A–F verdict on a pasted diff — not another
  CI bot.

---

# Built with AI dev partners

- **Devin** built the overnight MVP under automation: parser, rule engine,
  scoring, UI, 33-test suite — real commits, real history.
- **IBM Bob 2.0** picked up the repo from there: `/init` onboarding, rule
  review and extension, doc generation. Exported task-session reports live in
  `bob_sessions/`.
- One codebase, two AI partners, an honest ledger: `docs/BOB_USAGE.md`.

---

# Where it goes next

- CI mode — the engine is a pure function; wrap it in a GitHub Action.
- Custom rule packs (`.preflight.yml`), OpenAPI breaking-change mode.
- PR-comment integration and team dashboards.

`github.com/sharonbasovich/preflight` · MIT · `npm run dev`
