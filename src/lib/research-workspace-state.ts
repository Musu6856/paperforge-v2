type ResearchWorkspaceViewStateInput = {
  projectId?: string | null;
  startComposingNewConversation?: boolean;
  localComposingProjectId?: string | null;
};

export function getResearchWorkspaceViewState({
  projectId,
  startComposingNewConversation = false,
  localComposingProjectId = null,
}: ResearchWorkspaceViewStateInput) {
  return {
    isComposingNewConversation:
      !projectId ||
      startComposingNewConversation ||
      localComposingProjectId === projectId,
  };
}
