# IBM Bob 2.0 Hackathon — event notes

Sources: lablab.ai event page, lablab.ai hackathon rule book, lablab.ai submission guidelines,
official hackathon guide (IBM Cloud Object Storage, May 2026 edition — the current-edition
guide is only published to registered participants), bob.ibm.com docs.

## Logistics

- Event: "IBM Bob 2.0 Hackathon", hosted by IBM + lablab.ai, 100% online.
- Build window: Fri Sep 25 → Sun Sep 27, 2026. Kickoff Fri 15:00 UTC; submissions close **Sun Sep 27 15:00 UTC** (11:00 a.m. Toronto).
- Team: "Waterloo Workflow Lab" — solo (Sharon Basovich only).
- Prize pool: $10,000.
- Theme: **"Turn idea into impact faster"** — use IBM Bob as the intelligent development
  partner (full-repo context, intent understanding, multi-step work). Any framework/stack
  is allowed within product usage policies.

## Hard requirements (submission)

- **Bob IDE is mandatory** — "to be eligible for judging, your solution must showcase IBM
  Bob IDE as a core component." `bob run`/`bob chat` sessions count; the required artifact
  is the **exported Bob task-session report** placed in a `bob_sessions/` folder in the
  public repo (Bob IDE chat → "Views and More Actions" → History → export). See
  `docs/BOB_ACCESS.md` for what only Sharon can do.
- **Public GitHub repository** — judges lower the score for private repos. No credentials
  in the repo (IBM explicitly warns: detected IBM Bob/Cloud credentials → account
  deactivation). Remove keys before exporting session reports.
- **Demo Application URL** — lablab suggests Streamlit (Python), Replit, or Vercel.
  A working interactive URL is required for a high "Application of Technology" score.
- **Video**: MP4, max 5 min — intro, then the PDF deck, then the working app.
  (Lablab rubric docks presentations whose video is under ~3 min of substance.)
- **Slide deck**: PDF.
- Cover image PNG/JPG 16:9; project title; short description ≤255 chars;
  long description ≥100 words; technology/category tags.

## Judging criteria (lablab rule book, 1–5 scale each)

1. **Presentation** (PDF + video): communicate problem, solution, value prop in <5 min;
   top scores need market analysis, revenue model, competitive differentiation, roadmap.
2. **Business value**: real market need, TAM, revenue model, scalability. 5 = "could
   disrupt the industry / create a new market."
3. **Application of technology**: working demo link, real GitHub repo, all features
   actually shown in the video. For this event that means real Bob usage evidenced by
   the exported session reports.
4. **Originality**: fresh angle, not a clone.

## Rules that constrain us

- Everything built inside the 48h window; solo team of one.
- No secrets/credentials in the repo; scrub exported Bob reports.
- Participants bring their own datasets — synthetic fixtures are fine.
- Bob usage consumes "Bobcoins" — 40 are auto-provisioned to the hackathon Bob account.

## IBM Bob 2.0 access facts

- Bob = standalone IDE app + **Bob Shell** CLI (`bob`), same assistant for terminal/ACP.
- Install Bob Shell: `curl -fsSL https://bob.ibm.com/download/bobshell.sh | bash`
  (Linux/macOS; npm/pnpm/yarn package managers or tarball from bob-shell S3 bucket).
- Non-interactive: `bob run "prompt" --format json --max-turns N --accept-license`.
- Auth: browser SSO at `bob.ibm.com/login` (IBMid) **or** `BOB_API_KEY` env var
  (portal: bob.ibm.com → API keys, scope "Inference"). General-scope keys also need
  `--team-id`. Trial and paid plans can create keys; the hackathon provisions a Bob
  account for registered participants — this needs Sharon's login. See
  `docs/BOB_ACCESS.md`.
