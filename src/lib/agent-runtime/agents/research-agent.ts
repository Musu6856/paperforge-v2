import type { ResearchGenerationRequest } from "../../research-generation/types.ts";

export const PAPERFORGE_RESEARCH_AGENT = {
  id: "paperforge-research-agent",
  framework: "mastra",
  workflowId: "paperforge-research-workflow",
  role: "Chinese theoretical research workspace agent",
  objective:
    "Help users turn a research idea into symbolic model assets, equilibrium results, and property analyses.",
  guardrails: [
    "Keep the middle conversation derivation content visible.",
    "Prefer simple symbolic model progress over pretending complex models are solved.",
    "Stop or ask for clarification when the current project state is insufficient.",
  ],
  defaultStopConditions: [
    "the requested research asset has been generated",
    "the workflow needs user confirmation",
    "the model cannot be solved honestly with available symbolic tools",
  ],
} as const;

export type ResearchAgentAction = ResearchGenerationRequest["action"];
