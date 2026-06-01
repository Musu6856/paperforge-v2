import test from "node:test";
import assert from "node:assert/strict";

import { getResearchWorkspaceViewState } from "./research-workspace-state.ts";

test("local new-conversation state is scoped to the project where it started", () => {
  const viewState = getResearchWorkspaceViewState({
    projectId: "project-being-viewed",
    startComposingNewConversation: false,
    localComposingProjectId: "project-that-started-draft",
  });

  assert.equal(viewState.isComposingNewConversation, false);
});

test("opening the same project from history can leave local composing mode", () => {
  const viewState = getResearchWorkspaceViewState({
    projectId: "project-being-viewed",
    startComposingNewConversation: false,
    localComposingProjectId: null,
  });

  assert.equal(viewState.isComposingNewConversation, false);
});

test("route-level compose mode still shows a new conversation with an existing project", () => {
  const viewState = getResearchWorkspaceViewState({
    projectId: "project-being-viewed",
    startComposingNewConversation: true,
    localComposingProjectId: null,
  });

  assert.equal(viewState.isComposingNewConversation, true);
});
