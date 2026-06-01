import { generateResearchProject } from "../../ai-research-generation.ts";
import type {
  ResearchCompletionClient,
  ResearchGenerationRequest,
} from "../../research-generation/types.ts";

export function runResearchGenerationTool(
  request: ResearchGenerationRequest,
  client?: ResearchCompletionClient
) {
  return generateResearchProject(request, client);
}
