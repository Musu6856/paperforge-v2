import {
  seedSimpleEquilibriumDevelopmentFixture,
  SIMPLE_EQUILIBRIUM_FIXTURE_PROJECT_ID,
} from "../src/lib/development-fixtures.ts";

const project = seedSimpleEquilibriumDevelopmentFixture();

console.log(
  JSON.stringify(
    {
      projectId: project.id,
      expectedProjectId: SIMPLE_EQUILIBRIUM_FIXTURE_PROJECT_ID,
      phase: project.researchSession?.phase,
      equilibriumStatus: project.equilibriumResult?.status,
      propertyAnalysisCount: project.propertyAnalyses?.length ?? 0,
      url: `/research/${project.id}`,
    },
    null,
    2
  )
);
