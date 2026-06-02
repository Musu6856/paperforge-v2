import type { ResearchGenerationAction } from "../../research-generation/types.ts";
import type { ResearchWorkflowSummary } from "../schemas/research-agent-schemas.ts";
import { getResearchAgentToolForAction } from "../tools/research-tool-registry.ts";

export type ResearchAgentDecision =
  | {
      kind: "suggest_next_tool";
      reason: string;
      nextAction: ResearchGenerationAction;
      nextTool: string;
    }
  | {
      kind: "ask_user" | "stop";
      reason: string;
      nextAction?: never;
      nextTool?: never;
    };

export function decideNextResearchAgentAction(
  summary: ResearchWorkflowSummary
): ResearchAgentDecision {
  const { plan, response } = summary;
  const project = response.project;
  const pendingKind = project.researchSession?.assetSummary.pendingDecision?.kind;

  if (!plan.guard.canRunRequestedAction) {
    return {
      kind: "ask_user",
      reason: plan.guard.reason,
    };
  }

  if (response.assetPatch) {
    return {
      kind: "stop",
      reason: "已生成待审核的资产修改建议，等待用户确认后再继续。",
    };
  }

  if (pendingKind) {
    return {
      kind: "ask_user",
      reason: `当前需要用户处理 ${pendingKind} 决策后再继续。`,
    };
  }

  if (plan.action === "discover_directions") {
    return suggestNextTool(
      "build_model",
      "已发现研究方向，下一步可以选择方向并构建模型。"
    );
  }

  if (plan.action === "build_model" && project.hotellingModel) {
    return suggestNextTool(
      "solve_equilibrium",
      "模型资产已经生成，下一步可以进入符号均衡求解。"
    );
  }

  if (
    plan.action === "solve_equilibrium" &&
    (project.equilibriumResult?.status === "solved" ||
      project.equilibriumResult?.status === "reaction_function" ||
      project.equilibriumResult?.status === "implicit_system")
  ) {
    return suggestNextTool(
      "analyze_properties",
      "已有可用的符号均衡对象，下一步可以生成性质分析。"
    );
  }

  if (plan.action === "analyze_properties") {
    return {
      kind: "stop",
      reason: "性质分析已经生成，本轮研究动作完成。",
    };
  }

  return {
    kind: "stop",
    reason: "本轮研究动作已经完成，等待用户继续输入。",
  };
}

function suggestNextTool(
  nextAction: ResearchGenerationAction,
  reason: string
): ResearchAgentDecision {
  return {
    kind: "suggest_next_tool",
    reason,
    nextAction,
    nextTool: getResearchAgentToolForAction(nextAction)?.name ?? nextAction,
  };
}
