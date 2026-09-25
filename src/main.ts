import "./style.css";
import { parseDiff } from "./diff";
import { listRules, runRules } from "./rules";
import { scoreFindings } from "./score";
import { buildMarkdownReport } from "./report";
import type { Finding, ParsedDiff, Severity } from "./types";
import riskySample from "../fixtures/risky.diff?raw";
import cleanSample from "../fixtures/clean.diff?raw";

const input = document.getElementById("diff-input") as HTMLTextAreaElement;
const inputStats = document.getElementById("input-stats") as HTMLSpanElement;
const runBtn = document.getElementById("btn-run") as HTMLButtonElement;
const copyBtn = document.getElementById("btn-copy") as HTMLButtonElement;
const downloadBtn = document.getElementById("btn-download") as HTMLButtonElement;
const fileInput = document.getElementById("file-input") as HTMLInputElement;
const emptyState = document.getElementById("empty-state") as HTMLDivElement;
const results = document.getElementById("results") as HTMLDivElement;
const verdictEl = document.getElementById("verdict") as HTMLDivElement;
const summaryEl = document.getElementById("summary") as HTMLDivElement;
const findingsEl = document.getElementById("findings") as HTMLDivElement;
const rulesList = document.getElementById("rules-list") as HTMLUListElement;

let lastReport = "";
let lastDiff: ParsedDiff | null = null;
let lastFindings: Finding[] = [];
let parseErrorEl: HTMLParagraphElement | null = null;
const hiddenSeverities = new Set<Severity>();

const savedInput = localStorage.getItem("preflight:last-input");
if (savedInput) input.value = savedInput;
updateInputStats();

for (const r of listRules()) {
  const li = document.createElement("li");
  li.textContent = r.name;
  li.title = `${r.severity} — ${r.description}`;
  rulesList.appendChild(li);
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function updateInputStats() {
  const text = input.value;
  if (!text.trim()) {
    inputStats.textContent = "";
    return;
  }
  const files = (text.match(/^diff --git /gm) ?? []).length;
  inputStats.textContent = `${text.length.toLocaleString()} chars · ~${files || "?"} file(s)`;
}

function render(diff: ParsedDiff, findings: Finding[]) {
  const grade = scoreFindings(findings);
  verdictEl.className = `verdict grade-${grade.grade}`;
  verdictEl.innerHTML = `<span class="grade">${grade.grade}</span><span>${escapeHtml(grade.verdict)}</span><div class="muted" style="margin-top:6px">risk score ${grade.score}</div>`;

  const sevChips = (Object.keys(grade.counts) as Severity[])
    .filter((s) => grade.counts[s] > 0)
    .map((s) => {
      const hidden = hiddenSeverities.has(s);
      return `<button class="chip sev-chip${hidden ? " chip-off" : ""}" data-sev="${s}" title="click to ${hidden ? "show" : "hide"} ${s} findings">${grade.counts[s]} ${s}</button>`;
    })
    .join("");
  summaryEl.innerHTML =
    `<span class="chip">${diff.files.length} file(s)</span>` +
    `<span class="chip">+${diff.totalAdded} / −${diff.totalRemoved}</span>` +
    sevChips;
  for (const chip of summaryEl.querySelectorAll<HTMLButtonElement>(".sev-chip")) {
    chip.addEventListener("click", () => {
      const sev = chip.dataset.sev as Severity;
      if (hiddenSeverities.has(sev)) hiddenSeverities.delete(sev);
      else hiddenSeverities.add(sev);
      render(diff, findings);
    });
  }

  const visible = findings.filter((f) => !hiddenSeverities.has(f.severity));
  findingsEl.innerHTML = "";
  if (visible.length === 0) {
    findingsEl.innerHTML = `<div class="empty"><p>${findings.length === 0 ? "No findings — nothing risky detected in this diff." : "All findings are hidden by the severity filter."}</p></div>`;
  }
  for (const f of visible) {
    const div = document.createElement("div");
    div.className = `finding sev-${f.severity}`;
    const loc = f.line ? `${f.file}:${f.line}` : f.file;
    div.innerHTML =
      `<div class="head"><span class="sev-tag sev-${f.severity}">${f.severity}</span>` +
      `<span class="msg">${escapeHtml(f.message)}</span>` +
      `<span class="loc">${escapeHtml(loc)}</span></div>` +
      (f.snippet ? `<div class="snippet">${escapeHtml(f.snippet)}</div>` : "") +
      (f.suggestion ? `<div class="suggestion">→ ${escapeHtml(f.suggestion)}</div>` : "");
    findingsEl.appendChild(div);
  }

  lastReport = buildMarkdownReport(diff, findings, grade);
  copyBtn.disabled = false;
  downloadBtn.disabled = false;
  emptyState.classList.add("hidden");
  results.classList.remove("hidden");
}

function runAnalysis() {
  const text = input.value;
  if (!text.trim()) {
    input.focus();
    return;
  }
  const diff = parseDiff(text);
  if (diff.files.length === 0) {
    emptyState.classList.remove("hidden");
    results.classList.add("hidden");
    copyBtn.disabled = true;
    downloadBtn.disabled = true;
    lastReport = "";
    if (!parseErrorEl) {
      parseErrorEl = document.createElement("p");
      parseErrorEl.id = "parse-error";
      emptyState.prepend(parseErrorEl);
    }
    parseErrorEl.innerHTML = `Couldn't find any diff headers. Paste unified-diff output (<code>git diff</code>, <code>git show</code>, <code>format-patch</code>, or a <code>.patch</code> file).`;
    return;
  }
  if (parseErrorEl) parseErrorEl.textContent = "";
  lastDiff = diff;
  lastFindings = runRules(diff);
  render(lastDiff, lastFindings);
}

runBtn.addEventListener("click", runAnalysis);
input.addEventListener("input", () => {
  updateInputStats();
  localStorage.setItem("preflight:last-input", input.value);
});
input.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") runAnalysis();
});

document.getElementById("btn-sample-risky")!.addEventListener("click", () => {
  input.value = riskySample;
  updateInputStats();
  runAnalysis();
});
document.getElementById("btn-sample-clean")!.addEventListener("click", () => {
  input.value = cleanSample;
  updateInputStats();
  runAnalysis();
});

fileInput.addEventListener("change", async () => {
  const f = fileInput.files?.[0];
  if (!f) return;
  input.value = await f.text();
  updateInputStats();
  runAnalysis();
});

input.addEventListener("dragover", (e) => e.preventDefault());
input.addEventListener("drop", async (e) => {
  e.preventDefault();
  const f = e.dataTransfer?.files?.[0];
  if (f) {
    input.value = await f.text();
    updateInputStats();
    runAnalysis();
  }
});

copyBtn.addEventListener("click", async () => {
  await navigator.clipboard.writeText(lastReport);
  copyBtn.textContent = "Copied!";
  setTimeout(() => (copyBtn.textContent = "Copy markdown"), 1500);
});

downloadBtn.addEventListener("click", () => {
  const blob = new Blob([lastReport], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "preflight-report.md";
  a.click();
  URL.revokeObjectURL(url);
});
