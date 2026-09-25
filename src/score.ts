import type { Finding, GradeResult, Severity } from "./types";

const WEIGHTS: Record<Severity, number> = {
  critical: 40,
  high: 20,
  medium: 8,
  low: 3,
  info: 1,
};

/** Diminishing returns per rule: repeats of the same rule count for less. */
export function scoreFindings(findings: Finding[]): GradeResult {
  const counts: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  const perRule = new Map<string, number>();
  let score = 0;
  for (const f of findings) {
    counts[f.severity]++;
    const n = (perRule.get(f.ruleId) ?? 0) + 1;
    perRule.set(f.ruleId, n);
    score += Math.ceil(WEIGHTS[f.severity] / n);
  }
  let grade: GradeResult["grade"];
  let verdict: string;
  if (score <= 4) {
    grade = "A";
    verdict = "Clear for takeoff — no material risk detected.";
  } else if (score <= 14) {
    grade = "B";
    verdict = "Minor turbulence — quick pass over the flags should do.";
  } else if (score <= 29) {
    grade = "C";
    verdict = "Holding pattern — several issues deserve a second look.";
  } else if (score <= 49) {
    grade = "D";
    verdict = "Rough air ahead — resolve flagged items before merging.";
  } else {
    grade = "F";
    verdict = "Do not merge — serious risks need attention first.";
  }
  return { score, grade, verdict, counts };
}
