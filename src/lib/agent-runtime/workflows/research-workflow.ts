import { createWorkflow } from "@mastra/core/workflows";

import type {
  ResearchCompletionClient,
  ResearchGenerationRequest,
  ResearchGenerationResponse,
} from "../../research-generation/types.ts";
import type { AgentRunTrace } from "../../types.ts";
import { createPlanResearchActionStep } from "../steps/plan-research-action.ts";
import { createRunResearchGenerationStep } from "../steps/run-research-generation.ts";
import {
  type ResearchWorkflowOutput,
  workflowInputSchema,
  workflowOutputSchema,
} from "../steps/research-step-schemas.ts";
import { createSummarizeResearchOutputStep } from "../steps/summarize-research-output.ts";
import {
  attachAgentRun,
  buildAgentRunSteps,
  createAgentRunId,
  PAPERFORGE_RESEARCH_WORKFLOW_ID,
} from "../traces/research-trace.ts";

export { PAPERFORGE_RESEARCH_WORKFLOW_ID };

export function createResearchWorkflow(client?: ResearchCompletionClient) {
  return createWorkflow({
    id: PAPERFORGE_RESEARCH_WORKFLOW_ID,
    description: "PaperForge research generation workflow powered by Mastra.",
    inputSchema: workflowInputSchema,
    outputSchema: workflowOutputSchema,
  })
    .then(createPlanResearchActionStep())
    .then(createRunResearchGenerationStep(client))
    .then(createSummarizeResearchOutputStep())
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
