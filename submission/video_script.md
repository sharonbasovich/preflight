# PreFlight demo video — narration script

Target length: ~2 minutes (lablab allows up to 5; keep it tight).
Produced asset: `submission/demo.mp4` — screen recording of the live app plus
title cards, with narration generated via edge-tts (en-US-AndrewNeural) from
the script below and mixed onto the audio track. To re-record with a human
voice instead:

```bash
edge-tts --voice en-US-AndrewNeural --file narration.txt --write-media narration.mp3
ffmpeg -i demo.mp4 -i narration.mp3 -c:v copy -shortest demo_narrated.mp4
```

## Narration (with timing)

**0:00–0:10 — Hook**
"Every developer has merged a diff they only skimmed. A pasted AWS key.
A migration with no way back. PreFlight catches it — before it ships."

**0:10–0:25 — Problem**
"Reviewers skim. The same cheap mistakes keep shipping: leaked secrets,
debug leftovers, undeclared env vars, lockfile drift. The tools that catch
these need CI setup and repo permissions. Nothing lives in the last thirty
seconds before you push."

**0:25–1:10 — Demo**
"Here's PreFlight. I paste — or drop — a git diff. This one's our
deliberately toxic sample: an auth file with three real-looking credentials,
a payments file with debug output, a migration that only goes one way.
One click — grade F. Twenty-six findings, severity-ordered. Critical first:
AWS key, Stripe key, GitHub token. Each finding has the file, the line, the
snippet, and the fix. The same engine also runs in CI as a PR-comment
action — but right now it runs entirely in my browser. The diff never leaves the page — which matters,
because diffs are exactly where secrets hide. One more click copies a
markdown report straight into the PR — verdict, findings table, reviewer
checklist."

**1:10–1:30 — Business**
"Shift-left review and secret scanning is a proven market — GitGuardian,
TruffleHog, Danger. PreFlight claims the unserved wedge before CI: zero
install, zero auth, paste-and-go. Free web scanner; paid team tier for CI
gates, custom rule packs, org dashboards. Classic open-core."

**1:30–1:45 — Tech + Bob**
"Vanilla TypeScript, no framework, a pure-function rule engine with
forty-four passing tests. The MVP was built overnight by Devin; IBM Bob
Shell picked it up to add a new commented-out-code rule, a self-dogfooding
PR-comment action, and docs — every transcript is in the repo under
bob_sessions."

**1:45–2:00 — Close**
"PreFlight: the last check before takeoff. MIT licensed, live demo in the
readme. Thanks."

## Shot list

1. Title card (5 s): name, tagline, hackathon.
2. Problem card (10 s): the recurring-mistakes list.
3. Live app (≈55 s): risky sample → F grade → scroll findings → copy report →
   clean sample → A grade. *(existing recorded run)*
4. "13 checks" card (8 s).
5. "Local-first" card (8 s).
6. Closing card (8 s): repo URL, MIT, team.
