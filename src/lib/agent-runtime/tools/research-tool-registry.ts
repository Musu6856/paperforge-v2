import type { ResearchAgentAction } from "../agents/research-agent.ts";

export type ResearchAgentToolDefinition = {
  name: string;
  action: ResearchAgentAction;
  label: string;
  purpose: string;
};

export const RESEARCH_AGENT_TOOLS: ResearchAgentToolDefinition[] = [
  {
    name: "discover_directions",
    action: "discover_directions",
    label: "发现研究方向",
    purpose: "从原始想法中整理可建模、可符号求解的研究方向。",
  },
  {
    name: "build_model",
    action: "build_model",
    label: "构建模型草稿",
    purpose: "把选定方向整理成可检查的 Hotelling/双边平台模型资产。",
  },
  {
    name: "solve_equilibrium",
    action: "solve_equilibrium",
    label: "求解符号均衡",
    purpose: "基于当前模型生成闭式解、反应函数系统或隐式系统。",
  },
  {
    name: "analyze_properties",
    action: "analyze_properties",
    label: "生成性质分析",
    purpose: "基于当前均衡生成比较静态、命题和证明草稿。",
  },
  {
    name: "continue_conversation",
    action: "continue_conversation",
    label: "继续研究对话",
    purpose: "回答用户问题，或生成待审核的结构化资产修改建议。",
  },
];

export function getResearchAgentToolForAction(action: ResearchAgentAction) {
  return RESEARCH_AGENT_TOOLS.find((tool) => tool.action === action);
}
