import { describe, expect, it } from "vitest";
import { toSarif } from "../src/sarif";
import type { Finding } from "../src/types";

function makeFinding(overrides: Partial<Finding> = {}): Finding {
  return {
    ruleId: "test-rule",
    ruleName: "Test Rule",
    severity: "medium",
    file: "src/foo.ts",
    line: 10,
    message: "Something found",
    suggestion: "Fix it",
    ...overrides,
  };
}

describe("toSarif", () => {
  it("produces a SARIF 2.1.0 envelope", () => {
    const result = toSarif([]) as Record<string, unknown>;
    expect(result.version).toBe("2.1.0");
    expect(result.$schema).toContain("sarif-2.1.0");
    const runs = result.runs as Array<Record<string, unknown>>;
    expect(runs).toHaveLength(1);
    expect((runs[0].tool as Record<string, unknown>).driver).toBeDefined();
  });

  it("empty findings yields zero results and zero rules", () => {
    const out = toSarif([]) as {
      runs: Array<{ results: unknown[]; tool: { driver: { rules: unknown[] } } }>;
    };
    expect(out.runs[0].results).toHaveLength(0);
    expect(out.runs[0].tool.driver.rules).toHaveLength(0);
  });

  it("maps critical/high severity to error level", () => {
    for (const severity of ["critical", "high"] as const) {
      const out = toSarif([makeFinding({ severity })]) as {
        runs: Array<{ results: Array<{ level: string }> }>;
      };
      expect(out.runs[0].results[0].level).toBe("error");
    }
  });

  it("maps medium severity to warning level", () => {
    const out = toSarif([makeFinding({ severity: "medium" })]) as {
      runs: Array<{ results: Array<{ level: string }> }>;
    };
    expect(out.runs[0].results[0].level).toBe("warning");
  });

  it("maps low/info severity to note level", () => {
    for (const severity of ["low", "info"] as const) {
      const out = toSarif([makeFinding({ severity })]) as {
        runs: Array<{ results: Array<{ level: string }> }>;
      };
      expect(out.runs[0].results[0].level).toBe("note");
    }
  });

  it("sets ruleId and message on each result", () => {
    const out = toSarif([makeFinding({ ruleId: "my-rule", message: "hello" })]) as {
      runs: Array<{ results: Array<{ ruleId: string; message: { text: string } }> }>;
    };
    const r = out.runs[0].results[0];
    expect(r.ruleId).toBe("my-rule");
    expect(r.message.text).toBe("hello");
  });

  it("includes physicalLocation with uri and startLine when file and line are set", () => {
    const out = toSarif([makeFinding({ file: "src/foo.ts", line: 42 })]) as {
      runs: Array<{
        results: Array<{
          locations: Array<{
            physicalLocation: {
              artifactLocation: { uri: string };
              region: { startLine: number };
            };
          }>;
        }>;
      }>;
    };
    const loc = out.runs[0].results[0].locations[0].physicalLocation;
    expect(loc.artifactLocation.uri).toBe("src/foo.ts");
    expect(loc.region.startLine).toBe(42);
  });

  it("omits region when line is absent", () => {
    const out = toSarif([makeFinding({ line: undefined })]) as {
      runs: Array<{
        results: Array<{
          locations: Array<{ physicalLocation: { region?: unknown } }>;
        }>;
      }>;
    };
    expect(out.runs[0].results[0].locations[0].physicalLocation.region).toBeUndefined();
  });

  it("omits locations for whole-diff findings", () => {
    const out = toSarif([makeFinding({ file: "(whole diff)", line: undefined })]) as {
      runs: Array<{ results: Array<{ locations?: unknown[] }> }>;
    };
    expect(out.runs[0].results[0].locations).toBeUndefined();
  });

  it("includes suggestion as fixes description", () => {
    const out = toSarif([makeFinding({ suggestion: "Do something" })]) as {
      runs: Array<{
        results: Array<{ fixes: Array<{ description: { text: string } }> }>;
      }>;
    };
    expect(out.runs[0].results[0].fixes[0].description.text).toBe("Do something");
  });

  it("deduplicates rules — one entry per ruleId", () => {
    const findings = [
      makeFinding({ ruleId: "a", ruleName: "Rule A" }),
      makeFinding({ ruleId: "a", ruleName: "Rule A" }),
      makeFinding({ ruleId: "b", ruleName: "Rule B" }),
    ];
    const out = toSarif(findings) as {
      runs: Array<{ tool: { driver: { rules: Array<{ id: string }> } } }>;
    };
    const ids = out.runs[0].tool.driver.rules.map((r) => r.id);
    expect(ids).toEqual(["a", "b"]);
  });

  it("rule entries carry name and help text from suggestion", () => {
    const out = toSarif([makeFinding({ ruleId: "r1", ruleName: "Rule One", suggestion: "Fix now" })]) as {
      runs: Array<{ tool: { driver: { rules: Array<{ id: string; name: { text: string }; help: { text: string } }> } } }>;
    };
    const rule = out.runs[0].tool.driver.rules[0];
    expect(rule.name.text).toBe("Rule One");
    expect(rule.help.text).toBe("Fix now");
  });
});
