export type FileStatus = "added" | "modified" | "deleted" | "renamed";

export interface DiffLine {
  kind: "add" | "del" | "ctx";
  /** Line number in the new file (undefined for deleted lines). */
  newLineNo?: number;
  /** Line number in the old file (undefined for added lines). */
  oldLineNo?: number;
  text: string;
}

export interface DiffHunk {
  oldStart: number;
  oldCount: number;
  newStart: number;
  newCount: number;
  header: string;
  lines: DiffLine[];
}

export interface DiffFile {
  oldPath: string | null;
  newPath: string | null;
  status: FileStatus;
  hunks: DiffHunk[];
  isBinary: boolean;
}

export interface ParsedDiff {
  files: DiffFile[];
  totalAdded: number;
  totalRemoved: number;
}

export type Severity = "critical" | "high" | "medium" | "low" | "info";

export interface Finding {
  ruleId: string;
  ruleName: string;
  severity: Severity;
  file: string;
  line?: number;
  message: string;
  snippet?: string;
  suggestion?: string;
}

export interface GradeResult {
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  verdict: string;
  counts: Record<Severity, number>;
}
