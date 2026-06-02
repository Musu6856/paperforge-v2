import { createWorkflow } from "@mastra/core/workflows";

import type { ResearchCompletionClient } from "../../research-generation/types.ts";
import { PAPERFORGE_RESEARCH_AGENT } from "../agents/research-agent.ts";
import {
  workflowInputSchema,
  workflowOutputSchema,
} from "../schemas/research-agent-schemas.ts";
import { createDecideNextAgentActionStep } from "../steps/decide-next-agent-action.ts";
import { createPlanResearchActionStep } from "../steps/plan-research-action.ts";
import { createRunResearchGenerationStep } from "../steps/run-research-generation.ts";
import { createSummarizeResearchOutputStep } from "../steps/summarize-research-output.ts";

export const PAPERFORGE_RESEARCH_WORKFLOW_ID =
  PAPERFORGE_RESEARCH_AGENT.workflowId;

export function createResearchWorkflow(client?: ResearchCompletionClient) {
  return createWorkflow({
    id: PAPERFORGE_RESEARCH_AGENT.workflowId,
    description: "PaperForge research generation workflow powered by Mastra.",
    inputSchema: workflowInputSchema,
    outputSchema: workflowOutputSchema,
  })
    .then(createPlanResearchActionStep())
    .then(createRunResearchGenerationStep(client))
    .then(createSummarizeResearchOutputStep())
    .then(createDecideNextAgentActionStep())
    .commit();
}
