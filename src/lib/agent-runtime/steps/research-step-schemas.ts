import { z } from "zod/v4";

import type {
  ResearchGenerationRequest,
  ResearchGenerationResponse,
} from "../../research-generation/types.ts";

export const workflowInputSchema = z.custom<ResearchGenerationRequest>(
  (value) =>
    Boolean(
      value &&
        typeof value === "object" &&
        "action" in value &&
        "rawIdea" in value
    )
);

export const workflowPlanSchema = z.object({
  action: z.string(),
  label: z.string(),
  rawIdea: z.string(),
  request: workflowInputSchema,
});

export const workflowGenerationSchema = z.object({
  plan: workflowPlanSchema,
  response: z.custom<ResearchGenerationResponse>(),
});

export const workflowOutputSchema = z.object({
  plan: workflowPlanSchema,
  response: z.custom<ResearchGenerationResponse>(),
  summary: z.string(),
});

export type ResearchWorkflowOutput = z.infer<typeof workflowOutputSchema>;
