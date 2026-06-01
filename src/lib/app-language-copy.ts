import type { AppLanguage } from "./app-language";

export const appCopy = {
  zh: {
    shell: {
      expandLeftPane: "展开左侧栏",
      collapseLeftPane: "收起左侧栏",
      resizeLeftPane: "调整左侧栏宽度",
      resizeRightPane: "调整右侧研究资产栏宽度",
    },
    modelSource: {
      paperforgeTitle: "使用 PaperForge 提供的模型",
      paperforgeHint: "适合先试用完整流程。第一版不接入真实收费。",
      ownTitle: "使用自己的模型",
      ownHint: "API key 只保存在当前浏览器，服务端只保存脱敏配置。",
      providerFormat: "服务商格式",
      openaiHint: "使用 OpenAI 官方接口格式",
      compatibleHint: "DeepSeek、Qwen 等常见兼容接口",
      modelName: "模型名称",
      modelPlaceholder: "例如 gpt-5.2、claude-sonnet-4-5、deepseek-chat",
      baseUrlPlaceholder: "例如 https://api.deepseek.com/v1",
      apiKeyPlaceholder: "只保存在当前浏览器",
    },
    sidebar: {
      settingsEyebrow: "Settings",
      workspaceSettings: "工作台设置",
      language: "语言",
      modelSettings: "模型设置",
      checkConnection: "检测连通",
      cancel: "取消",
      save: "保存",
      closeSettings: "关闭设置",
      settingsButton: "设置",
      formalProjects: "正式项目",
      explorations: "探索记录",
      newConversation: "新对话",
      noRecords: "暂无记录",
      viewRecord: "查看记录",
      view: "查看",
      deleteRecord: "删除记录",
      delete: "删除",
      languageUpdated: "界面语言已更新",
      languageUpdatedDescription: "研究内容不会被自动翻译，避免影响已有资产。",
      currentFormWillUse: "当前表单将使用",
      modelSaved: "模型设置已更新",
      modelSavedDescription: "这不会创建新研究，也不会清空当前对话。",
      modelConfigError: "请补全模型来源配置",
      deleteSuccess: "记录已删除",
      deleteFailed: "删除失败",
      deleteConfirmPrefix: "删除",
      deleteConfirmSuffix: "？此操作不会影响其它记录。",
      providerCheckFailed: "连通检测失败",
      providerCheckFailedDescription: "请稍后重试，或检查本地服务是否正常。",
      defaultModelPending: "默认模型：待检测",
      defaultModelPendingDetail:
        "打开设置并点击检测连通，可查看服务端实际模型和 Base URL。",
      ownModelLabel: "自有模型",
      defaultModelLabel: "默认模型",
      ownModelConnected: "自有模型连通正常",
      defaultModelConnected: "默认模型连通正常",
      ownModelUnavailable: "自有模型不可用",
      defaultModelUnavailable: "默认模型不可用",
      providerNetworkErrorMessage: "连通检测接口请求失败。",
      checkingProviderPrefix: "正在检测",
      checkingProviderSuffix: "连通性",
      checkingProviderDetail:
        "会发送一条很小的 ping 请求，不会产生研究内容。",
      providerAvailableSuffix: "可用",
      providerUnavailableSuffix: "不可用",
      providerUncheckedPrefix: "尚未检测",
      ownProviderUncheckedDetail:
        "这里会检测当前表单里的模型配置，API key 只用于本次检测。",
      defaultProviderUncheckedDetail: "这里检测的是服务端默认模型配置。",
      modelConfigFallbackError: "当前配置无法用于生成研究。",
    },
    chat: {
      userLabel: "You",
      assistantLabel: "PaperForge",
      sendMessage: "Send message",
      newTitle: "新的研究对话",
      newSubtitle: "输入研究想法，PaperForge 会先发现可建模方向",
      existingSubtitle: "中间只保留对话，结构化研究资产在右侧检查和编辑",
      newPlaceholder:
        "输入新的研究想法，例如：二手平台佣金与补贴如何影响买卖双方参与...",
      modelPlaceholder:
        "可以直接问模型设定，也可以说：把模型假设改成... 但先让我确认",
      defaultPlaceholder:
        "可以问结果，也可以说：重新求均衡 / 重做性质分析 / 整理成命题",
      emptyExistingTitle: "开启新的探索对话",
      emptyFreshTitle: "从一句研究想法开始",
      emptyExistingDescription:
        "输入一个新的研究想法后，PaperForge 会把它保存成新的探索记录，再从方向发现开始。",
      emptyFreshDescription:
        "直接在底部输入研究想法，PaperForge 会依次推进方向发现、模型确认、符号均衡和性质分析。",
    },
    emptyAssets: {
      eyebrow: "研究资产",
      title: "工作台总览",
      description: "开启研究对话后，方向、模型、均衡和性质分析会显示在这里。",
    },
    assets: {
      headerFallbackTitle: "工作台总览",
      headerDescription: "右侧内容是当前研究的结构化版本，可以检查、采用和编辑。",
      exportMarkdown: "导出 Markdown",
      collapsePane: "收起右侧研究资产",
      expandPane: "展开右侧研究资产",
      phaseDirection: "方向发现",
      phaseModel: "模型确认",
      phaseEquilibrium: "均衡推导",
      phaseAnalysis: "性质分析",
      phaseAriaLabel: "研究阶段",
      tabAriaLabel: "研究资产",
      tabDirections: "方向",
      tabModel: "模型",
      tabEquilibrium: "均衡",
      tabProperties: "性质",
      tabPaper: "论文输出",
      tabQuality: "质检",
      candidateDirections: "候选方向",
      candidateDirectionsDescription:
        "所有方向都可以直接采用，推荐标记只表示默认建议。",
      exportGuideTitle: "导出说明",
      exportGuideDescription:
        "Markdown 导出会把当前研究方向、模型、均衡和性质分析整理成一份完整正文。",
      paperPreview: "论文预览",
      emptyPaper:
        "论文输出暂未生成。先把方向、模型、均衡和性质分析稳定下来，再整理成命题与正文。",
    },
  },
  en: {
    shell: {
      expandLeftPane: "Expand left sidebar",
      collapseLeftPane: "Collapse left sidebar",
      resizeLeftPane: "Resize left sidebar",
      resizeRightPane: "Resize research assets pane",
    },
    modelSource: {
      paperforgeTitle: "Use PaperForge model",
      paperforgeHint: "Best for trying the full workflow first. No real billing in this version.",
      ownTitle: "Use your own model",
      ownHint: "API key is stored only in this browser. The server stores only masked settings.",
      providerFormat: "Provider format",
      openaiHint: "Use the official OpenAI API format",
      compatibleHint: "Common compatible APIs such as DeepSeek and Qwen",
      modelName: "Model name",
      modelPlaceholder: "e.g. gpt-5.2, claude-sonnet-4-5, deepseek-chat",
      baseUrlPlaceholder: "e.g. https://api.deepseek.com/v1",
      apiKeyPlaceholder: "Stored only in this browser",
    },
    sidebar: {
      settingsEyebrow: "Settings",
      workspaceSettings: "Workspace Settings",
      language: "Language",
      modelSettings: "Model Settings",
      checkConnection: "Check",
      cancel: "Cancel",
      save: "Save",
      closeSettings: "Close settings",
      settingsButton: "Settings",
      formalProjects: "Projects",
      explorations: "Explorations",
      newConversation: "New Chat",
      noRecords: "No records",
      viewRecord: "Open record",
      view: "Open",
      deleteRecord: "Delete record",
      delete: "Delete",
      languageUpdated: "Interface language updated",
      languageUpdatedDescription:
        "Generated research content stays in its original language.",
      currentFormWillUse: "Current form will use",
      modelSaved: "Model settings updated",
      modelSavedDescription:
        "This will not create a new research project or clear the conversation.",
      modelConfigError: "Complete the model source settings",
      deleteSuccess: "Record deleted",
      deleteFailed: "Delete failed",
      deleteConfirmPrefix: "Delete",
      deleteConfirmSuffix: "? This will not affect other records.",
      providerCheckFailed: "Connection check failed",
      providerCheckFailedDescription:
        "Try again later, or check whether the local service is running.",
      defaultModelPending: "Default model: not checked",
      defaultModelPendingDetail:
        "Open settings and run a connection check to see the active model and Base URL.",
      ownModelLabel: "Own model",
      defaultModelLabel: "Default model",
      ownModelConnected: "Own model connected",
      defaultModelConnected: "Default model connected",
      ownModelUnavailable: "Own model unavailable",
      defaultModelUnavailable: "Default model unavailable",
      providerNetworkErrorMessage: "Connection check request failed.",
      checkingProviderPrefix: "Checking ",
      checkingProviderSuffix: " connection",
      checkingProviderDetail:
        "This sends a tiny ping request and does not generate research content.",
      providerAvailableSuffix: " available",
      providerUnavailableSuffix: " unavailable",
      providerUncheckedPrefix: "Not checked: ",
      ownProviderUncheckedDetail:
        "This checks the model settings in the current form. The API key is only used for this check.",
      defaultProviderUncheckedDetail:
        "This checks the server-side default model configuration.",
      modelConfigFallbackError:
        "The current settings cannot be used to generate research.",
    },
    chat: {
      userLabel: "You",
      assistantLabel: "PaperForge",
      sendMessage: "Send message",
      newTitle: "New research chat",
      newSubtitle:
        "Enter a research idea and PaperForge will first discover modelable directions",
      existingSubtitle:
        "The center keeps the conversation; structured research assets live on the right",
      newPlaceholder:
        "Enter a new research idea, e.g. how second-hand platform commissions affect both sides...",
      modelPlaceholder:
        "Ask about the model setup, or say: change the assumptions to... but ask me before applying",
      defaultPlaceholder:
        "Ask about results, or say: re-solve equilibrium / redo properties / organize as propositions",
      emptyExistingTitle: "Start a new exploration chat",
      emptyFreshTitle: "Start from one research idea",
      emptyExistingDescription:
        "After you enter a new idea, PaperForge saves it as a new exploration and starts from direction discovery.",
      emptyFreshDescription:
        "Enter a research idea at the bottom. PaperForge will move through direction discovery, model confirmation, symbolic equilibrium, and property analysis.",
    },
    emptyAssets: {
      eyebrow: "Research Assets",
      title: "Workspace Overview",
      description:
        "Directions, models, equilibrium results, and property analyses will appear here after you start a research chat.",
    },
    assets: {
      headerFallbackTitle: "Workspace Overview",
      headerDescription:
        "The right pane is the structured version of the current research. Review, adopt, and edit it here.",
      exportMarkdown: "Export Markdown",
      collapsePane: "Collapse research assets",
      expandPane: "Expand research assets",
      phaseDirection: "Direction Discovery",
      phaseModel: "Model Confirmation",
      phaseEquilibrium: "Equilibrium Derivation",
      phaseAnalysis: "Property Analysis",
      phaseAriaLabel: "Research phase",
      tabAriaLabel: "Research assets",
      tabDirections: "Directions",
      tabModel: "Model",
      tabEquilibrium: "Equilibrium",
      tabProperties: "Properties",
      tabPaper: "Paper",
      tabQuality: "Quality",
      candidateDirections: "Candidate Directions",
      candidateDirectionsDescription:
        "All directions can be adopted. The recommendation only marks the default suggestion.",
      exportGuideTitle: "Export Guide",
      exportGuideDescription:
        "Markdown export turns the current direction, model, equilibrium, and property analysis into a draft document.",
      paperPreview: "Paper Preview",
      emptyPaper:
        "No paper output yet. Stabilize the direction, model, equilibrium, and property analysis before turning them into propositions and prose.",
    },
  },
} satisfies Record<AppLanguage, Record<string, Record<string, string>>>;

export function getAppCopy(language: AppLanguage) {
  return appCopy[language];
}
