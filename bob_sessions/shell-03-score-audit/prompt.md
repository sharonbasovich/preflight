# Prompt — Score-band calibration audit

Tool: IBM Bob Shell 2.0.5 (`bob run`, headless agent mode)

```
Audit the grading bands in src/score.ts against the real fixture corpus in fixtures/ (risky.diff, clean.diff, borderline.diff). First run the CLI on each fixture (npm run cli -- fixtures/risky.diff etc.) and record the grade each produces. Then evaluate whether the band boundaries in src/score.ts are sensible: a clean diff should grade A or B, the deliberately toxic risky.diff must grade D or F, borderline should land in the middle band (C). If the bands are already well-calibrated, document the evidence and do NOT change the thresholds - stability beats churn. If they are miscalibrated, make the minimal adjustment to the weights/bands that fixes it and update any affected tests. Write your audit findings into docs/SCORE_AUDIT.md including a small table of fixture vs score vs grade, and make sure npm test and npm run typecheck pass at the end.
```
