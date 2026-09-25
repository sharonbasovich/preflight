# Bob usage log — honest accounting

This file distinguishes work done by **IBM Bob** from work done by **Devin**
(the AI agent that executed the overnight build under automation). It exists so
the repo tells a true story about how the product was made.

## Built by Devin (this session, Fri Sep 25 → Sat Sep 26)

Everything currently in the repository:

- Full MVP: unified-diff parser, 12-rule analysis engine, A–F scoring,
  markdown report generator, single-page UI
- Vitest suite (33 tests), TypeScript strict typecheck, Vite build
- Docs: event notes, concept, this file, BOB_ACCESS
- Submission assets under `submission/`

Bob was **not** usable from Devin's environment: Bob auth requires
`bob.ibm.com/login` SSO or a `BOB_API_KEY` from the hackathon-provisioned IBM
account, both of which need Sharon's credentials. See `docs/BOB_ACCESS.md`.

## Built / verified by IBM Bob (to be completed by Sharon)

| Task | Bob session export | Notes |
| ---- | ------------------ | ----- |
| _pending_ | `bob_sessions/` | See BOB_ACCESS.md for suggested prompts |

Once Sharon runs Bob tasks and drops the exported reports into `bob_sessions/`,
add one row per session here with what Bob changed or advised. Keep this table
accurate — judges cross-check it against the exports.
