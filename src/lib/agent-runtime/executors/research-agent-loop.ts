import type {
  ResearchCompletionClient,
  ResearchGenerationAction,
  ResearchGenerationRequest,
  ResearchGenerationResponse,
} from "../../research-generation/types.ts";
import type { AgentRunTrace } from "../../types.ts";
import type { ResearchWorkflowOutput } from "../schemas/research-agent-schemas.ts";
import type { ResearchAgentDecision } from "../planners/research-next-action.ts";
import { attachAgentRun, buildAgentRunSteps, createAgentRunId } from "../traces/research-trace.ts";
import { createResearchWorkflow } from "../workflows/research-workflow.ts";
import { PAPERFORGE_RESEARCH_AGENT } from "../agents/research-agent.ts";

const MAX_AUTO_ADVANCE_STEPS = 2;
const AUTO_ADVANCE_ACTIONS = new Set<ResearchGenerationAction>([
  "solve_equilibrium",
  "analyze_properties",
]);

export async function runResearchAgentWorkflow(
  request: ResearchGenerationRequest,
  client?: ResearchCompletionClient
): Promise<ResearchGenerationResponse & { agentRun: AgentRunTrace }> {
  let result = await runSingleResearchAgentWorkflow(request, client);

  if (!request.autoAdvance) return result;

  for (let index = 0; index < MAX_AUTO_ADVANCE_STEPS; index += 1) {
    const nextRequest = createAutoAdvanceRequest(request, result);
    if (!nextRequest) break;

    result = await runSingleResearchAgentWorkflow(nextRequest, client);
  }

  return result;
}

async function runSingleResearchAgentWorkflow(
  request: ResearchGenerationRequest,
  client?: ResearchCompletionClient
): Promise<
  ResearchGenerationResponse & {
    agentRun: AgentRunTrace;
    agentDecision: ResearchAgentDecision;
  }
> {
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
    agentDecision: output.decision,
  };
}

function createAutoAdvanceRequest(
  originalRequest: ResearchGenerationRequest,
  result: ResearchGenerationResponse & {
    agentDecision?: ResearchAgentDecision;
  }
): ResearchGenerationRequest | null {
  const decision = result.agentDecision;
  if (decision?.kind !== "suggest_next_tool") return null;
  if (!AUTO_ADVANCE_ACTIONS.has(decision.nextAction)) return null;
  if (decision.nextAction === originalRequest.action) return null;

  return {
    action: decision.nextAction,
    rawIdea: result.project.rawIdea || originalRequest.rawIdea,
    project: result.project,
    runtimeModelSource: originalRequest.runtimeModelSource,
    autoAdvance: true,
  };
}
