import type {
  AgentRunStepStatus,
  AgentRunStepTrace,
  AgentRunTrace,
  ResearchProject,
} from "../../types.ts";
import type {
  ResearchGenerationRequest,
  ResearchGenerationResponse,
} from "../../research-generation/types.ts";

export const PAPERFORGE_RESEARCH_WORKFLOW_ID = "paperforge-research-workflow";

export type WorkflowStepResult = {
  status: AgentRunStepStatus | string;
  startedAt?: number;
  endedAt?: number;
  output?: unknown;
  error?: Error;
};

export const RESEARCH_WORKFLOW_STEP_DEFINITIONS = [
  {
    id: "plan_research_action",
    label: "规划研究动作",
  },
  {
    id: "run_research_generation",
    label: "执行研究生成",
  },
  {
    id: "summarize_research_output",
    label: "整理结构化结果",
  },
] as const;

export function attachAgentRun(
  project: ResearchProject,
  agentRun: AgentRunTrace
): ResearchProject {
  if (!project.researchSession) return project;

  const previousRuns = project.researchSession.agentRuns ?? [];
  return {
    ...project,
    researchSession: {
      ...project.researchSession,
      agentRuns: [...previousRuns, agentRun].slice(-20),
    },
  };
}

export function buildAgentRunSteps(
  steps: Record<string, WorkflowStepResult>
): AgentRunStepTrace[] {
  return RESEARCH_WORKFLOW_STEP_DEFINITIONS.map((definition) => {
    const step = steps[definition.id];
    return {
      id: definition.id,
      label: definition.label,
      status: normalizeStepStatus(step?.status),
      startedAt: step?.startedAt,
      endedAt: step?.endedAt,
      summary: createStepSummary(definition.id, step),
    };
  });
}

export function createAgentRunId() {
  return `agent-run-${crypto.randomUUID()}`;
}

export function createGenerationSummary(response?: ResearchGenerationResponse) {
  if (!response) return "研究生成未返回结果。";

  const phase = response.project.researchSession?.phase ?? "unknown";
  const source = response.usedFallback ? "fallback" : "provider";
  const patch = response.assetPatch ? "，包含待审核修改建议" : "";
  return `生成完成：phase=${phase}, source=${source}${patch}`;
}

export function getActionLabel(action: ResearchGenerationRequest["action"]) {
  switch (action) {
    case "discover_directions":
      return "发现研究方向";
    case "build_model":
      return "构建模型草案";
    case "solve_equilibrium":
      return "求解符号均衡";
    case "analyze_properties":
      return "生成性质分析";
    case "continue_conversation":
      return "继续研究对话";
    default:
      return "研究动作";
  }
}

function normalizeStepStatus(status?: string): AgentRunStepStatus {
  if (
    status === "success" ||
    status === "failed" ||
    status === "running" ||
    status === "waiting" ||
    status === "suspended" ||
    status === "paused"
  ) {
    return status;
  }

  return "skipped";
}

function createStepSummary(stepId: string, step?: WorkflowStepResult) {
  if (!step) return "该步骤尚未执行。";
  if (step.status === "failed") {
    return step.error?.message ?? "该步骤执行失败。";
  }
  if (step.status !== "success") return "该步骤尚未完成。";

  if (stepId === "plan_research_action") {
    const output = step.output as { label?: string } | undefined;
    return `已识别为：${output?.label ?? "研究动作"}`;
  }

  if (stepId === "run_research_generation") {
    const output = step.output as
      | { response?: ResearchGenerationResponse }
      | undefined;
    return createGenerationSummary(output?.response);
  }

  if (stepId === "summarize_research_output") {
    const output = step.output as { summary?: string } | undefined;
    return output?.summary ?? "已整理 Agent 输出。";
  }

  return "步骤已完成。";
}
