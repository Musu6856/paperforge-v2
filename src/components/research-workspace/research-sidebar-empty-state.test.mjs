import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("empty research sidebar keeps account and settings controls visible", async () => {
  const source = await readFile(
    new URL("./research-workspace.tsx", import.meta.url),
    "utf8"
  );

  assert.match(
    source,
    /<ResearchEmptySidebar\s+copy=\{copy\.sidebar\}\s+modelSourceCopy=\{copy\.modelSource\}\s*\/>/
  );
  assert.match(
    source,
    /function ResearchEmptySidebar\(\{\s*copy,\s*modelSourceCopy[\s\S]*<SidebarAccountToolbar\s+copy=\{copy\}\s+modelSourceCopy=\{modelSourceCopy\}/
  );
});
