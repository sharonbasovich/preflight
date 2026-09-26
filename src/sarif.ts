import type { Finding, Severity } from "./types";

type SarifLevel = "error" | "warning" | "note";

function sarifLevel(severity: Severity): SarifLevel {
  if (severity === "critical" || severity === "high") return "error";
  if (severity === "medium") return "warning";
  return "note";
}

export function toSarif(findings: Finding[]): object {
  const ruleMap = new Map<string, { id: string; name: string; helpText: string }>();
  for (const f of findings) {
    if (!ruleMap.has(f.ruleId)) {
      ruleMap.set(f.ruleId, {
        id: f.ruleId,
        name: f.ruleName,
        helpText: f.suggestion ?? "",
      });
    }
  }

  const rules = Array.from(ruleMap.values()).map((r) => ({
    id: r.id,
    name: { text: r.name },
    ...(r.helpText ? { help: { text: r.helpText } } : {}),
  }));

  const results = findings.map((f) => {
    const result: Record<string, unknown> = {
      ruleId: f.ruleId,
      level: sarifLevel(f.severity),
      message: { text: f.message },
    };

    if (f.file && f.file !== "(whole diff)") {
      const loc: Record<string, unknown> = {
        physicalLocation: {
          artifactLocation: { uri: f.file, uriBaseId: "%SRCROOT%" },
          ...(f.line !== undefined
            ? { region: { startLine: f.line } }
            : {}),
        },
      };
      result.locations = [loc];
    }

    if (f.suggestion) {
      result.fixes = [{ description: { text: f.suggestion } }];
    }

    return result;
  });

  return {
    $schema: "https://schemastore.azurewebsites.net/schemas/json/sarif-2.1.0.json",
    version: "2.1.0",
    runs: [
      {
        tool: {
          driver: {
            name: "preflight",
            rules,
          },
        },
        results,
      },
    ],
  };
}
