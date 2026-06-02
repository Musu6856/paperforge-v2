import { createStep } from "@mastra/core/workflows";

import { createGenerationSummary } from "../traces/research-trace.ts";
import {
  workflowGenerationSchema,
  workflowOutputSchema,
} from "../schemas/research-agent-schemas.ts";

export function createSummarizeResearchOutputStep() {
  return createStep({
    id: "summarize_research_output",
    description: "Prepare a concise workflow result summary for the UI trace.",
    inputSchema: workflowGenerationSchema,
    outputSchema: workflowOutputSchema,
    execute: async ({ inputData }) => ({
      ...inputData,
      summary: createGenerationSummary(inputData.response),
    }),
  });
}
