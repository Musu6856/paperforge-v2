import type { ResearchAgentAction } from "../agents/research-agent.ts";
import type { ResearchMemorySnapshot } from "../memory/research-memory.ts";

export type ResearchGuardSnapshot = {
  canRunRequestedAction: boolean;
  reason: string;
};

export function evaluateResearchActionGuards(
  action: ResearchAgentAction,
  memory: ResearchMemorySnapshot
): ResearchGuardSnapshot {
  if (action === "solve_equilibrium" && !memory.hasModel) {
    return {
      canRunRequestedAction: false,
      reason: "需要先有模型资产，才能进入符号均衡求解。",
    };
  }

  if (action === "analyze_properties" && !memory.hasEquilibrium) {
    return {
      canRunRequestedAction: false,
      reason: "需要先有均衡对象，才能生成性质分析。",
    };
  }

  return {
    canRunRequestedAction: true,
    reason: "当前上下文允许执行请求的研究动作。",
  };
}
