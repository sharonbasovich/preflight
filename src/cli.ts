import { readFileSync } from "node:fs";
import { parseDiff } from "./diff";
import { runRules } from "./rules";
import { scoreFindings } from "./score";
import { buildMarkdownReport } from "./report";

function usage(): never {
  console.error("usage: npm run cli -- <diff-file>  (or pipe: git diff | npm run cli)");
  process.exit(2);
}

let input: string;
const arg = process.argv[2];
if (arg && arg !== "-") {
  try {
    input = readFileSync(arg, "utf8");
  } catch {
    console.error(`cannot read ${arg}`);
    usage();
  }
} else if (!process.stdin.isTTY) {
  input = readFileSync(0, "utf8");
} else {
  usage();
}

const diff = parseDiff(input!);
if (diff.files.length === 0) {
  console.error("no diff headers found — expected unified diff (git diff, git show, format-patch)");
  process.exit(2);
}

const findings = runRules(diff);
const grade = scoreFindings(findings);
console.log(buildMarkdownReport(diff, findings, grade));

const EXIT_BY_GRADE: Record<string, number> = { A: 0, B: 0, C: 1, D: 1, F: 1 };
process.exit(EXIT_BY_GRADE[grade.grade]);
