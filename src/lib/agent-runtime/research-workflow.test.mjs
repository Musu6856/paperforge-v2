import assert from "node:assert/strict";
import test from "node:test";

import { runResearchAgentWorkflow } from "./research-workflow.ts";

test("research workflow records a Mastra agent run around generation", async () => {
  const result = await runResearchAgentWorkflow({
    action: "discover_directions",
    rawIdea: "研究二手交易平台佣金和补贴",
  });

  assert.equal(result.agentRun.framework, "mastra");
  assert.equal(result.agentRun.workflowId, "paperforge-research-workflow");
  assert.equal(result.agentRun.status, "success");
  assert.deepEqual(
    result.agentRun.steps.map((step) => step.id),
    ["plan_research_action", "run_research_generation", "summarize_research_output"]
  );
  assert.match(
    result.agentRun.steps[0].summary ?? "",
    /计划动作|发现研究方向/
  );
  assert.deepEqual(
    result.agentRun.steps.map((step) => step.details?.length > 0),
    [true, true, true]
  );
  assert.match(
    result.agentRun.steps[1].details
      ?.map((detail) => `${detail.label}:${detail.value}`)
      .join("\n") ?? "",
    /调用来源|结果阶段/
  );
  assert.equal(
    result.project.researchSession?.agentRuns?.at(-1)?.id,
    result.agentRun.id
  );
});
