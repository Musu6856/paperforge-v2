import type { AgentRunViewModel } from "./agent-runtime/run-view.ts";
import type { ResearchSessionMessage } from "./types";

export type ResearchChatAgentRunSummary = Extract<
  AgentRunViewModel,
  { hasRun: true }
>["run"];

export type ResearchChatViewMessage = ResearchSessionMessage & {
  isPending?: boolean;
  agentRun?: ResearchChatAgentRunSummary;
};

export function createResearchChatViewMessages(
  messages: ResearchSessionMessage[],
  optimisticMessage: ResearchSessionMessage | null,
  pendingAssistantMessage: ResearchChatViewMessage | null = null,
  latestAgentRun: ResearchChatAgentRunSummary | null = null
): ResearchChatViewMessage[] {
  if (!optimisticMessage && !pendingAssistantMessage) {
    return attachAgentRunToLatestAssistant(messages, latestAgentRun);
  }

  const confirmedUserIndex = optimisticMessage
    ? findLastMatchingMessageIndex(messages, optimisticMessage)
    : -1;

  if (confirmedUserIndex >= 0) {
    const assistantAlreadyArrived = messages
      .slice(confirmedUserIndex + 1)
      .some((message) => message.role === "assistant");

    if (assistantAlreadyArrived || !pendingAssistantMessage) {
      return attachAgentRunToLatestAssistant(messages, latestAgentRun);
    }

    return attachAgentRunToLatestAssistant(
      [
        ...messages.slice(0, confirmedUserIndex + 1),
        pendingAssistantMessage,
        ...messages.slice(confirmedUserIndex + 1),
      ],
      latestAgentRun
    );
  }

  const viewMessages: ResearchChatViewMessage[] = [...messages];
  if (optimisticMessage) viewMessages.push(optimisticMessage);
  if (pendingAssistantMessage) viewMessages.push(pendingAssistantMessage);
  return attachAgentRunToLatestAssistant(viewMessages, latestAgentRun);
}

function attachAgentRunToLatestAssistant(
  messages: ResearchChatViewMessage[],
  agentRun: ResearchChatAgentRunSummary | null
): ResearchChatViewMessage[] {
  if (!agentRun) return messages;

  const targetIndex = findLatestAssistantMessageIndex(messages);
  if (targetIndex < 0) return messages;

  return messages.map((message, index) =>
    index === targetIndex ? { ...message, agentRun } : message
  );
}

function findLatestAssistantMessageIndex(messages: ResearchChatViewMessage[]) {
  for (let index = messages.length - 1; index >= 0; index--) {
    const message = messages[index];
    if (message.role === "assistant" && !message.isPending) {
      return index;
    }
  }
  return -1;
}

function normalizeMessageContent(content: string) {
  return content.trim().replace(/\s+/g, " ");
}

function findLastMatchingMessageIndex(
  messages: ResearchSessionMessage[],
  targetMessage: ResearchSessionMessage
) {
  const targetContent = normalizeMessageContent(targetMessage.content);
  for (let index = messages.length - 1; index >= 0; index--) {
    const message = messages[index];
    if (message.role !== targetMessage.role) continue;
    if (normalizeMessageContent(message.content) === targetContent) {
      return index;
    }
  }
  return -1;
}
