import type { DiffFile, DiffHunk, DiffLine, ParsedDiff } from "./types";

const HUNK_RE = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@\s*(.*)/;
const DIFF_GIT_RE = /^diff --git (?:a\/)?(.+?) (?:b\/)?(.+)$/;

function stripPrefix(p: string): string {
  return p.replace(/^[ab]\//, "");
}

/** Parse unified diff text (git diff, git show, format-patch bodies, GitHub patch view). */
export function parseDiff(input: string): ParsedDiff {
  const files: DiffFile[] = [];
  let current: DiffFile | null = null;
  let hunk: DiffHunk | null = null;
  let oldLine = 0;
  let newLine = 0;
  let pendingOld: string | null = null;
  let pendingNew: string | null = null;

  const flushPendingFile = () => {
    if (!current && pendingNew !== null) {
      current = {
        oldPath: pendingOld === "/dev/null" ? null : pendingOld ? stripPrefix(pendingOld) : null,
        newPath: pendingNew === "/dev/null" ? null : pendingNew ? stripPrefix(pendingNew) : null,
        status: "modified",
        hunks: [],
        isBinary: false,
      };
      files.push(current);
    }
    pendingOld = null;
    pendingNew = null;
  };

  for (const raw of input.split(/\r?\n/)) {
    const gitMatch = DIFF_GIT_RE.exec(raw);
    if (gitMatch) {
      flushPendingFile();
      hunk = null;
      current = {
        oldPath: gitMatch[1] === "/dev/null" ? null : gitMatch[1],
        newPath: gitMatch[2] === "/dev/null" ? null : gitMatch[2],
        status: "modified",
        hunks: [],
        isBinary: false,
      };
      files.push(current);
      continue;
    }

    if (raw.startsWith("new file mode")) {
      if (current) current.status = "added";
      continue;
    }
    if (raw.startsWith("deleted file mode")) {
      if (current) current.status = "deleted";
      continue;
    }
    if (raw.startsWith("rename from") || raw.startsWith("rename to")) {
      if (current) current.status = "renamed";
      continue;
    }
    if (raw.startsWith("similarity index") || raw.startsWith("index ") || raw.startsWith("old mode") || raw.startsWith("new mode") || raw.startsWith("copy from") || raw.startsWith("copy to")) {
      continue;
    }
    if (raw.startsWith("Binary files") || raw.startsWith("GIT binary patch")) {
      if (current) current.isBinary = true;
      continue;
    }

    if (raw.startsWith("--- ")) {
      const p = raw.slice(4).trim();
      if (!current && pendingNew === null) {
        pendingOld = p;
      } else if (current) {
        current.oldPath = p === "/dev/null" ? null : stripPrefix(p);
        if (p === "/dev/null") current.status = "added";
      }
      continue;
    }
    if (raw.startsWith("+++ ")) {
      const p = raw.slice(4).trim();
      if (!current) {
        pendingNew = p;
        flushPendingFile();
      } else {
        current.newPath = p === "/dev/null" ? null : stripPrefix(p);
        if (p === "/dev/null") current.status = "deleted";
      }
      continue;
    }

    const hunkMatch = HUNK_RE.exec(raw);
    if (hunkMatch) {
      flushPendingFile();
      if (!current) continue;
      hunk = {
        oldStart: parseInt(hunkMatch[1], 10),
        oldCount: hunkMatch[2] ? parseInt(hunkMatch[2], 10) : 1,
        newStart: parseInt(hunkMatch[3], 10),
        newCount: hunkMatch[4] ? parseInt(hunkMatch[4], 10) : 1,
        header: hunkMatch[5] ?? "",
        lines: [],
      };
      current.hunks.push(hunk);
      oldLine = hunk.oldStart;
      newLine = hunk.newStart;
      continue;
    }

    if (!hunk) continue;

    if (raw.startsWith("\\")) {
      // "\ No newline at end of file"
      continue;
    }

    const marker = raw[0];
    const text = raw.slice(1);
    let line: DiffLine | null = null;
    if (marker === "+") {
      line = { kind: "add", newLineNo: newLine++, text };
    } else if (marker === "-") {
      line = { kind: "del", oldLineNo: oldLine++, text };
    } else if (marker === " " || raw === "") {
      line = { kind: "ctx", oldLineNo: oldLine++, newLineNo: newLine++, text: marker === " " ? text : raw };
    }
    if (line) hunk.lines.push(line);
  }
  flushPendingFile();

  // Reconcile status for diffs where /dev/null appeared but mode lines were absent.
  for (const f of files) {
    if (f.status === "modified") {
      if (f.oldPath === null && f.newPath !== null) f.status = "added";
      else if (f.newPath === null && f.oldPath !== null) f.status = "deleted";
    }
  }

  let totalAdded = 0;
  let totalRemoved = 0;
  for (const f of files) {
    for (const h of f.hunks) {
      for (const l of h.lines) {
        if (l.kind === "add") totalAdded++;
        else if (l.kind === "del") totalRemoved++;
      }
    }
  }

  return { files, totalAdded, totalRemoved };
}

export function fileName(f: DiffFile): string {
  return f.newPath ?? f.oldPath ?? "(unknown)";
}

export function addedLines(f: DiffFile): DiffLine[] {
  const out: DiffLine[] = [];
  for (const h of f.hunks) for (const l of h.lines) if (l.kind === "add") out.push(l);
  return out;
}

export function addedText(f: DiffFile): string {
  return addedLines(f)
    .map((l) => l.text)
    .join("\n");
}
