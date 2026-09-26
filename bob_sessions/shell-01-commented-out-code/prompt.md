# Prompt — Implement commented-out-code rule

Tool: IBM Bob Shell 2.0.5 (`bob run`, headless agent mode)

```
Read AGENTS.md at the repo root - it defines the rule-engine contract you must follow. Then implement a new rule in src/rules.ts named commented-out-code that flags ADDED lines which appear to be commented-out source code (for example '// const x = f(y);', '/* return foo(...) */', '# def foo():' in Python, or '<!-- <div ... -->' in HTML). Be conservative to limit false positives: only flag a file when the comment content has strong code syntax (assignments, function calls, control keywords, braces/semicolons) appearing on at least 2 added comment lines in that file, OR at least 1 line in a security-sensitive path. Do not flag ordinary prose comments, license headers, JSDoc/docstrings, or commented-out prose. Severity: medium, but high when the file path is security-sensitive (reuse the existing SENSITIVE_PATH convention). Follow AGENTS.md exactly: add the CHECKLISTS entry in src/report.ts, add positive AND negative tests in tests/rules.test.ts using the existing diffOf() helper, keep the rule a pure function, and register it like the other rules. Then run 'npm test' and 'npm run typecheck' and iterate until both pass. Do not modify unrelated files.
```
