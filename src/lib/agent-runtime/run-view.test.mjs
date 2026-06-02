import test from "node:test";
import assert from "node:assert/strict";

import { createAgentRunViewModel } from "./run-view.ts";

test("agent run view model summarizes the latest Mastra workflow run", () => {
  const view = createAgentRunViewModel(
    {
      agentRuns: [
        {
          id: "agent-run-old",
          framework: "mastra",
          workflowId: "paperforge-research-workflow",
          action: "discover_directions",
          status: "success",
          startedAt: 1000,
          endedAt: 1200,
          steps: [],
        },
        {
          id: "agent-run-new",
          framework: "mastra",
          workflowId: "paperforge-research-workflow",
          action: "build_model",
          status: "success",
          startedAt: 2000,
          endedAt: 5600,
          steps: [
            {
              id: "plan_research_action",
              label: "Plan research action",
              status: "success",
              summary: "Recognized build_model.",
              details: [
                {
                  label: "计划",
                  value: "确认模型设定并生成结构化模型资产。",
                },
              ],
              startedAt: 2000,
              endedAt: 2100,
            },
            {
              id: "run_research_generation",
              label: "Run generation",
              status: "success",
              summary: "Generated a model patch.",
              startedAt: 2100,
              endedAt: 5400,
            },
          ],
        },
      ],
    },
    6000
  );

  assert.equal(view.hasRun, true);
  assert.equal(view.run?.id, "agent-run-new");
  assert.equal(view.run?.frameworkLabel, "Mastra");
  assert.equal(view.run?.actionLabel, "build_model");
  assert.equal(view.run?.summaryLabel, "Mastra · Completed · build_model");
  assert.equal(view.run?.durationLabel, "3.6s");
  assert.equal(view.run?.statusTone, "success");
  assert.deepEqual(view.run?.metadata, [
    { label: "Workflow", value: "paperforge-research-workflow" },
    { label: "Action", value: "build_model" },
    { label: "Duration", value: "3.6s" },
  ]);
  assert.deepEqual(
    view.run?.steps.map((step) => ({
      id: step.id,
      durationLabel: step.durationLabel,
      statusLabel: step.statusLabel,
      statusTone: step.statusTone,
      defaultExpanded: step.defaultExpanded,
      details: step.details,
    })),
    [
      {
        id: "plan_research_action",
        durationLabel: "0.1s",
        statusLabel: "Completed",
        statusTone: "success",
        defaultExpanded: false,
        details: [
          {
            label: "计划",
            value: "确认模型设定并生成结构化模型资产。",
          },
        ],
      },
      {
        id: "run_research_generation",
        durationLabel: "3.3s",
        statusLabel: "Completed",
        statusTone: "success",
        defaultExpanded: false,
        details: [],
      },
    ]
  );
});

test("agent run view model expands failed steps by default", () => {
  const view = createAgentRunViewModel(
    {
      agentRuns: [
        {
          id: "agent-run-failed",
          framework: "mastra",
          workflowId: "paperforge-research-workflow",
          action: "solve_equilibrium",
          status: "failed",
          startedAt: 1000,
          endedAt: 21000,
          error: "Provider timed out.",
          steps: [
            {
              id: "run_research_generation",
              label: "Run generation",
              status: "failed",
              summary: "Provider timed out.",
              startedAt: 1000,
              endedAt: 21000,
            },
          ],
        },
      ],
    },
    22000
  );

  assert.equal(view.hasRun, true);
  assert.equal(view.run?.summaryLabel, "Mastra · Failed · solve_equilibrium");
  assert.equal(view.run?.statusTone, "warning");
  assert.equal(view.run?.durationLabel, "20s");
  assert.equal(view.run?.steps[0]?.defaultExpanded, true);
});

test("agent run view model exposes a clear empty state", () => {
  const view = createAgentRunViewModel({ agentRuns: [] }, 1000);

  assert.equal(view.hasRun, false);
  assert.equal(view.emptyTitle, "No Agent run yet");
  assert.equal(view.emptyDescription, "Start a research generation to create a Mastra workflow trace.");
});
