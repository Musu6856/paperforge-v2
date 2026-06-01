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
  assert.equal(view.run?.durationLabel, "3.6s");
  assert.equal(view.run?.statusTone, "success");
  assert.deepEqual(
    view.run?.steps.map((step) => ({
      id: step.id,
      durationLabel: step.durationLabel,
      statusLabel: step.statusLabel,
      statusTone: step.statusTone,
    })),
    [
      {
        id: "plan_research_action",
        durationLabel: "0.1s",
        statusLabel: "Completed",
        statusTone: "success",
      },
      {
        id: "run_research_generation",
        durationLabel: "3.3s",
        statusLabel: "Completed",
        statusTone: "success",
      },
    ]
  );
});

test("agent run view model exposes a clear empty state", () => {
  const view = createAgentRunViewModel({ agentRuns: [] }, 1000);

  assert.equal(view.hasRun, false);
  assert.equal(view.emptyTitle, "No Agent run yet");
  assert.equal(view.emptyDescription, "Start a research generation to create a Mastra workflow trace.");
});
