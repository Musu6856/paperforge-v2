import type {
  AgentRunStepStatus,
  AgentRunTrace,
  ResearchSession,
} from "../types.ts";

export type AgentRunStatusTone = "success" | "warning" | "neutral";

export type AgentRunStepViewModel = {
  id: string;
  label: string;
  statusLabel: string;
  statusTone: AgentRunStatusTone;
  summary?: string;
  durationLabel: string;
};

export type AgentRunViewModel =
  | {
      hasRun: true;
      run: {
        id: string;
        frameworkLabel: string;
        workflowId: string;
        actionLabel: string;
        statusLabel: string;
        statusTone: AgentRunStatusTone;
        durationLabel: string;
        error?: string;
        steps: AgentRunStepViewModel[];
      };
      emptyTitle?: never;
      emptyDescription?: never;
    }
  | {
      hasRun: false;
      run?: never;
      emptyTitle: string;
      emptyDescription: string;
    };

export function createAgentRunViewModel(
  session: Pick<ResearchSession, "agentRuns">,
  now = Date.now()
): AgentRunViewModel {
  const latestRun = session.agentRuns?.at(-1);

  if (!latestRun) {
    return {
      hasRun: false,
      emptyTitle: "No Agent run yet",
      emptyDescription:
        "Start a research generation to create a Mastra workflow trace.",
    };
  }

  return {
    hasRun: true,
    run: {
      id: latestRun.id,
      frameworkLabel: formatFramework(latestRun.framework),
      workflowId: latestRun.workflowId,
      actionLabel: latestRun.action,
      statusLabel: latestRun.status === "success" ? "Completed" : "Failed",
      statusTone: latestRun.status === "success" ? "success" : "warning",
      durationLabel: formatDuration(latestRun.startedAt, latestRun.endedAt, now),
      error: latestRun.error,
      steps: latestRun.steps.map((step) => ({
        id: step.id,
        label: step.label,
        statusLabel: formatStepStatus(step.status),
        statusTone: getStepStatusTone(step.status),
        summary: step.summary,
        durationLabel: formatDuration(step.startedAt, step.endedAt, now),
      })),
    },
  };
}

function formatFramework(framework: AgentRunTrace["framework"]) {
  return framework === "mastra" ? "Mastra" : framework;
}

function formatStepStatus(status: AgentRunStepStatus) {
  switch (status) {
    case "success":
      return "Completed";
    case "failed":
      return "Failed";
    case "running":
      return "Running";
    case "waiting":
      return "Waiting";
    case "suspended":
      return "Suspended";
    case "paused":
      return "Paused";
    case "skipped":
      return "Skipped";
  }
}

function getStepStatusTone(status: AgentRunStepStatus): AgentRunStatusTone {
  if (status === "success") return "success";
  if (status === "failed") return "warning";
  return "neutral";
}

function formatDuration(startedAt?: number, endedAt?: number, now = Date.now()) {
  if (!startedAt) return "n/a";

  const elapsed = Math.max(0, (endedAt ?? now) - startedAt);
  if (elapsed < 10000) return `${(elapsed / 1000).toFixed(1)}s`;

  return `${Math.round(elapsed / 1000)}s`;
}
