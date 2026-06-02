import type { ResearchGenerationRequest } from "../../research-generation/types.ts";

export type ResearchMemorySnapshot = {
  phase: string;
  hasProject: boolean;
  hasModel: boolean;
  hasEquilibrium: boolean;
  propertyAnalysisCount: number;
  recentMessageCount: number;
};

export function createResearchMemorySnapshot(
  request: ResearchGenerationRequest
): ResearchMemorySnapshot {
  const project = request.project;
  const session = project?.researchSession;

  return {
    phase: session?.phase ?? "new",
    hasProject: Boolean(project),
    hasModel: Boolean(project?.hotellingModel),
    hasEquilibrium: Boolean(project?.equilibriumResult),
    propertyAnalysisCount: project?.propertyAnalyses?.length ?? 0,
    recentMessageCount: session?.messages?.length ?? 0,
  };
}
