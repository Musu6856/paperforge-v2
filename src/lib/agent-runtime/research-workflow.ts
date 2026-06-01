import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod/v4";

import { generateResearchProject } from "../ai-research-generation.ts";
import type {
  ResearchCompletionClient,
  ResearchGenerationRequest,
  ResearchGenerationResponse,
} from "../research-generation/types.ts";
import type {
  AgentRunStepStatus,
  AgentRunStepTrace,
  AgentRunTrace,
  ResearchProject,
} from "../types.ts";

export const PAPERFORGE_RESEARCH_WORKFLOW_ID = "paperforge-research-workflow";

const workflowInputSchema = z.custom<ResearchGenerationRequest>(
  (value) =>
    Boolean(
      value &&
        typeof value === "object" &&
        "action" in value &&
        "rawIdea" in value
    )
);

const workflowPlanSchema = z.object({
  action: z.string(),
  label: z.string(),
  rawIdea: z.string(),
  request: workflowInputSchema,
});

const workflowGenerationSchema = z.object({
  plan: workflowPlanSchema,
  response: z.custom<ResearchGenerationResponse>(),
});

const workflowOutputSchema = z.object({
  plan: workflowPlanSchema,
  response: z.custom<ResearchGenerationResponse>(),
  summary: z.string(),
});

type ResearchWorkflowOutput = z.infer<typeof workflowOutputSchema>;

type WorkflowStepResult = {
  status: AgentRunStepStatus | string;
  startedAt?: number;
  endedAt?: number;
  output?: unknown;
  error?: Error;
};

const STEP_DEFINITIONS = [
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

function createResearchWorkflow(client?: ResearchCompletionClient) {
  const planResearchAction = createStep({
    id: "plan_research_action",
    description: "Classify the PaperForge research action before generation.",
    inputSchema: workflowInputSchema,
    outputSchema: workflowPlanSchema,
    execute: async ({ inputData }) => ({
      action: inputData.action,
      label: getActionLabel(inputData.action),
      rawIdea: inputData.rawIdea,
      request: inputData,
    }),
  });

  const runResearchGeneration = createStep({
    id: "run_research_generation",
    description: "Run the existing structured research generator inside Mastra.",
    inputSchema: workflowPlanSchema,
    outputSchema: workflowGenerationSchema,
    execute: async ({ inputData }) => ({
      plan: inputData,
      response: await generateResearchProject(inputData.request, client),
    }),
  });

  const summarizeResearchOutput = createStep({
    id: "summarize_research_output",
    description: "Prepare a concise workflow result summary for the UI trace.",
    inputSchema: workflowGenerationSchema,
    outputSchema: workflowOutputSchema,
    execute: async ({ inputData }) => ({
      ...inputData,
      summary: createGenerationSummary(inputData.response),
    }),
  });

  return createWorkflow({
    id: PAPERFORGE_RESEARCH_WORKFLOW_ID,
    description: "PaperForge research generation workflow powered by Mastra.",
    inputSchema: workflowInputSchema,
    outputSchema: workflowOutputSchema,
  })
    .then(planResearchAction)
    .then(runResearchGeneration)
    .then(summarizeResearchOutput)
    .commit();
}

export async function runResearchAgentWorkflow(
  request: ResearchGenerationRequest,
  client?: ResearchCompletionClient
): Promise<ResearchGenerationResponse & { agentRun: AgentRunTrace }> {
  const workflow = createResearchWorkflow(client);
  const runId = createAgentRunId();
  const startedAt = Date.now();
  const run = await workflow.createRun({ runId });
  const workflowResult = await run.start({ inputData: request });
  const endedAt = Date.now();

  if (workflowResult.status !== "success") {
    const agentRun: AgentRunTrace = {
      id: runId,
      framework: "mastra",
      workflowId: PAPERFORGE_RESEARCH_WORKFLOW_ID,
      action: request.action,
      status: "failed",
      startedAt,
      endedAt,
      steps: buildAgentRunSteps(workflowResult.steps),
      error:
        "error" in workflowResult
          ? workflowResult.error.message
          : "Mastra workflow did not finish successfully.",
    };
    throw new Error(agentRun.error);
  }

  const output = workflowResult.result as ResearchWorkflowOutput;
  const agentRun: AgentRunTrace = {
    id: runId,
    framework: "mastra",
    workflowId: PAPERFORGE_RESEARCH_WORKFLOW_ID,
    action: request.action,
    status: "success",
    startedAt,
    endedAt,
    steps: buildAgentRunSteps(workflowResult.steps),
  };
  const project = attachAgentRun(output.response.project, agentRun);

  return {
    ...output.response,
    project,
    agentRun,
  };
}

function attachAgentRun(
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

function buildAgentRunSteps(
  steps: Record<string, WorkflowStepResult>
): AgentRunStepTrace[] {
  return STEP_DEFINITIONS.map((definition) => {
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

function createGenerationSummary(response?: ResearchGenerationResponse) {
  if (!response) return "研究生成未返回结果。";

  const phase = response.project.researchSession?.phase ?? "unknown";
  const source = response.usedFallback ? "fallback" : "provider";
  const patch = response.assetPatch ? "，包含待审核修改建议" : "";
  return `生成完成：phase=${phase}, source=${source}${patch}`;
}

function getActionLabel(action: ResearchGenerationRequest["action"]) {
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

function createAgentRunId() {
  return `agent-run-${crypto.randomUUID()}`;
}
