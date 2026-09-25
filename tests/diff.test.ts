import { describe, expect, it } from "vitest";
import { parseDiff, addedLines, fileName } from "../src/diff";

const BASIC = `diff --git a/src/a.ts b/src/a.ts
index 111..222 100644
--- a/src/a.ts
+++ b/src/a.ts
@@ -1,3 +1,4 @@
 const a = 1;
-const b = 2;
+const b = 3;
+const c = 4;
 const d = 5;
`;

describe("parseDiff", () => {
  it("parses a basic modified file", () => {
    const d = parseDiff(BASIC);
    expect(d.files).toHaveLength(1);
    expect(d.files[0].status).toBe("modified");
    expect(fileName(d.files[0])).toBe("src/a.ts");
    expect(d.totalAdded).toBe(2);
    expect(d.totalRemoved).toBe(1);
  });

  it("tracks new-file line numbers", () => {
    const d = parseDiff(BASIC);
    const lines = addedLines(d.files[0]);
    expect(lines.map((l) => l.newLineNo)).toEqual([2, 3]);
  });

  it("marks added and deleted files via /dev/null", () => {
    const added = parseDiff(`diff --git a/new.ts b/new.ts
new file mode 100644
--- /dev/null
+++ b/new.ts
@@ -0,0 +1,2 @@
+one
+two
`);
    expect(added.files[0].status).toBe("added");
    const deleted = parseDiff(`diff --git a/old.ts b/old.ts
deleted file mode 100644
--- a/old.ts
+++ /dev/null
@@ -1,2 +0,0 @@
-one
-two
`);
    expect(deleted.files[0].status).toBe("deleted");
  });

  it("parses multiple files", () => {
    const multi = BASIC + `diff --git a/b.py b/b.py
--- a/b.py
+++ b/b.py
@@ -5,2 +5,2 @@
-x = 1
+x = 2
`;
    const d = parseDiff(multi);
    expect(d.files).toHaveLength(2);
    expect(fileName(d.files[1])).toBe("b.py");
  });

  it("handles diffs without git headers", () => {
    const d = parseDiff(`--- a/x.js
+++ b/x.js
@@ -1 +1 @@
-var a
+var b
`);
    expect(d.files).toHaveLength(1);
    expect(fileName(d.files[0])).toBe("x.js");
    expect(d.totalAdded).toBe(1);
  });

  it("returns zero files for non-diff input", () => {
    expect(parseDiff("hello world\nthis is not a diff").files).toHaveLength(0);
    expect(parseDiff("").files).toHaveLength(0);
  });

  it("marks binary files", () => {
    const d = parseDiff(`diff --git a/logo.png b/logo.png
index 111..222 100644
Binary files a/logo.png and b/logo.png differ
`);
    expect(d.files[0].isBinary).toBe(true);
  });
});
