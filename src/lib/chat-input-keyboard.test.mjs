import test from "node:test";
import assert from "node:assert/strict";

import { shouldSubmitChatDraftFromKeyDown } from "./chat-input-keyboard.ts";

test("chat input submits on plain Enter", () => {
  assert.equal(shouldSubmitChatDraftFromKeyDown({ key: "Enter" }), true);
});

test("chat input keeps Shift+Enter for multiline drafts", () => {
  assert.equal(
    shouldSubmitChatDraftFromKeyDown({ key: "Enter", shiftKey: true }),
    false
  );
});

test("chat input does not submit while IME composition is active", () => {
  assert.equal(
    shouldSubmitChatDraftFromKeyDown({
      key: "Enter",
      nativeEvent: { isComposing: true },
    }),
    false
  );
});

test("chat input ignores non-Enter keys", () => {
  assert.equal(shouldSubmitChatDraftFromKeyDown({ key: "a" }), false);
});
