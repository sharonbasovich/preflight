# Prompt — PR-comment CI integration

Tool: IBM Bob Shell 2.0.5 (`bob run`, headless agent mode)

```
Read .github/workflows/dogfood.yml and AGENTS.md. The workflow currently scans each PR diff with the PreFlight CLI and uploads the markdown report as a build artifact only. Upgrade it so the report is also posted as a comment on the pull request itself. Requirements: use actions/github-script@v7 (already a standard action; no new npm deps) to create-or-update a single PR comment containing the markdown report, tagged with a hidden HTML marker like <!-- preflight-report --> so reruns update the same comment instead of spamming new ones; add the minimum required permissions block for commenting (pull-requests: write and issues: write as needed, keep contents: read); handle forked pull requests gracefully - when the token is read-only the comment step must not fail the job (use continue-on-error or a conditional on github.event.pull_request.head.repo.fork as appropriate, and explain your choice in the workflow comments); keep the existing artifact upload working. Also add a note in README.md under the 'CLI mode' or a new 'CI integration' section documenting that PreFlight comments its risk report on PRs via dogfood.yml. Do not touch src/ or tests/. Validate the workflow YAML by parsing it.
```
