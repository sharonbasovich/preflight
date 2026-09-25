import { describe, expect, it } from "vitest";
import { parseDiff } from "../src/diff";
import { runRules, listRules } from "../src/rules";
import { scoreFindings } from "../src/score";
import { buildMarkdownReport } from "../src/report";
import { readFileSync } from "node:fs";
import { join } from "node:path";

function diffOf(path: string, addedBody: string[], removedBody: string[] = []): string {
  const adds = addedBody.map((l) => `+${l}`);
  const dels = removedBody.map((l) => `-${l}`);
  const body = [...dels, ...adds].join("\n");
  return `diff --git a/${path} b/${path}
--- a/${path}
+++ b/${path}
@@ -1,${removedBody.length} +1,${addedBody.length} @@
${body}
`;
}

const ruleIds = (d: string) => runRules(parseDiff(d)).map((f) => f.ruleId);

describe("secret-literal", () => {
  it("flags AWS keys, private keys, tokens, and passworded DB URLs", () => {
    const d = diffOf("src/config.ts", [
      `const k = "AKIAIOSFODNN7EXAMPLE";`,
      `const url = "postgres://user:p4ss@db:5432/app";`,
      `const t = "ghp_aBcDeFgHiJkLmNoPqRsTuVwXyZ012345";`,
    ]);
    const findings = runRules(parseDiff(d)).filter((f) => f.ruleId === "secret-literal");
    expect(findings.length).toBeGreaterThanOrEqual(3);
    expect(findings[0].severity).toBe("critical");
  });

  it("ignores .env.example additions", () => {
    const d = diffOf(".env.example", [`API_KEY=AKIAIOSFODNN7EXAMPLE`]);
    expect(ruleIds(d)).not.toContain("secret-literal");
  });

  it("does not flag ordinary strings", () => {
    const d = diffOf("src/a.ts", [`const greeting = "hello world";`]);
    expect(ruleIds(d)).not.toContain("secret-literal");
  });
});

describe("entropy-secret", () => {
  it("flags high-entropy credential assignments", () => {
    const d = diffOf("src/k.ts", [`const apiSecret = "x9vB2kL8mN4pQ7rS3tU6wY1zA5cE8gH";`]);
    expect(ruleIds(d)).toContain("entropy-secret");
  });
  it("ignores low-entropy values", () => {
    const d = diffOf("src/k.ts", [`const apiSecret = "aaaaaaaaaaaaaaaaaaaaaaaaaa";`]);
    expect(ruleIds(d)).not.toContain("entropy-secret");
  });
});

describe("conflict-marker", () => {
  it("flags unresolved conflict markers", () => {
    const d = diffOf("src/a.ts", ["<<<<<<< HEAD", "const x = 1;", "=======", "const x = 2;", ">>>>>>> branch"]);
    expect(ruleIds(d)).toContain("conflict-marker");
  });
});

describe("debug-leftover", () => {
  it("flags console.log and debugger", () => {
    const d = diffOf("src/a.ts", ["console.log(x);", "debugger;"]);
    const findings = runRules(parseDiff(d)).filter((f) => f.ruleId === "debug-leftover");
    expect(findings.length).toBe(2);
  });
  it("ignores comments and non-code files", () => {
    const d = diffOf("README.md", ["console.log is a debugging tool"]);
    expect(ruleIds(d)).not.toContain("debug-leftover");
  });
});

describe("todo-marker", () => {
  it("flags added TODOs in code files", () => {
    const d = diffOf("src/a.ts", ["// TODO: fix this"]);
    expect(ruleIds(d)).toContain("todo-marker");
  });
});

describe("sensitive-path", () => {
  it("flags auth/payment paths", () => {
    const d = diffOf("src/payments/charge.ts", ["const x = 1;"]);
    expect(ruleIds(d)).toContain("sensitive-path");
  });
});

describe("lockfile-mismatch", () => {
  it("flags manifest change without lockfile", () => {
    const d = diffOf("package.json", [`"express": "^4.19.2"`]);
    expect(ruleIds(d)).toContain("lockfile-mismatch");
    expect(ruleIds(d)).toContain("dependency-change");
  });
  it("is quiet when the lockfile is in the diff", () => {
    const d = diffOf("package.json", [`"express": "^4.19.2"`]) + diffOf("package-lock.json", [`"express": {"version": "4.19.2"}`]);
    expect(ruleIds(d)).not.toContain("lockfile-mismatch");
  });
});

describe("migration-no-rollback", () => {
  it("flags migrations lacking down/rollback", () => {
    const d = diffOf("migrations/001_init.sql", ["CREATE TABLE t (id INT);"]);
    expect(ruleIds(d)).toContain("migration-no-rollback");
  });
  it("passes migrations with a down step", () => {
    const d = diffOf("migrations/001_init.sql", ["-- rollback: DROP TABLE t;", "CREATE TABLE t (id INT);"]);
    expect(ruleIds(d)).not.toContain("migration-no-rollback");
  });
});

describe("env-var-undeclared", () => {
  it("flags env reads not added to .env.example", () => {
    const d = diffOf("src/a.ts", ["const u = process.env.REDIS_URL;"]);
    expect(ruleIds(d)).toContain("env-var-undeclared");
  });
  it("is quiet when .env.example adds the var", () => {
    const d = diffOf("src/a.ts", ["const u = process.env.REDIS_URL;"]) + diffOf(".env.example", ["REDIS_URL=redis://localhost"]);
    expect(ruleIds(d)).not.toContain("env-var-undeclared");
  });
});

describe("missing-tests", () => {
  it("flags multi-file source diffs with no test file", () => {
    const d = diffOf("src/a.ts", ["x()"]) + diffOf("src/b.ts", ["y()"]);
    expect(ruleIds(d)).toContain("missing-tests");
  });
  it("is quiet when a test file is included", () => {
    const d = diffOf("src/a.ts", ["x()"]) + diffOf("src/b.ts", ["y()"]) + diffOf("tests/a.test.ts", ["it('x', () => {})"]);
    expect(ruleIds(d)).not.toContain("missing-tests");
  });
  it("ignores single-file changes", () => {
    const d = diffOf("src/a.ts", ["x()"]);
    expect(ruleIds(d)).not.toContain("missing-tests");
  });
});

describe("commented-out-code", () => {
  it("flags 2+ commented-out code lines in a regular file (JS-style)", () => {
    const d = diffOf("src/utils.ts", [
      "// const x = getValue();",
      "// if (x > 0) { return x; }",
      "export function foo() {}",
    ]);
    expect(ruleIds(d)).toContain("commented-out-code");
  });

  it("flags commented-out code in Python-style comments", () => {
    const d = diffOf("src/utils.py", [
      "# def process(items):",
      "# for item in items:",
      "def run(): pass",
    ]);
    expect(ruleIds(d)).toContain("commented-out-code");
  });

  it("flags commented-out HTML", () => {
    const d = diffOf("src/index.html", [
      "<!-- <div class=\"foo\">bar</div> -->",
      "<!-- return foo(x); -->",
    ]);
    expect(ruleIds(d)).toContain("commented-out-code");
  });

  it("flags a single commented-out code line in a security-sensitive path", () => {
    const d = diffOf("src/auth/login.ts", [
      "// const token = getToken();",
      "export function check() {}",
    ]);
    const findings = runRules(parseDiff(d)).filter((f) => f.ruleId === "commented-out-code");
    expect(findings.length).toBeGreaterThanOrEqual(1);
    expect(findings[0].severity).toBe("high");
  });

  it("does not flag ordinary prose comments", () => {
    const d = diffOf("src/utils.ts", [
      "// This function handles user input",
      "// See the documentation for details",
      "export function foo() {}",
    ]);
    expect(ruleIds(d)).not.toContain("commented-out-code");
  });

  it("does not flag JSDoc comments", () => {
    const d = diffOf("src/utils.ts", [
      "/**",
      " * @param x - the input value",
      " * @returns the result",
      " */",
      "export function foo(x: number) { return x; }",
    ]);
    expect(ruleIds(d)).not.toContain("commented-out-code");
  });

  it("does not flag a single commented-out code line in a non-sensitive file", () => {
    const d = diffOf("src/utils.ts", [
      "// const x = getValue();",
      "export function foo() {}",
    ]);
    expect(ruleIds(d)).not.toContain("commented-out-code");
  });

  it("does not flag license headers", () => {
    const d = diffOf("src/utils.ts", [
      "// Copyright (c) 2024 Acme Corp. MIT License.",
      "// Licensed under the Apache License, Version 2.0",
      "export function foo() {}",
    ]);
    expect(ruleIds(d)).not.toContain("commented-out-code");
  });
});

describe("large-diff", () => {
  it("flags diffs over 400 changed lines", () => {
    const lines = Array.from({ length: 401 }, (_, i) => `line ${i}`);
    const d = diffOf("src/big.ts", lines);
    expect(ruleIds(d)).toContain("large-diff");
  });
});

describe("scoring + report", () => {
  it("grades an empty diff A", () => {
    const g = scoreFindings([]);
    expect(g.grade).toBe("A");
  });
  it("critical findings push the grade down", () => {
    const d = parseDiff(diffOf("src/auth/x.ts", [`const k = "AKIAIOSFODNN7EXAMPLE";`]));
    const g = scoreFindings(runRules(d));
    expect(["D", "F"]).toContain(g.grade);
  });
  it("markdown report includes verdict, table and checklist", () => {
    const d = parseDiff(diffOf("src/a.ts", ["// TODO: fix"]));
    const findings = runRules(d);
    const md = buildMarkdownReport(d, findings, scoreFindings(findings));
    expect(md).toContain("PreFlight risk report");
    expect(md).toContain("Reviewer checklist");
    expect(md).toContain("src/a.ts");
  });
});

describe("fixtures", () => {
  const risky = readFileSync(join(__dirname, "../fixtures/risky.diff"), "utf8");
  const clean = readFileSync(join(__dirname, "../fixtures/clean.diff"), "utf8");

  it("risky fixture triggers many rules and a bad grade", () => {
    const d = parseDiff(risky);
    const findings = runRules(d);
    const ids = new Set(findings.map((f) => f.ruleId));
    for (const expected of ["secret-literal", "debug-leftover", "todo-marker", "lockfile-mismatch", "migration-no-rollback", "env-var-undeclared", "sensitive-path", "missing-tests", "conflict-marker"]) {
      expect(ids, expected).toContain(expected);
    }
    const g = scoreFindings(findings);
    expect(["D", "F"]).toContain(g.grade);
  });

  it("clean fixture gets a good grade", () => {
    const d = parseDiff(clean);
    const findings = runRules(d);
    const g = scoreFindings(findings);
    expect(["A", "B"]).toContain(g.grade);
  });
});

it("exposes rule metadata for the UI", () => {
  const rules = listRules();
  expect(rules.length).toBeGreaterThanOrEqual(10);
  for (const r of rules) {
    expect(r.id).toBeTruthy();
    expect(r.description).toBeTruthy();
  }
});
