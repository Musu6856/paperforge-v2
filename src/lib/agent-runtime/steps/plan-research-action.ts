import { createStep } from "@mastra/core/workflows";

import { getActionLabel } from "../traces/research-trace.ts";
import {
  workflowInputSchema,
  workflowPlanSchema,
} from "./research-step-schemas.ts";

export function createPlanResearchActionStep() {
  return createStep({
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
}
