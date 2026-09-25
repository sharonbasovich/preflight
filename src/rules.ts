import type { DiffFile, Finding, ParsedDiff, Severity } from "./types";
import { addedLines, addedText, fileName } from "./diff";

interface Rule {
  id: string;
  name: string;
  severity: Severity;
  description: string;
  run(diff: ParsedDiff): Finding[];
}

const CODE_EXT = /\.(ts|tsx|js|jsx|mjs|cjs|py|go|rs|java|kt|rb|php|cs|cpp|c|h|hpp|swift|scala|sh|sql)$/i;
const TEST_PATH = /(^|\/)(tests?|__tests__|spec|e2e)(\/|$)|(_test|_spec|\.test|\.spec)\.(ts|tsx|js|jsx|py|go|rs|java|rb|php|cs)$/i;
const LOCKFILE = /(^|\/)(package-lock\.json|yarn\.lock|pnpm-lock\.yaml|poetry\.lock|Pipfile\.lock|go\.sum|Cargo\.lock|Gemfile\.lock|composer\.lock|packages\.lock\.json)$/i;
const MANIFEST = /(^|\/)(package\.json|requirements[^/]*\.txt|pyproject\.toml|setup\.py|setup\.cfg|go\.mod|Cargo\.toml|Gemfile|composer\.json|pom\.xml|build\.gradle(\.kts)?|.*\.csproj|Podfile)$/i;
const MIGRATION_PATH = /migrations?|db\/migrate|alembic|flyway|liquibase|schema\/changes/i;
const ENV_EXAMPLE = /(^|\/)\.env\.(example|sample|template|defaults)$|\.env\.example$|env\.example/i;
const SENSITIVE_PATH = /auth|login|oauth|sso|jwt|session|password|credential|payment|billing|checkout|invoice|stripe|paypal|crypto|encrypt|decrypt|secret|token|permission|rbac|acl|security|csrf|xss|cert|key/i;

interface SecretPattern {
  name: string;
  re: RegExp;
}

const SECRET_PATTERNS: SecretPattern[] = [
  { name: "AWS access key", re: /\b(AKIA|ASIA|ABIA|ACCA)[0-9A-Z]{16}\b/ },
  { name: "AWS secret key", re: /\baws_secret_access_key\s*[:=]\s*["']?[0-9a-zA-Z/+]{30,}/i },
  { name: "private key block", re: /-----BEGIN [A-Z ]*PRIVATE KEY( BLOCK)?-----/ },
  { name: "GitHub token", re: /\b(ghp_[0-9a-zA-Z]{30,}|github_pat_[0-9a-zA-Z_]{30,}|gho_[0-9a-zA-Z]{30,}|ghs_[0-9a-zA-Z]{30,})\b/ },
  { name: "OpenAI-style API key", re: /\b(sk-[a-zA-Z0-9_-]{20,}|sk-proj-[a-zA-Z0-9_-]{20,})\b/ },
  { name: "Slack token", re: /\bxox[baprs]-[0-9a-zA-Z-]{10,}\b/ },
  { name: "Stripe key", re: /\b(sk_live|pk_live|rk_live)_[0-9a-zA-Z]{16,}\b/ },
  { name: "Google API key", re: /\bAIza[0-9A-Za-z_-]{35}\b/ },
  { name: "generic secret assignment", re: /\b(api[_-]?key|api[_-]?secret|secret[_-]?key|access[_-]?token|auth[_-]?token|client[_-]?secret|private[_-]?key|passwd|password)\b\s*[:=]\s*["'][^"'\s]{8,}["']/i },
  { name: "bearer/JWT literal", re: /\beyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\b/ },
  { name: "database URL with password", re: /\b(postgres|postgresql|mysql|mongodb(\+srv)?|redis|amqp):\/\/[^:/\s]+:[^@/\s]+@/i },
];

const DEBUG_PATTERNS: SecretPattern[] = [
  { name: "console.log", re: /\bconsole\.(log|debug|dir|trace|warn|info)\s*\(/ },
  { name: "debugger statement", re: /^\s*debugger;?\s*$/ },
  { name: "Python breakpoint", re: /\b(breakpoint\(\)|pdb\.set_trace\(\)|ipdb\.set_trace\(\))/ },
  { name: "Rust dbg!", re: /\bdbg!\s*\(/ },
  { name: "print leftover", re: /^\s*print\s*\(/ },
];

const TODO_RE = /\b(TODO|FIXME|HACK|XXX|WIP|TEMP|REMOVE ?ME)\b/;
const CONFLICT_RE = /^<{7}\s|^={7}\s*$|^>{7}\s/;
const ENV_REF_RES = [
  /process\.env\.([A-Z][A-Z0-9_]+)/g,
  /os\.environ(?:\.get)?[\[(]["']([A-Z][A-Z0-9_]+)["']/g,
  /os\.getenv\(["']([A-Z][A-Z0-9_]+)["']/g,
  /ENV\.fetch\(["']([A-Z][A-Z0-9_]+)["']/g,
  /ENV\[["']([A-Z][A-Z0-9_]+)["']/g,
  /System\.getenv\(["']([A-Z][A-Z0-9_]+)["']/g,
  /getenv\(["']([A-Z][A-Z0-9_]+)["']/g,
];

function shannonEntropy(s: string): number {
  if (!s.length) return 0;
  const freq = new Map<string, number>();
  for (const ch of s) freq.set(ch, (freq.get(ch) ?? 0) + 1);
  let e = 0;
  for (const c of freq.values()) {
    const p = c / s.length;
    e -= p * Math.log2(p);
  }
  return e;
}

function makeFinding(rule: Rule, f: DiffFile, line: number | undefined, message: string, snippet?: string, suggestion?: string, severity?: Severity): Finding {
  return {
    ruleId: rule.id,
    ruleName: rule.name,
    severity: severity ?? rule.severity,
    file: fileName(f),
    line,
    message,
    snippet,
    suggestion,
  };
}

const rules: Rule[] = [
  {
    id: "secret-literal",
    name: "Hardcoded secret",
    severity: "critical",
    description: "Matches known credential formats (AWS, GitHub, Stripe, JWTs, private keys, DB URLs with passwords) and key=value secret assignments on added lines.",
    run(diff) {
      const out: Finding[] = [];
      for (const f of diff.files) {
        if (ENV_EXAMPLE.test(fileName(f))) continue;
        for (const l of addedLines(f)) {
          for (const p of SECRET_PATTERNS) {
            if (p.re.test(l.text)) {
              out.push(
                makeFinding(this, f, l.newLineNo, `Possible ${p.name} committed`, l.text.trim().slice(0, 120), "Move the value to a secret manager or environment variable, and rotate it if it was ever pushed."),
              );
              break;
            }
          }
        }
      }
      return out;
    },
  },
  {
    id: "entropy-secret",
    name: "High-entropy string",
    severity: "high",
    description: "Flags added string literals of length >= 20 with Shannon entropy above 4.3 that are assigned to key/secret/token-like identifiers.",
    run(diff) {
      const out: Finding[] = [];
      const assignRe = /(key|secret|token|signature|salt|credential|password)[A-Za-z0-9_]*\s*[:=]\s*["'`]([A-Za-z0-9+/=_-]{20,})["'`]/i;
      for (const f of diff.files) {
        if (ENV_EXAMPLE.test(fileName(f))) continue;
        for (const l of addedLines(f)) {
          const m = assignRe.exec(l.text);
          if (m && shannonEntropy(m[2]) > 4.3) {
            out.push(
              makeFinding(this, f, l.newLineNo, "High-entropy value assigned to a credential-like identifier", l.text.trim().slice(0, 120), "Verify this is not a real credential; use an env var or placeholder."),
            );
          }
        }
      }
      return out;
    },
  },
  {
    id: "conflict-marker",
    name: "Merge conflict marker",
    severity: "high",
    description: "Added lines containing <<<<<<<, =======, or >>>>>>> conflict markers.",
    run(diff) {
      const out: Finding[] = [];
      for (const f of diff.files) {
        for (const l of addedLines(f)) {
          if (CONFLICT_RE.test(l.text)) {
            out.push(makeFinding(this, f, l.newLineNo, "Unresolved merge conflict marker", l.text.trim(), "Resolve the conflict and remove the marker before merging."));
          }
        }
      }
      return out;
    },
  },
  {
    id: "debug-leftover",
    name: "Debug leftover",
    severity: "medium",
    description: "console.log/debugger, Python breakpoints, Rust dbg!, stray print() calls on added lines.",
    run(diff) {
      const out: Finding[] = [];
      for (const f of diff.files) {
        const name = fileName(f);
        if (!CODE_EXT.test(name)) continue;
        for (const l of addedLines(f)) {
          for (const p of DEBUG_PATTERNS) {
            if (p.re.test(l.text)) {
              out.push(makeFinding(this, f, l.newLineNo, `Debug output left in code (${p.name})`, l.text.trim().slice(0, 120), "Remove or replace with the project's logger."));
              break;
            }
          }
        }
      }
      return out;
    },
  },
  {
    id: "todo-marker",
    name: "TODO/FIXME added",
    severity: "low",
    description: "New TODO, FIXME, HACK, XXX, WIP markers introduced by the change.",
    run(diff) {
      const out: Finding[] = [];
      for (const f of diff.files) {
        const name = fileName(f);
        if (!CODE_EXT.test(name)) continue;
        for (const l of addedLines(f)) {
          if (TODO_RE.test(l.text)) {
            out.push(makeFinding(this, f, l.newLineNo, "New TODO/FIXME-style marker added", l.text.trim().slice(0, 120), "Convert to a tracked issue or resolve before merge."));
          }
        }
      }
      return out;
    },
  },
  {
    id: "sensitive-path",
    name: "Sensitive area touched",
    severity: "medium",
    description: "Changes to files under auth/payment/crypto/permission/session/security-like paths get extra reviewer attention.",
    run(diff) {
      const out: Finding[] = [];
      for (const f of diff.files) {
        const name = fileName(f);
        if (SENSITIVE_PATH.test(name) && CODE_EXT.test(name)) {
          out.push(
            makeFinding(this, f, undefined, "Change touches a security-sensitive area", name, "Request a review from the area's owner; double-check authz/authn and data handling."),
          );
        }
      }
      return out;
    },
  },
  {
    id: "dependency-change",
    name: "Dependency manifest changed",
    severity: "low",
    description: "package.json, requirements.txt, go.mod, Cargo.toml, pom.xml, etc. modified — review what's being pulled in.",
    run(diff) {
      const out: Finding[] = [];
      for (const f of diff.files) {
        const name = fileName(f);
        if (!MANIFEST.test(name)) continue;
        const newDeps = addedLines(f).filter((l) => /^\s*[+"']?[\w@/.-]+["']?\s*:/.test(l.text) || /^\s*[a-zA-Z0-9_.-]+[=<>~!]/.test(l.text)).length;
        out.push(
          makeFinding(this, f, undefined, `Dependency manifest changed${newDeps ? ` (~${newDeps} added line(s) that look like deps)` : ""}`, name, "Confirm each new dependency is needed, published >7 days ago, and not typosquatting."),
        );
      }
      return out;
    },
  },
  {
    id: "lockfile-mismatch",
    name: "Manifest without lockfile",
    severity: "medium",
    description: "A dependency manifest changed but its lockfile is not in the diff — installs may be out of sync.",
    run(diff) {
      const out: Finding[] = [];
      const names = diff.files.map(fileName);
      const hasLock = names.some((n) => LOCKFILE.test(n));
      if (hasLock) return out;
      for (const f of diff.files) {
        const name = fileName(f);
        if (MANIFEST.test(name)) {
          out.push(
            makeFinding(this, f, undefined, "Dependency manifest changed but no lockfile in the diff", name, "Commit the regenerated lockfile so builds stay reproducible."),
          );
        }
      }
      return out;
    },
  },
  {
    id: "migration-no-rollback",
    name: "Migration without rollback",
    severity: "high",
    description: "Migration-style files whose added content never mentions down/rollback/undo/downgrade.",
    run(diff) {
      const out: Finding[] = [];
      for (const f of diff.files) {
        const name = fileName(f);
        if (!MIGRATION_PATH.test(name)) continue;
        const text = addedText(f).toLowerCase();
        if (text.trim().length > 0 && !/(down|rollback|undo|downgrade|revert)/.test(text)) {
          out.push(
            makeFinding(this, f, undefined, "Migration appears to have no rollback path", name, "Add a down()/rollback step or document why it cannot be reversed."),
          );
        }
      }
      return out;
    },
  },
  {
    id: "env-var-undeclared",
    name: "Undeclared env var",
    severity: "medium",
    description: "New env var reads (process.env.X, os.environ, getenv) whose names are not added to any .env.example/template file in the same diff.",
    run(diff) {
      const out: Finding[] = [];
      const declared = new Set<string>();
      for (const f of diff.files) {
        if (ENV_EXAMPLE.test(fileName(f))) {
          for (const l of addedLines(f)) {
            const m = /^([A-Z][A-Z0-9_]+)\s*=/.exec(l.text.trim());
            if (m) declared.add(m[1]);
          }
        }
      }
      for (const f of diff.files) {
        const name = fileName(f);
        if (ENV_EXAMPLE.test(name) || !CODE_EXT.test(name)) continue;
        const seen = new Set<string>();
        for (const l of addedLines(f)) {
          for (const re of ENV_REF_RES) {
            re.lastIndex = 0;
            let m: RegExpExecArray | null;
            while ((m = re.exec(l.text))) {
              const varName = m[1];
              if (declared.has(varName) || seen.has(varName)) continue;
              seen.add(varName);
              out.push(
                makeFinding(this, f, l.newLineNo, `Env var ${varName} is read but not declared`, l.text.trim().slice(0, 120), `Add ${varName} to .env.example / deployment docs so environments don't silently break.`),
              );
            }
          }
        }
      }
      return out;
    },
  },
  {
    id: "missing-tests",
    name: "No test changes",
    severity: "medium",
    description: "Source files changed but no test/spec file appears in the diff.",
    run(diff) {
      const out: Finding[] = [];
      const names = diff.files.map(fileName);
      const hasTests = names.some((n) => TEST_PATH.test(n));
      if (hasTests) return out;
      const srcFiles = diff.files.filter((f) => {
        const n = fileName(f);
        return CODE_EXT.test(n) && !TEST_PATH.test(n) && f.status !== "deleted";
      });
      if (srcFiles.length >= 2) {
        out.push({
          ruleId: this.id,
          ruleName: this.name,
          severity: this.severity,
          file: "(whole diff)",
          message: `${srcFiles.length} source files changed with no test changes`,
          snippet: srcFiles.map(fileName).slice(0, 5).join(", ") + (srcFiles.length > 5 ? ", …" : ""),
          suggestion: "Add or update tests covering the changed behavior, or note why none are needed.",
        });
      }
      return out;
    },
  },
  {
    id: "large-diff",
    name: "Large change",
    severity: "info",
    description: "Diffs over ~400 changed lines are harder to review well; suggest splitting.",
    run(diff) {
      const total = diff.totalAdded + diff.totalRemoved;
      if (total <= 400) return [];
      return [
        {
          ruleId: this.id,
          ruleName: this.name,
          severity: this.severity,
          file: "(whole diff)",
          message: `${total} changed lines — large diffs get shallow reviews`,
          suggestion: "Consider splitting into stacked, independently reviewable changes.",
        },
      ];
    },
  },
];

export interface RuleInfo {
  id: string;
  name: string;
  severity: Severity;
  description: string;
}

export function listRules(): RuleInfo[] {
  return rules.map((r) => ({ id: r.id, name: r.name, severity: r.severity, description: r.description }));
}

export function runRules(diff: ParsedDiff): Finding[] {
  const out: Finding[] = [];
  for (const r of rules) out.push(...r.run.call(r, diff));
  const order: Severity[] = ["critical", "high", "medium", "low", "info"];
  out.sort((a, b) => order.indexOf(a.severity) - order.indexOf(b.severity));
  return out;
}
