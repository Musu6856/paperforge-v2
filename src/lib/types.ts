export interface Player {
  name: string;
  description: string;
  objective: string;
}

export interface Strategy {
  player: string;
  options: string[];
}

export interface PayoffStructure {
  description: string;
  type: "matrix" | "function" | "general";
}

export interface PlatformContext {
  hasCrossNetworkEffects: boolean;
  sides: string[];
  pricingModel?: "subscription" | "transaction" | "freemium" | "ad-supported";
}

export interface GameTheoryModel {
  title: string;
  gameType:
    | "simultaneous"
    | "sequential"
    | "repeated"
    | "bargaining"
    | "signaling";
  players: Player[];
  strategies: Strategy[];
  payoffs: PayoffStructure;
  platformContext?: PlatformContext;
  keyAssumptions: string[];
}

export interface Reference {
  title: string;
  authors: string;
  year: number;
  relevance: string;
  category: "foundational" | "two-sided" | "methodology";
}

export interface PaperSection {
  id: string;
  title: string;
  content: string;
  status: "draft" | "generated" | "edited";
}

export interface BackgroundStory {
  scenario: string;
  puzzle: string;
  strategicInteraction: string;
  hotellingRationale: string;
  mechanismIntuition: string;
  contributionCandidates: string[];
  draft: string;
}

export interface LiteratureAnalysis {
  id: string;
  title: string;
  sourceText: string;
  researchQuestion: string;
  modelStructure: string;
  timing: string;
  utilityDesign: string;
  equilibriumMethod: string;
  borrowableIdeas: string[];
  differentiationPoints: string[];
}

export type SymbolRole =
  | "parameter"
  | "decision"
  | "demand"
  | "utility"
  | "cost"
  | "derived";

export type SymbolSide =
  | "platform"
  | "consumer"
  | "merchant"
  | "both"
  | "global";

export interface SymbolDefinition {
  id: string;
  symbol: string;
  baseSymbol: string;
  subscript?: string;
  superscript?: string;
  codeName: string;
  name: string;
  meaning: string;
  role: SymbolRole;
  side: SymbolSide;
  assumption: string;
  recommended: boolean;
}

export interface ModelStage {
  id: string;
  order: number;
  name: string;
  decisions: string[];
}

export interface UtilityFunction {
  id: string;
  side: "consumer" | "merchant";
  platform: string;
  expression: string;
  notes: string;
}

export interface ProfitFunction {
  id: string;
  platform: string;
  expression: string;
  notes: string;
}

export interface HotellingModel {
  symbols: SymbolDefinition[];
  sides: {
    consumerSideName: string;
    merchantSideName: string;
  };
  platforms: string[];
  timing: ModelStage[];
  utilityFunctions: UtilityFunction[];
  demandDerivation: string;
  profitFunctions: ProfitFunction[];
  assumptions: string[];
  modelSetupDraft: string;
}

export interface EquilibriumResult {
  status: "idle" | "solved" | "needs_revision" | "symbolic_failure";
  concept: string;
  solvingSteps: string[];
  focs: string[];
  conditions: string[];
  closedForm: string;
  derivation: string;
  code: string;
  warnings: string[];
}

export interface PropertyAnalysis {
  id: string;
  target: string;
  parameter: string;
  operation: "differentiate" | "compare" | "threshold" | "custom";
  symbolicResult: string;
  signCondition: string;
  propositionDraft: string;
  proofSketch: string;
  intuition: string;
  warnings: string[];
}

export type ModelSourceProvider =
  | "openai"
  | "openai-compatible";

export type ModelSourceSettings =
  | {
      source: "paperforge";
    }
  | {
      source: "own";
      provider: ModelSourceProvider;
      apiKey: string;
      model: string;
      baseUrl?: string;
    };

export type ModelSourceMetadata =
  | {
      source: "paperforge";
    }
  | {
      source: "own";
      provider: ModelSourceProvider;
      model: string;
      hasBrowserApiKey: boolean;
      baseUrl?: string;
    };

export type ResearchProjectType = "exploration" | "formal" | "legacy";

export interface ResearchDirection {
  id: string;
  title: string;
  summary: string;
  model: string;
  contribution: string;
  recommended: boolean;
}

export interface ResearchSessionMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
}

export type ResearchAssetKind = "model" | "equilibrium" | "properties";

export type ResearchAssetChangeKind = "replace" | "append" | "remove";

export type ResearchAssetPatchStatus = "proposed" | "applied" | "rejected";

export type ResearchAssetFreshness = "fresh" | "stale";

export interface ResearchAssetFreshnessMap {
  model: ResearchAssetFreshness;
  equilibrium: ResearchAssetFreshness;
  properties: ResearchAssetFreshness;
}

export interface ResearchAssetChange {
  kind: ResearchAssetChangeKind;
  path: string;
  value?: unknown;
  previousValue?: unknown;
  note?: string;
}

export interface ResearchAssetPatch {
  id: string;
  kind: ResearchAssetKind;
  summary: string;
  changes: ResearchAssetChange[];
  status: ResearchAssetPatchStatus;
  createdAt: number;
  sourceMessageId?: string;
  appliedAt?: number;
  rejectedAt?: number;
  rejectionReason?: string;
}

export interface ResearchAssetPatchInput {
  id?: string;
  kind: ResearchAssetKind;
  summary: string;
  changes: ResearchAssetChange[];
  createdAt?: number;
  sourceMessageId?: string;
}

export interface ResearchSessionDecision {
  kind:
    | "choose_direction"
    | "answer_model_question"
    | "solve_equilibrium"
    | "analyze_properties";
  prompt: string;
}

export type ResearchSessionEquilibriumStatus =
  | "not_started"
  | "等待模型确认"
  | "等待开始求解"
  | "待推导解析解"
  | EquilibriumResult["status"];

export interface ResearchSessionAssetSummary {
  currentDirection?: ResearchDirection;
  confirmedAssumptions: string[];
  pendingDecision?: ResearchSessionDecision;
  utilityFunctions: string[];
  equilibriumStatus: ResearchSessionEquilibriumStatus;
  nextActions: string[];
}

export interface ResearchSession {
  phase: "direction" | "model" | "equilibrium" | "analysis";
  directions: ResearchDirection[];
  messages: ResearchSessionMessage[];
  assetSummary: ResearchSessionAssetSummary;
  assetFreshness?: ResearchAssetFreshnessMap;
  assetPatches?: ResearchAssetPatch[];
}

export interface ResearchProject {
  id: string;
  createdAt: number;
  rawIdea: string;
  refinedIdea: string;
  projectType?: ResearchProjectType;
  model: GameTheoryModel | null;
  wizardCompleted: boolean;
  sections: PaperSection[];
  references: Reference[];
  modelSource?: ModelSourceMetadata;
  researchSession?: ResearchSession;
  background?: BackgroundStory;
  literatureAnalyses?: LiteratureAnalysis[];
  hotellingModel?: HotellingModel;
  equilibriumResult?: EquilibriumResult;
  propertyAnalyses?: PropertyAnalysis[];
}

export type WizardStep =
  | "players"
  | "strategies"
  | "payoffs"
  | "gameType"
  | "platform"
  | "review";
