import type {
  ResearchCompletionClient,
  ResearchGenerationRequest,
  ResearchGenerationResponse,
} from "../../research-generation/types.ts";
import type { AgentRunTrace } from "../../types.ts";
import type { ResearchWorkflowOutput } from "../schemas/research-agent-schemas.ts";
import { attachAgentRun, buildAgentRunSteps, createAgentRunId } from "../traces/research-trace.ts";
import { createResearchWorkflow } from "../workflows/research-workflow.ts";
import { PAPERFORGE_RESEARCH_AGENT } from "../agents/research-agent.ts";

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
      framework: PAPERFORGE_RESEARCH_AGENT.framework,
      workflowId: PAPERFORGE_RESEARCH_AGENT.workflowId,
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
    framework: PAPERFORGE_RESEARCH_AGENT.framework,
    workflowId: PAPERFORGE_RESEARCH_AGENT.workflowId,
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
