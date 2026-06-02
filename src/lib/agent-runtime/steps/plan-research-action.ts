import { createStep } from "@mastra/core/workflows";

import { getActionLabel } from "../traces/research-trace.ts";
import type { ResearchGenerationRequest } from "../../research-generation/types.ts";
import {
  workflowInputSchema,
  workflowPlanSchema,
} from "./research-step-schemas.ts";

export function createPlanResearchActionStep() {
  return createStep({
    id: "plan_research_action",
    description: "Classify the PaperForge research action before generation.",
    inputSchema: workflowInputSchema,
    outputSchema: workflowPlanSchema,
    execute: async ({ inputData }) => ({
      action: inputData.action,
      label: getActionLabel(inputData.action),
      actionPlan: createActionPlan(inputData.action),
      rawIdea: inputData.rawIdea,
      request: inputData,
    }),
  });
}

function createActionPlan(action: ResearchGenerationRequest["action"]) {
  switch (action) {
    case "discover_directions":
      return {
        objective: "从原始研究想法中整理可建模、可符号求解的研究方向。",
        expectedOutput: "4 个中文理论建模方向，以及推荐优先推进的方向。",
        executionMode: "本地 workflow 规划，然后调用结构化研究生成器。",
      };
    case "build_model":
      return {
        objective: "把选定方向收敛成可检查的 Hotelling/双边平台模型资产。",
        expectedOutput: "符号表、参与边、平台、时序、效用函数、利润函数和假设。",
        executionMode: "本地 workflow 规划，然后调用模型生成或本地 fallback。",
      };
    case "solve_equilibrium":
      return {
        objective: "基于当前模型生成符号均衡对象，避免把不适用模型硬套成闭式解。",
        expectedOutput: "闭式解、反应函数系统、隐式系统，或明确的符号失败说明。",
        executionMode: "优先调用结构化生成器，必要时使用本地确定性符号求解器。",
      };
    case "analyze_properties":
      return {
        objective: "基于当前符号均衡对象生成比较静态、命题和证明草稿。",
        expectedOutput: "3 到 5 条符号性质分析，包含符号结果、条件、命题和直觉。",
        executionMode: "优先调用结构化生成器，必要时使用本地符号性质 fallback。",
      };
    case "continue_conversation":
      return {
        objective: "延续当前研究上下文，回答问题或生成待审核的资产修改建议。",
        expectedOutput: "中文研究回复，或模型/均衡/性质资产的 pending patch。",
        executionMode: "读取最近对话和当前资产，再调用对话生成器或本地 patch fallback。",
      };
    default:
      return {
        objective: "识别研究动作并路由到对应的 PaperForge 研究生成流程。",
        expectedOutput: "与当前动作匹配的结构化研究资产或中文回复。",
        executionMode: "本地 workflow 规划，然后调用结构化研究生成器。",
      };
  }
}
