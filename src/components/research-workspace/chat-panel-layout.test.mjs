import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("chat panel constrains assistant markdown bubbles inside the center column", async () => {
  const source = await readFile(
    new URL("./chat-panel.tsx", import.meta.url),
    "utf8"
  );

  assert.match(source, /mx-auto flex w-full max-w-3xl min-w-0 flex-col/);
  assert.match(source, /max-w-full self-start text-left/);
  assert.match(source, /max-w-full min-w-0 overflow-hidden rounded-md border bg-card/);
});

test("markdown renderer does not let prose escape its parent width", async () => {
  const source = await readFile(
    new URL("../markdown-renderer.tsx", import.meta.url),
    "utf8"
  );

  assert.match(source, /prose prose-sm max-w-full min-w-0/);
});
