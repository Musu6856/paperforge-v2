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

export const workflowActionPlanSchema = z.object({
  objective: z.string(),
  expectedOutput: z.string(),
  executionMode: z.string(),
});

export const workflowPlanSchema = z.object({
  action: z.string(),
  label: z.string(),
  actionPlan: workflowActionPlanSchema,
  memory: z.object({
    phase: z.string(),
    hasProject: z.boolean(),
    hasModel: z.boolean(),
    hasEquilibrium: z.boolean(),
    propertyAnalysisCount: z.number(),
    recentMessageCount: z.number(),
  }),
  guard: z.object({
    canRunRequestedAction: z.boolean(),
    reason: z.string(),
  }),
  selectedTool: z.string(),
  rawIdea: z.string(),
  request: workflowInputSchema,
});

export const workflowGenerationSchema = z.object({
  plan: workflowPlanSchema,
  response: z.custom<ResearchGenerationResponse>(),
});

export const workflowSummarySchema = z.object({
  plan: workflowPlanSchema,
  response: z.custom<ResearchGenerationResponse>(),
  summary: z.string(),
});

export const workflowDecisionSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("suggest_next_tool"),
    reason: z.string(),
    nextAction: z.string(),
    nextTool: z.string(),
  }),
  z.object({
    kind: z.literal("ask_user"),
    reason: z.string(),
  }),
  z.object({
    kind: z.literal("stop"),
    reason: z.string(),
  }),
]);

export const workflowOutputSchema = workflowSummarySchema.extend({
  decision: workflowDecisionSchema,
});

export type ResearchWorkflowSummary = z.infer<typeof workflowSummarySchema>;
export type ResearchWorkflowOutput = z.infer<typeof workflowOutputSchema>;
