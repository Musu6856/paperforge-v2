import { createStep } from "@mastra/core/workflows";

import { decideNextResearchAgentAction } from "../planners/research-next-action.ts";
import {
  workflowOutputSchema,
  workflowSummarySchema,
} from "../schemas/research-agent-schemas.ts";

export function createDecideNextAgentActionStep() {
  return createStep({
    id: "decide_next_agent_action",
    description: "Observe the generated research result and decide the next bounded Agent action.",
    inputSchema: workflowSummarySchema,
    outputSchema: workflowOutputSchema,
    execute: async ({ inputData }) => ({
      ...inputData,
      decision: decideNextResearchAgentAction(inputData),
    }),
  });
}
