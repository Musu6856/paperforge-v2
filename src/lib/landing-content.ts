export type LandingNavLink = {
  label: string;
  href: string;
};

export type DocsPageSection = {
  title: string;
  description: string;
  points: string[];
};

export type DocsPage = {
  slug: "features" | "model-safety";
  eyebrow: string;
  title: string;
  description: string;
  sections: DocsPageSection[];
};

export const landingNavLinks: LandingNavLink[] = [
  { label: "功能", href: "/docs/features" },
  { label: "模型与安全", href: "/docs/model-safety" },
  { label: "文档", href: "/docs" },
];

export const docsHomeCards = [
  {
    title: "功能说明",
    href: "/docs/features",
    description:
      "了解 PaperForge 如何把选题聚焦、模型设定、均衡推导和论文导出组织成连续工作流。",
  },
  {
    title: "模型与安全",
    href: "/docs/model-safety",
    description:
      "查看默认模型、自带模型 Key、连通检测和研究资产保存边界。",
  },
  {
    title: "案例 walkthrough",
    href: "/cases",
    description:
      "用一个双边平台问题走完整条链路，看它如何从模糊想法进入可求解模型。",
  },
];

export const docsPages: Record<DocsPage["slug"], DocsPage> = {
  features: {
    slug: "features",
    eyebrow: "Features",
    title: "功能：把理论建模拆成可推进的研究流程",
    description:
      "PaperForge 的重点不是替你写一段泛泛回答，而是把研究想法逐步沉淀成可检查、可修改、可导出的结构化资产。",
    sections: [
      {
        title: "方向聚焦",
        description:
          "当选题还比较模糊时，系统会先生成多个可比较的研究方向，并标出更适合符号求解的默认建议。",
        points: [
          "把一句研究想法拆成候选机制、对象、市场结构和建模框架。",
          "优先推荐适合 Hotelling、双边市场或平台竞争框架的方向。",
          "方向被采纳后会进入工作台右侧资产栏，而不是散落在聊天记录里。",
        ],
      },
      {
        title: "模型设定与符号资产",
        description:
          "模型变量、参数、效用函数、利润函数和假设会进入结构化编辑区，便于手动修正和一键应用 AI 建议。",
        points: [
          "变量按决策变量、参数、需求变量、派生变量等类型管理。",
          "模型修改后会提示重新计算，避免旧结果和新模型混用。",
          "聊天中产生的可应用建议会沉淀到右侧资产栏进行确认。",
        ],
      },
      {
        title: "均衡、性质与导出",
        description:
          "确认模型后再进入符号均衡推导和性质分析，最后整理成 Markdown 论文草稿。",
        points: [
          "均衡页展示求解状态、一阶条件、闭式解、存在条件和注意事项。",
          "性质分析以命题、直觉解释和适用条件为核心，避免只给空泛结论。",
          "论文输出支持 Markdown 导出，后续可以继续写作和排版。",
        ],
      },
    ],
  },
  "model-safety": {
    slug: "model-safety",
    eyebrow: "Model & Safety",
    title: "模型与安全：默认模型托管，也支持自带模型 Key",
    description:
      "当前版本优先保证主流程可用，同时把模型来源、浏览器 Key 和研究资产的边界讲清楚。",
    sections: [
      {
        title: "模型来源",
        description:
          "默认情况下可以直接使用 PaperForge 配好的模型；需要更强模型或自己的额度时，也可以配置 OpenAI-compatible 接口。",
        points: [
          "默认模型适合快速体验完整流程，不需要先填写 API Key。",
          "自带模型支持 OpenAI 与兼容接口，例如 DeepSeek、Qwen 等。",
          "配置完成后可以在工作台设置里做连通检测，确认实际模型与 Base URL。",
        ],
      },
      {
        title: "安全边界",
        description:
          "用户在浏览器输入的 API Key 只用于当前请求；服务端只保存脱敏后的模型来源信息。",
        points: [
          "API Key 存在当前浏览器本地，不写入研究资产。",
          "研究项目只记录模型来源摘要，便于复盘而不暴露密钥。",
          "导出的 Markdown 只包含研究内容，不包含模型凭据。",
        ],
      },
      {
        title: "质量边界",
        description:
          "PaperForge 会尽量过滤不可用草稿，但理论建模仍需要研究者检查模型假设、均衡条件和命题解释。",
        points: [
          "当符号求解失败时，会保留失败原因和可修复建议。",
          "本地兜底只用于流程不中断，不把明显薄弱结果包装成正式结论。",
          "研究者仍需要判断模型是否符合论文问题和经济学直觉。",
        ],
      },
    ],
  },
};

export const caseStudyPage = {
  eyebrow: "Case Study",
  title: "案例：二手平台佣金与补贴机制",
  description:
    "这个案例展示 PaperForge 如何从一句平台经济问题出发，逐步聚焦方向、确认模型、生成均衡，并整理成可导出的论文草稿。",
  input:
    "我想研究二手交易平台的佣金与补贴策略，平台应该对谁收费？",
  steps: [
    {
      title: "1. 方向聚焦",
      description:
        "系统将问题收窄为双边 Hotelling 平台竞争模型，同时保留买方补贴与卖方佣金两个核心政策工具。",
    },
    {
      title: "2. 模型确认",
      description:
        "研究者检查买卖双方效用、平台利润、交叉网络外部性和运输成本等符号设定，再确认进入求解。",
    },
    {
      title: "3. 符号均衡",
      description:
        "工作台展示一阶条件、闭式解、存在条件和求解注意事项，方便判断模型是否可用于论文主结果。",
    },
    {
      title: "4. 性质分析与导出",
      description:
        "在均衡结果基础上生成比较静态命题、经济学直觉和适用条件，并导出 Markdown 草稿继续写作。",
    },
  ],
};
