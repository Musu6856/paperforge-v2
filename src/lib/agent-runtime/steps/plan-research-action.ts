import { createStep } from "@mastra/core/workflows";

import { planResearchAction } from "../planners/research-planner.ts";
import {
  workflowInputSchema,
  workflowPlanSchema,
} from "../schemas/research-agent-schemas.ts";

export function createPlanResearchActionStep() {
  return createStep({
    id: "plan_research_action",
    description: "Classify the PaperForge research action before generation.",
    inputSchema: workflowInputSchema,
    outputSchema: workflowPlanSchema,
    execute: async ({ inputData }) => planResearchAction(inputData),
  });
}
