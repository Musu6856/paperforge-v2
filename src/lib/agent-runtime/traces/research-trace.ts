import type {
  AgentRunStepDetail,
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
      details: createStepDetails(definition.id, step),
    };
  });
}

export function createAgentRunId() {
  return `agent-run-${crypto.randomUUID()}`;
}

export function createGenerationSummary(response?: ResearchGenerationResponse) {
  if (!response) return "研究生成未返回结果。";

  const phase = response.project.researchSession?.phase ?? "unknown";
  const source = response.usedFallback ? "本地 fallback" : "模型 provider";
  const patch = response.assetPatch ? "，包含待审核修改建议" : "";
  return `生成完成：进入 ${phase} 阶段，来源 ${source}${patch}。`;
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
    const output = step.output as
      | {
          label?: string;
          actionPlan?: {
            objective?: string;
          };
        }
      | undefined;
    const label = output?.label ?? "研究动作";
    const objective = output?.actionPlan?.objective;
    return objective ? `计划动作：${label}；${objective}` : `计划动作：${label}`;
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

function createStepDetails(
  stepId: string,
  step?: WorkflowStepResult
): AgentRunStepDetail[] {
  if (!step || step.status !== "success") return [];

  if (stepId === "plan_research_action") {
    const output = step.output as
      | {
          label?: string;
          actionPlan?: {
            objective?: string;
            expectedOutput?: string;
            executionMode?: string;
          };
        }
      | undefined;

    return compactDetails([
      { label: "动作", value: output?.label },
      { label: "计划", value: output?.actionPlan?.objective },
      { label: "预期输出", value: output?.actionPlan?.expectedOutput },
      { label: "执行方式", value: output?.actionPlan?.executionMode },
    ]);
  }

  if (stepId === "run_research_generation") {
    const output = step.output as
      | { response?: ResearchGenerationResponse }
      | undefined;
    return createGenerationDetails(output?.response);
  }

  if (stepId === "summarize_research_output") {
    const output = step.output as
      | {
          summary?: string;
          response?: ResearchGenerationResponse;
        }
      | undefined;
    const response = output?.response;
    const phase = response?.project.researchSession?.phase;
    const pendingKind =
      response?.project.researchSession?.assetSummary.pendingDecision?.kind ??
      "无";

    return compactDetails([
      { label: "输出摘要", value: output?.summary },
      { label: "结果阶段", value: phase },
      { label: "下一动作", value: pendingKind },
    ]);
  }

  return [];
}

function createGenerationDetails(
  response?: ResearchGenerationResponse
): AgentRunStepDetail[] {
  if (!response) return [];

  const phase = response.project.researchSession?.phase;
  const source = response.usedFallback ? "本地 fallback" : "模型 provider";
  const equilibriumStatus = response.project.equilibriumResult?.status;
  const propertyCount = response.project.propertyAnalyses?.length;
  const patchSummary = response.assetPatch?.summary;

  return compactDetails([
    { label: "调用来源", value: source },
    { label: "结果阶段", value: phase },
    { label: "均衡状态", value: equilibriumStatus },
    {
      label: "性质分析",
      value:
        typeof propertyCount === "number" && propertyCount > 0
          ? `${propertyCount} 项`
          : undefined,
    },
    { label: "待审核修改", value: patchSummary },
    { label: "回复摘要", value: summarizeText(response.assistantMessage) },
  ]);
}

function compactDetails(
  details: Array<{ label: string; value?: string | null }>
): AgentRunStepDetail[] {
  return details
    .map((detail) => ({
      label: detail.label,
      value: detail.value?.trim() ?? "",
    }))
    .filter((detail) => detail.value.length > 0);
}

function summarizeText(value: string) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= 96) return normalized;
  return `${normalized.slice(0, 96)}...`;
}
