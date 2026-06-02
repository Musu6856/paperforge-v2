import { DEVELOPMENT_GUEST_USER_ID } from "./auth.ts";
import { createDevelopmentProject } from "./development-project-store.ts";
import {
  adoptResearchDirection,
  confirmResearchModel,
  createExplorationProject,
  generatePropertyAnalysis,
  generateSymbolicEquilibrium,
} from "./research-session.ts";
import type { AgentRunTrace, ResearchProject } from "./types.ts";

export const IMPLICIT_SYSTEM_FIXTURE_PROJECT_ID =
  "00000000-0000-4000-8000-000000000123";

export function createImplicitSystemFixtureProject(
  now = 1710000300000
): ResearchProject {
  const project = createExplorationProject({
    id: IMPLICIT_SYSTEM_FIXTURE_PROJECT_ID,
    rawIdea: "Local implicit-system fixture for seller multihoming",
    now,
  });

  const analyzed = generatePropertyAnalysis(
    generateSymbolicEquilibrium(
      confirmResearchModel(
        adoptResearchDirection(project, "seller-multihoming-pricing")
      )
    )
  );

  return attachImplicitSystemFixtureAgentRun(analyzed, now);
}

export function seedImplicitSystemDevelopmentFixture(
  ownerId = DEVELOPMENT_GUEST_USER_ID,
  now = Date.now()
): ResearchProject {
  return createDevelopmentProject(
    ownerId,
    createImplicitSystemFixtureProject(now)
  );
}

function attachImplicitSystemFixtureAgentRun(
  project: ResearchProject,
  now: number
): ResearchProject {
  if (!project.researchSession) return project;

  const startedAt = now + 1000;
  const endedAt = startedAt + 1800;
  const agentRun: AgentRunTrace = {
    id: "agent-run-implicit-system-fixture",
    framework: "mastra",
    workflowId: "paperforge-research-workflow",
    action: "analyze_properties",
    status: "success",
    startedAt,
    endedAt,
    steps: [
      {
        id: "plan_research_action",
        label: "Plan research action",
        status: "success",
        startedAt,
        endedAt: startedAt + 100,
        summary:
          "Fixture plan: inspect the implicit equilibrium system and generate symbolic property analyses.",
        details: [
          { label: "Action", value: "analyze_properties" },
          {
            label: "Plan",
            value:
              "Use the local implicit-system fixture to exercise the browser trace and property-analysis surfaces without a provider call.",
          },
          {
            label: "Expected output",
            value:
              "A persisted analysis-phase project with implicit-system equilibrium, property analyses, and visible Agent trace details.",
          },
          { label: "Execution mode", value: "local fixture" },
        ],
      },
      {
        id: "run_research_generation",
        label: "Run research generation",
        status: "success",
        startedAt: startedAt + 100,
        endedAt: startedAt + 1400,
        summary:
          "Fixture generation complete: analysis phase with implicit_system equilibrium and local property analyses.",
        details: [
          { label: "Source", value: "local fixture" },
          { label: "Result phase", value: "analysis" },
          { label: "Equilibrium status", value: "implicit_system" },
          {
            label: "Property analyses",
            value: `${project.propertyAnalyses?.length ?? 0} items`,
          },
          {
            label: "Reply summary",
            value:
              project.researchSession.messages.at(-1)?.content.slice(0, 120) ??
              "Implicit-system fixture generated.",
          },
        ],
      },
      {
        id: "summarize_research_output",
        label: "Summarize structured result",
        status: "success",
        startedAt: startedAt + 1400,
        endedAt,
        summary:
          "Fixture summary: implicit-system project is ready for browser smoke testing.",
        details: [
          {
            label: "Output summary",
            value:
              "Open the fixture project, then check the middle derivation, right-side assets, Agent tab, and inline Agent trace.",
          },
          { label: "Result phase", value: "analysis" },
          { label: "Next action", value: "browser_smoke" },
        ],
      },
    ],
  };

  return {
    ...project,
    researchSession: {
      ...project.researchSession,
      agentRuns: [...(project.researchSession.agentRuns ?? []), agentRun],
    },
  };
}
