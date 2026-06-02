import {
  IMPLICIT_SYSTEM_FIXTURE_PROJECT_ID,
  seedImplicitSystemDevelopmentFixture,
} from "../src/lib/development-fixtures.ts";

const project = seedImplicitSystemDevelopmentFixture();

console.log(
  JSON.stringify(
    {
      projectId: project.id,
      expectedProjectId: IMPLICIT_SYSTEM_FIXTURE_PROJECT_ID,
      phase: project.researchSession?.phase,
      equilibriumStatus: project.equilibriumResult?.status,
      propertyAnalysisCount: project.propertyAnalyses?.length ?? 0,
      url: `/research/${project.id}`,
    },
    null,
    2
  )
);
