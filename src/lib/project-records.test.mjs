import test from "node:test";
import assert from "node:assert/strict";
import { projectFromRow, sanitizeProjectPayload } from "./project-records.ts";

const baseProject = {
  id: "11111111-1111-4111-8111-111111111111",
  createdAt: 1710000000000,
  rawIdea: "研究二手交易平台佣金与补贴策略",
  refinedIdea: "研究二手交易平台佣金与补贴策略",
  model: null,
  wizardCompleted: true,
  sections: [],
  references: [],
};

test("sanitizeProjectPayload rejects non-UUID project ids before database writes", () => {
  const project = sanitizeProjectPayload({
    ...baseProject,
    id: "research-not-a-uuid",
  });

  assert.equal(project, null);
});

test("sanitizeProjectPayload strips raw browser API keys from model source metadata", () => {
  const project = sanitizeProjectPayload({
    ...baseProject,
    projectType: "exploration",
    modelSource: {
      source: "own",
      provider: "openai-compatible",
      baseUrl: " https://api.deepseek.com/v1/ ",
      model: " deepseek-chat ",
      apiKey: "sk-should-never-be-saved",
      hasBrowserApiKey: true,
    },
  });

  assert.deepEqual(project?.modelSource, {
    source: "own",
    provider: "openai-compatible",
    baseUrl: "https://api.deepseek.com/v1",
    model: "deepseek-chat",
    hasBrowserApiKey: true,
  });
  assert.equal("apiKey" in project.modelSource, false);
});

test("sanitizeProjectPayload rejects oversized nested project payloads", () => {
  const project = sanitizeProjectPayload({
    ...baseProject,
    researchSession: {
      phase: "direction",
      directions: [],
      messages: [
        {
          id: "msg-huge",
          role: "user",
          content: "x".repeat(1_100_000),
          createdAt: 0,
        },
      ],
      assetSummary: {
        confirmedAssumptions: [],
        utilityFunctions: [],
        equilibriumStatus: "not_started",
        nextActions: [],
      },
    },
  });

  assert.equal(project, null);
});

test("sanitizeProjectPayload preserves Agent run traces for project persistence", () => {
  const project = sanitizeProjectPayload({
    ...baseProject,
    researchSession: createSessionWithAgentRun(),
  });

  const run = project?.researchSession?.agentRuns?.at(-1);

  assert.equal(run?.framework, "mastra");
  assert.equal(run?.workflowId, "paperforge-research-workflow");
  assert.equal(run?.action, "solve_equilibrium");
  assert.equal(run?.steps[0]?.id, "plan_research_action");
  assert.equal(run?.steps[0]?.details?.[0]?.value, "production persistence");
});

function createSessionWithAgentRun() {
  return {
    phase: "equilibrium",
    directions: [],
    messages: [],
    assetSummary: {
      confirmedAssumptions: [],
      utilityFunctions: [],
      equilibriumStatus: "solved",
      nextActions: [],
    },
    agentRuns: [
      {
        id: "agent-run-production-persistence",
        framework: "mastra",
        workflowId: "paperforge-research-workflow",
        action: "solve_equilibrium",
        status: "success",
        startedAt: 1710000000000,
        endedAt: 1710000002500,
        steps: [
          {
            id: "plan_research_action",
            label: "Plan research action",
            status: "success",
            summary: "Plan persisted production run.",
            details: [
              {
                label: "Persistence target",
                value: "production persistence",
              },
            ],
          },
        ],
      },
    ],
  };
}

test("projectFromRow sanitizes legacy model source metadata", () => {
  const project = projectFromRow({
    id: baseProject.id,
    ownerId: "user-dev",
    createdAt: new Date(baseProject.createdAt),
    updatedAt: new Date(baseProject.createdAt),
    rawIdea: baseProject.rawIdea,
    refinedIdea: baseProject.refinedIdea,
    projectType: "formal",
    model: null,
    researchSession: null,
    modelSource: {
      source: "own",
      provider: "openai-compatible",
      baseUrl: " https://api.deepseek.com/v1/ ",
      model: " deepseek-chat ",
      apiKey: "sk-legacy-secret",
      hasBrowserApiKey: true,
    },
    wizardCompleted: true,
    sections: [],
    references: [],
    background: null,
    literatureAnalyses: [],
    hotellingModel: null,
    equilibriumResult: null,
    propertyAnalyses: [],
  });

  assert.deepEqual(project.modelSource, {
    source: "own",
    provider: "openai-compatible",
    baseUrl: "https://api.deepseek.com/v1",
    model: "deepseek-chat",
    hasBrowserApiKey: true,
  });
  assert.equal("apiKey" in project.modelSource, false);
});

test("projectFromRow restores Agent run traces from research_session JSONB", () => {
  const project = projectFromRow({
    id: baseProject.id,
    ownerId: "user-dev",
    createdAt: new Date(baseProject.createdAt),
    updatedAt: new Date(baseProject.createdAt),
    rawIdea: baseProject.rawIdea,
    refinedIdea: baseProject.refinedIdea,
    projectType: "formal",
    model: null,
    researchSession: createSessionWithAgentRun(),
    modelSource: null,
    wizardCompleted: true,
    sections: [],
    references: [],
    background: null,
    literatureAnalyses: [],
    hotellingModel: null,
    equilibriumResult: null,
    propertyAnalyses: [],
  });

  const run = project.researchSession?.agentRuns?.at(-1);

  assert.equal(run?.framework, "mastra");
  assert.equal(run?.workflowId, "paperforge-research-workflow");
  assert.equal(run?.action, "solve_equilibrium");
  assert.equal(run?.steps[0]?.summary, "Plan persisted production run.");
});

test("projectFromRow normalizes legacy string symbols in hotelling models", () => {
  const project = projectFromRow({
    id: baseProject.id,
    ownerId: "user-dev",
    createdAt: new Date(baseProject.createdAt),
    updatedAt: new Date(baseProject.createdAt),
    rawIdea: baseProject.rawIdea,
    refinedIdea: baseProject.refinedIdea,
    projectType: "formal",
    model: null,
    researchSession: null,
    modelSource: null,
    wizardCompleted: true,
    sections: [],
    references: [],
    background: null,
    literatureAnalyses: [],
    hotellingModel: {
      symbols: ["x: 消费者在[0,1]线段上的位置"],
      sides: {
        consumerSideName: "消费者",
        merchantSideName: "商家",
      },
      platforms: ["A", "B"],
      timing: [],
      utilityFunctions: [],
      demandDerivation: "",
      profitFunctions: [],
      assumptions: [],
      modelSetupDraft: "",
    },
    equilibriumResult: null,
    propertyAnalyses: [],
  });

  assert.equal(project.hotellingModel?.symbols[0].symbol, "x");
  assert.equal(project.hotellingModel?.symbols[0].meaning, "消费者在[0,1]线段上的位置");
});
