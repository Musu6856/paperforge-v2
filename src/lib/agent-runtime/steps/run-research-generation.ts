import { createStep } from "@mastra/core/workflows";

import type { ResearchCompletionClient } from "../../research-generation/types.ts";
import { runResearchGenerationTool } from "../tools/research-generation-tool.ts";
import {
  workflowGenerationSchema,
  workflowPlanSchema,
} from "./research-step-schemas.ts";

export function createRunResearchGenerationStep(
  client?: ResearchCompletionClient
) {
  return createStep({
    id: "run_research_generation",
    description: "Run the existing structured research generator inside Mastra.",
    inputSchema: workflowPlanSchema,
    outputSchema: workflowGenerationSchema,
    execute: async ({ inputData }) => ({
      plan: inputData,
      response: await runResearchGenerationTool(inputData.request, client),
    }),
  });
}
