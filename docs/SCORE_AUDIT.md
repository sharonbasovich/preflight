# Score Calibration Audit

## Purpose

Verify that the grading bands in `src/score.ts` produce sensible grades when
run against the three reference fixtures in `fixtures/`.

Expected outcomes:
- `clean.diff` → A or B (no material risk)
- `borderline.diff` → C (middle band; noteworthy but not blocking)
- `risky.diff` → D or F (serious issues, must not merge)

---

## Fixture results (pre-adjustment)

Bands before this audit: A ≤4 · B ≤14 · C ≤29 · D ≤49 · F ≥50

| Fixture | Score | Grade | Expected | Pass? |
|---|---|---|---|---|
| `clean.diff` | 0 | A | A or B | ✅ |
| `borderline.diff` | 41 | D | C | ❌ |
| `risky.diff` | 232 | F | D or F | ✅ |

`borderline.diff` scored 41 — just above the old C ceiling of 29 — landing in D.
The diff only adds a `console.log`, a TODO, an undeclared env var, and touches two
security-sensitive areas with no accompanying tests. Grade D ("resolve before
merging") is too aggressive for this kind of diff; C ("deserves a second look")
is the right signal.

---

## Score breakdown for `borderline.diff` (score 41)

Diminishing-returns formula: `ceil(weight / nth_hit_for_rule)`

| Rule | Hits | Points | Detail |
|---|---|---|---|
| `console-log` | 1 | 8 | 1 medium × ceil(8/1) |
| `sensitive-path` | 2 | 12 | ceil(8/1) + ceil(8/2) |
| `env-var-undeclared` | 1 | 8 | 1 medium × ceil(8/1) |
| `missing-tests` | 1 | 8 | 1 medium × ceil(8/1) |
| `todo-marker` | 2 | 5 | ceil(3/1) + ceil(3/2) |
| **Total** | **7** | **41** | |

---

## Calibration decision

The C ceiling was raised from **29 → 44** and the D ceiling from **49 → 64**.
The F threshold (≥65) and the A/B boundaries (≤4, ≤14) are unchanged.

Rationale:
- `borderline.diff` score 41 needs to fit in C. The minimum change is C ceiling ≥ 41.
  Rounding to 44 gives a small buffer (3 points) so a single extra low finding does
  not immediately flip to D.
- D ceiling raised by the same delta (+15) to preserve the relative width of the bands.
- F threshold drops from 50 to 65, which keeps `risky.diff` (232) firmly at F and
  prevents any realistic D-band diff from accidentally entering F.

---

## Fixture results (post-adjustment)

Bands after this audit: A ≤4 · B ≤14 · C ≤44 · D ≤64 · F ≥65

| Fixture | Score | Grade | Expected | Pass? |
|---|---|---|---|---|
| `clean.diff` | 0 | A | A or B | ✅ |
| `borderline.diff` | 41 | C | C | ✅ |
| `risky.diff` | 232 | F | D or F | ✅ |

All three fixtures now produce the expected grade. `npm test` and
`npm run typecheck` pass with no changes to weights or test assertions required.

---

## Band reference (current)

| Grade | Score range | Verdict |
|---|---|---|
| A | 0 – 4 | Clear for takeoff — no material risk detected. |
| B | 5 – 14 | Minor turbulence — quick pass over the flags should do. |
| C | 15 – 44 | Holding pattern — several issues deserve a second look. |
| D | 45 – 64 | Rough air ahead — resolve flagged items before merging. |
| F | ≥ 65 | Do not merge — serious risks need attention first. |
