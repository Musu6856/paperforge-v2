"use client";

import {
  AlertCircle,
  ChevronDown,
  CheckCircle2,
  CircleDot,
  Download,
  FileText,
  Loader2,
  PanelRightClose,
  PanelRightOpen,
  Sigma,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { DirectionCard } from "./direction-card";
import { EditableModelPanel } from "./editable-model-panel";
import { EditableSymbolRegistry } from "./editable-symbol-registry";
import { MathArtifact } from "./math-artifact";
import { PendingAssetPatches } from "./pending-asset-patches";
import { PhaseIndicator } from "./phase-indicator";
import { ResearchAssetsTabs } from "./research-assets-tabs";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import {
  createAgentRunViewModel,
  type AgentRunStepViewModel,
  type AgentRunViewModel,
} from "@/lib/agent-runtime/run-view";
import {
  buildResearchProjectMarkdown,
  getResearchProjectMarkdownFilename,
} from "@/lib/research-export";
import type { getAppCopy } from "@/lib/app-language-copy";
import {
  createResearchActionClickHandler,
  getResearchAssetsTabForPhase,
  getResearchFlowState,
  getResearchPrimaryAction,
  type ResearchAssetsTab,
  type ResearchPrimaryAction,
} from "@/lib/research-flow";
import type {
  ResearchAssetKind,
  ResearchProject,
  ResearchSession,
} from "@/lib/types";

type ResearchAssetsPanelProps = {
  project?: ResearchProject;
  session: ResearchSession;
  adoptingDirectionId?: string | null;
  isConfirmingModel?: boolean;
  isSolvingEquilibrium?: boolean;
  isAnalyzingProperties?: boolean;
  onAdopt?: (directionId: string) => void;
  onConfirmModel?: () => void;
  onSolveEquilibrium?: () => void;
  onAnalyzeProperties?: () => void;
  onSaveModelAssumptions?: (assumptions: string[]) => Promise<void> | void;
  onSaveModelSymbols?: (symbols: NonNullable<ResearchProject["hotellingModel"]>["symbols"]) => Promise<void> | void;
  onApplyAssetPatch?: (patchId: string) => void;
  onRejectAssetPatch?: (patchId: string) => void;
  isCollapsed?: boolean;
  onTogglePane?: () => void;
  copy: ReturnType<typeof getAppCopy>["assets"];
};

export function ResearchAssetsPanel(props: ResearchAssetsPanelProps) {
  const latestProposedPatch = props.session.assetPatches
    ?.filter((patch) => patch.status === "proposed")
    .at(-1);
  const initialActiveTab = latestProposedPatch
    ? getResearchAssetsTabForPatchKind(latestProposedPatch.kind)
    : getResearchAssetsTabForPhase(props.session.phase);
  const patchKey = latestProposedPatch
    ? `${latestProposedPatch.id}:${latestProposedPatch.kind}`
    : "none";

  return (
    <ResearchAssetsPanelContent
      key={`${props.project?.id ?? "new"}:${props.session.phase}:${props.session.assetSummary.equilibriumStatus}:${patchKey}`}
      {...props}
      initialActiveTab={initialActiveTab}
    />
  );
}

function ResearchAssetsPanelContent({
  initialActiveTab,
  project,
  session,
  adoptingDirectionId,
  isConfirmingModel,
  isSolvingEquilibrium,
  isAnalyzingProperties,
  onAdopt,
  onConfirmModel,
  onSolveEquilibrium,
  onAnalyzeProperties,
  onSaveModelAssumptions,
  onSaveModelSymbols,
  onApplyAssetPatch,
  onRejectAssetPatch,
  isCollapsed,
  onTogglePane,
  copy,
}: ResearchAssetsPanelProps & { initialActiveTab: ResearchAssetsTab }) {
  const [activeTab, setActiveTab] = useState<ResearchAssetsTab>(initialActiveTab);
  const flow = getResearchFlowState(project, session);
  const asset = session.assetSummary;
  const analyses = project?.propertyAnalyses ?? [];
  const model = project?.hotellingModel;
  const equilibrium = project?.equilibriumResult;
  const isSymbolicFailure = equilibrium?.status === "symbolic_failure";
  const hasThinAnalysis = analyses.length > 0 && analyses.length < 3;
  const canSolveNow =
    Boolean(model && onSolveEquilibrium) &&
    (flow.canSolveEquilibrium || flow.isEquilibriumStale);
  const canAnalyzeNow =
    Boolean(equilibrium && onAnalyzeProperties) &&
    (flow.canAnalyzeProperties || flow.isPropertyAnalysisStale);
  const modelPrimaryAction = getResearchPrimaryAction(
    {
      canConfirmModel: flow.canConfirmModel,
      canSolveEquilibrium: flow.canSolveEquilibrium,
      canAnalyzeProperties: false,
    },
    "model"
  );
  const equilibriumPrimaryAction = getResearchPrimaryAction(
    {
      canConfirmModel: false,
      canSolveEquilibrium: canSolveNow,
      canAnalyzeProperties: false,
    },
    "equilibrium"
  );
  const propertiesPrimaryAction = getResearchPrimaryAction(
    {
      canConfirmModel: false,
      canSolveEquilibrium: false,
      canAnalyzeProperties: canAnalyzeNow,
    },
    "properties"
  );
  const activePrimaryAction =
    activeTab === "model"
      ? modelPrimaryAction
      : activeTab === "equilibrium"
        ? equilibriumPrimaryAction
        : activeTab === "properties"
          ? propertiesPrimaryAction
          : null;
  const activePrimaryActionBusy =
    activeTab === "model"
      ? isConfirmingModel || isSolvingEquilibrium
      : activeTab === "equilibrium"
        ? isSolvingEquilibrium
        : activeTab === "properties"
          ? isAnalyzingProperties
          : false;
  const activePrimaryActionHandler =
    activeTab === "model"
      ? modelPrimaryAction?.kind === "confirm_model"
        ? onConfirmModel
        : onSolveEquilibrium
      : activeTab === "equilibrium"
        ? onSolveEquilibrium
        : activeTab === "properties"
          ? onAnalyzeProperties
          : undefined;
  const handleReviewAssetPatch = (patchId: string) => {
    const patch = session.assetPatches?.find((item) => item.id === patchId);
    if (patch) setActiveTab(getResearchAssetsTabForPatchKind(patch.kind));
  };
  const handleApplyAssetPatch = onApplyAssetPatch
    ? (patchId: string) => {
        const patch = session.assetPatches?.find((item) => item.id === patchId);
        if (patch) setActiveTab(getResearchAssetsTabForPatchKind(patch.kind));
        onApplyAssetPatch(patchId);
      }
    : undefined;
  const handleExportMarkdown = () => {
    if (!project) return;

    const markdown = buildResearchProjectMarkdown(project);
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = getResearchProjectMarkdownFilename(project);
    anchor.click();
    URL.revokeObjectURL(url);
  };

  if (isCollapsed) {
    return (
      <aside className="flex h-full min-h-0 min-w-0 flex-col border-l border-border/70 bg-background">
        <div className="relative min-h-14 shrink-0 border-b border-border/70 px-2 py-2 pr-14">
          {onTogglePane ? (
            <button
              type="button"
              className="research-pane-icon-button research-pane-icon-button-inline absolute right-2 top-2"
              aria-label={copy.expandPane}
              onClick={() => {
                onTogglePane?.();
              }}
            >
              <PanelRightOpen size={16} />
            </button>
          ) : null}
        </div>
        <div className="flex min-h-0 flex-1 flex-col items-center gap-3 px-2 py-3">
          <div
            className="flex size-6 items-center justify-center rounded-full border border-border bg-muted/40 text-[10px] font-semibold text-muted-foreground"
            title={getPhaseLabel(session.phase, copy)}
            aria-label={getPhaseLabel(session.phase, copy)}
          >
            {getPhaseShortLabel(session.phase)}
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex h-full min-h-0 min-w-0 flex-col bg-background">
      <div className="border-b border-border/70 px-4 py-3">
        <div className="flex min-h-14 items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold">
              {asset.currentDirection?.title ?? copy.headerFallbackTitle}
            </h2>
            <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
              {copy.headerDescription}
            </p>
          </div>
          <div className="flex items-start gap-2">
            {project ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1.5"
                onClick={handleExportMarkdown}
              >
                <Download className="size-3.5" />
                {copy.exportMarkdown}
              </Button>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label={copy.collapsePane}
              onClick={() => {
                onTogglePane?.();
              }}
            >
              <PanelRightClose className="size-3.5" />
            </Button>
            <PhaseIndicator phase={session.phase} copy={copy} />
          </div>
        </div>
      </div>

      <PendingAssetPatches
        patches={session.assetPatches ?? []}
        onReview={handleReviewAssetPatch}
        onApply={handleApplyAssetPatch}
        onReject={onRejectAssetPatch}
      />

      <ResearchAssetsTabs
        activeTab={activeTab}
        onActiveTabChange={setActiveTab}
        copy={copy}
      />

      {activeTab === "model" && activePrimaryAction && activePrimaryActionHandler ? (
        <PhaseActionBar
          action={activePrimaryAction}
          isBusy={activePrimaryActionBusy}
          onAction={activePrimaryActionHandler}
        />
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {activeTab === "directions" ? (
          <DirectionsTab
            session={session}
            adoptingDirectionId={adoptingDirectionId}
            onAdopt={onAdopt}
            copy={copy}
          />
        ) : null}

        {activeTab === "model" ? (
          <ModelTab
            project={project}
            onSaveModelSymbols={onSaveModelSymbols}
            onSaveModelAssumptions={onSaveModelAssumptions}
          />
        ) : null}

        {activeTab === "equilibrium" ? (
          <EquilibriumTab
            equilibriumStatusLabel={flow.equilibriumStatusLabel}
            equilibrium={equilibrium}
            isSymbolicFailure={isSymbolicFailure}
            isStale={flow.isEquilibriumStale}
            canSolveNow={canSolveNow}
            isSolvingEquilibrium={isSolvingEquilibrium}
            onSolveEquilibrium={onSolveEquilibrium}
          />
        ) : null}

        {activeTab === "properties" ? (
          <PropertiesTab
            analyses={analyses}
            analysisStatusLabel={flow.analysisStatusLabel}
            hasThinAnalysis={hasThinAnalysis}
            isStale={flow.isPropertyAnalysisStale}
            canAnalyzeNow={canAnalyzeNow}
            isAnalyzingProperties={isAnalyzingProperties}
            onAnalyzeProperties={onAnalyzeProperties}
          />
        ) : null}

        {activeTab === "paper" ? <PaperTab project={project} copy={copy} /> : null}

        {activeTab === "quality" ? (
          <QualityTab
            session={session}
            equilibrium={equilibrium}
            analysesCount={analyses.length}
            isSymbolicFailure={isSymbolicFailure}
            hasThinAnalysis={hasThinAnalysis}
            isEquilibriumStale={flow.isEquilibriumStale}
            isPropertyAnalysisStale={flow.isPropertyAnalysisStale}
          />
        ) : null}

        {activeTab === "agent" ? (
          <AgentRunTab session={session} copy={copy} />
        ) : null}
      </div>
    </aside>
  );
}

function AgentRunTab({
  session,
  copy,
}: {
  session: ResearchSession;
  copy: ReturnType<typeof getAppCopy>["assets"];
}) {
  const view = createAgentRunViewModel(session);

  if (!view.hasRun) {
    return (
      <AssetSection
        title={copy.agentTraceTitle}
        description={copy.agentTraceDescription}
      >
        <EmptyLine text={copy.agentEmptyDescription} />
      </AssetSection>
    );
  }

  return (
    <div className="space-y-5">
      <AssetSection
        title={copy.agentTraceTitle}
        description={copy.agentTraceDescription}
      >
        <AgentRunSummaryDisclosure run={view.run} />
      </AssetSection>

      <AssetSection title={copy.agentStepsTitle}>
        {view.run.steps.length > 0 ? (
          <AgentStepDisclosureList steps={view.run.steps} />
        ) : (
          <EmptyLine text={copy.agentEmptyDescription} />
        )}
      </AssetSection>
    </div>
  );
}

function AgentRunSummaryDisclosure({
  run,
}: {
  run: Extract<AgentRunViewModel, { hasRun: true }>["run"];
}) {
  return (
    <details className="group rounded-md border bg-background" open>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-3 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-foreground">
            {run.summaryLabel}
          </p>
          <p className="mt-1 truncate text-[11px] text-muted-foreground">
            {run.workflowId}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <StatusBadge label={run.statusLabel} tone={run.statusTone} />
          <ChevronDown className="size-3.5 text-muted-foreground transition-transform group-open:rotate-180" />
        </div>
      </summary>
      <div className="border-t px-3 pb-3 pt-3">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-[11px] leading-5 sm:grid-cols-3">
          {run.metadata.map((item) => (
            <div key={item.label} className="min-w-0">
              <dt className="text-muted-foreground">{item.label}</dt>
              <dd className="mt-0.5 break-words font-medium text-foreground">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
        {run.error ? <WarningBox text={run.error} /> : null}
      </div>
    </details>
  );
}

function AgentStepDisclosureList({
  steps,
}: {
  steps: AgentRunStepViewModel[];
}) {
  return (
    <div className="overflow-hidden rounded-md border bg-background">
      {steps.map((step, index) => (
        <details
          key={step.id}
          className={index > 0 ? "group border-t" : "group"}
          open={step.defaultExpanded}
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5 [&::-webkit-details-marker]:hidden">
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-foreground">
                {step.label}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {step.durationLabel}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <StatusBadge label={step.statusLabel} tone={step.statusTone} />
              <ChevronDown className="size-3.5 text-muted-foreground transition-transform group-open:rotate-180" />
            </div>
          </summary>
          {step.summary ? (
            <p className="border-t bg-muted/25 px-3 py-2.5 text-xs leading-5 text-muted-foreground">
              {step.summary}
            </p>
          ) : null}
        </details>
      ))}
    </div>
  );
}

function DirectionsTab({
  session,
  adoptingDirectionId,
  onAdopt,
  copy,
}: {
  session: ResearchSession;
  adoptingDirectionId?: string | null;
  onAdopt?: (directionId: string) => void;
  copy: ReturnType<typeof getAppCopy>["assets"];
}) {
  return (
    <div className="space-y-3">
      <AssetSection
        title={copy.candidateDirections}
        description={copy.candidateDirectionsDescription}
      >
        <div className="space-y-3">
          {session.directions.map((direction) => (
            <DirectionCard
              key={direction.id}
              direction={direction}
              adopted={session.assetSummary.currentDirection?.id === direction.id}
              disabled={!onAdopt}
              isAdopting={adoptingDirectionId === direction.id}
              onAdopt={onAdopt ?? (() => undefined)}
            />
          ))}
        </div>
      </AssetSection>
    </div>
  );
}

function ModelTab({
  project,
  onSaveModelSymbols,
  onSaveModelAssumptions,
}: {
  project?: ResearchProject;
  onSaveModelSymbols?: (symbols: NonNullable<ResearchProject["hotellingModel"]>["symbols"]) => Promise<void> | void;
  onSaveModelAssumptions?: (assumptions: string[]) => Promise<void> | void;
}) {
  const model = project?.hotellingModel;

  if (!model) {
    return <EmptyLine text="采用一个研究方向后，模型设定会显示在这里。" />;
  }

  return (
    <div className="space-y-6">
      <AssetSection title="模型摘要">
        <div className="rounded-md border bg-background px-3 py-3 text-muted-foreground">
          <MarkdownRenderer
            content={model.modelSetupDraft}
            className="paperforge-markdown text-sm leading-6"
          />
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2 text-[11px] leading-5 sm:grid-cols-2">
          <InfoTile label="平台" value={model.platforms.join(" / ")} />
          <InfoTile
            label="两侧"
            value={`${model.sides.consumerSideName} / ${model.sides.merchantSideName}`}
          />
          <InfoTile label="时序" value={`${model.timing.length} 步`} />
          <InfoTile label="假设" value={`${model.assumptions.length} 条`} />
        </div>
      </AssetSection>

      <EditableSymbolRegistry
        symbols={model.symbols}
        onSaveSymbols={onSaveModelSymbols}
      />

      <EditableModelPanel
        assumptions={model.assumptions}
        onSaveAssumptions={onSaveModelAssumptions}
      />

      <AssetSection title="决策时序">
        <div className="space-y-2">
          {model.timing.map((stage) => (
            <article
              key={stage.id}
              className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 rounded-md border bg-background px-3 py-2"
            >
              <div className="pt-0.5 font-mono text-[11px] text-muted-foreground">
                {stage.order}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground">{stage.name}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {stage.decisions.length > 0
                    ? stage.decisions.join(" / ")
                    : "暂无决策说明"}
                </p>
              </div>
            </article>
          ))}
        </div>
      </AssetSection>

      <AssetSection title="效用函数">
        <div className="space-y-2">
          {model.utilityFunctions.map((formula) => (
            <FormulaCard
              key={formula.id}
              label={getUtilitySideLabel(formula.side)}
              context={formula.platform}
              notes={formula.notes}
              formula={formula.expression}
            />
          ))}
        </div>
      </AssetSection>

      <AssetSection title="利润函数">
        <div className="space-y-2">
          {model.profitFunctions.map((formula) => (
            <FormulaCard
              key={formula.id}
              label={formula.platform}
              context="平台利润"
              notes={formula.notes}
              formula={formula.expression}
            />
          ))}
        </div>
      </AssetSection>
    </div>
  );
}

function FormulaCard({
  label,
  context,
  notes,
  formula,
}: {
  label: string;
  context: string;
  notes: string;
  formula: string;
}) {
  return (
    <article className="rounded-md border bg-background px-3 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold text-muted-foreground">{label}</p>
        <p className="text-[11px] text-muted-foreground">{context}</p>
      </div>
      {notes ? (
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{notes}</p>
      ) : null}
      <div className="mt-2">
        <MathArtifact formula={formula} variant="embedded" />
      </div>
    </article>
  );
}

function PhaseActionBar({
  action,
  isBusy,
  onAction,
}: {
  action: ResearchPrimaryAction | null;
  isBusy?: boolean;
  onAction?: () => void;
}) {
  if (!action || !onAction) return null;

  const icon =
    action.kind === "confirm_model" ? (
      <CheckCircle2 className="size-4" />
    ) : action.kind === "analyze_properties" ? (
      <FileText className="size-4" />
    ) : (
      <Sigma className="size-4" />
    );

  return (
    <div className="shrink-0 border-b border-border/70 bg-background px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">
            {action.description}
          </p>
        </div>
        <Button
          className="gap-1.5"
          disabled={isBusy}
          onClick={createResearchActionClickHandler(onAction)}
        >
          {isBusy ? <Loader2 className="size-4 animate-spin" /> : icon}
          {action.label}
        </Button>
      </div>
    </div>
  );
}

function getUtilitySideLabel(side: "consumer" | "merchant") {
  return side === "consumer" ? "消费者效用" : "商家效用";
}

function getResearchAssetsTabForPatchKind(kind: ResearchAssetKind): ResearchAssetsTab {
  switch (kind) {
    case "model":
      return "model";
    case "equilibrium":
      return "equilibrium";
    case "properties":
      return "properties";
  }
}

function EquilibriumTab({
  equilibriumStatusLabel,
  equilibrium,
  isSymbolicFailure,
  isStale,
  canSolveNow,
  isSolvingEquilibrium,
  onSolveEquilibrium,
}: {
  equilibriumStatusLabel: string;
  equilibrium?: ResearchProject["equilibriumResult"];
  isSymbolicFailure: boolean;
  isStale: boolean;
  canSolveNow: boolean;
  isSolvingEquilibrium?: boolean;
  onSolveEquilibrium?: () => void;
}) {
  const primaryAction = getResearchPrimaryAction(
    {
      canConfirmModel: false,
      canSolveEquilibrium: canSolveNow,
      canAnalyzeProperties: false,
    },
    "equilibrium"
  );

  return (
    <div className="space-y-5">
      <AssetSection title="均衡求解状态">
        <StatusBadge
          label={isStale ? "模型已修改，需要重算均衡" : equilibriumStatusLabel}
          tone={isStale || isSymbolicFailure ? "warning" : equilibrium ? "success" : "neutral"}
        />
        {isSymbolicFailure ? (
          <WarningBox text="当前没有得到可作为论文结论的闭式均衡解。这里仅保留一阶条件、约束和隐式系统草稿；需要收窄模型或重新求解后，才应继续性质分析。" />
        ) : null}
        {isStale ? (
          <WarningBox text="模型假设已被编辑，旧均衡不再是当前模型的权威结果。" />
        ) : null}
      </AssetSection>

      <PhaseActionBar
        action={primaryAction}
        isBusy={isSolvingEquilibrium}
        onAction={onSolveEquilibrium}
      />

      {equilibrium ? (
        <>
          <AssetSection title="均衡概念">
            <MarkdownRenderer
              content={equilibrium.concept}
              className="paperforge-markdown text-sm leading-6 text-muted-foreground"
            />
          </AssetSection>

          <AssetSection title="一阶条件">
            <FormulaList items={equilibrium.focs} emptyText="尚未生成一阶条件。" />
          </AssetSection>

          {isSymbolicFailure ? (
            <AssetSection title="未得到闭式解">
              {equilibrium.closedForm ? (
                <MarkdownRenderer
                  content={equilibrium.closedForm}
                  className="paperforge-markdown text-sm leading-6 text-muted-foreground"
                />
              ) : (
                <EmptyLine text="当前只有隐式系统草稿，尚未得到星号闭式解。" />
              )}
            </AssetSection>
          ) : (
            <AssetSection title="闭式解">
              {equilibrium.closedForm ? (
                <MathArtifact formula={equilibrium.closedForm} />
              ) : (
                <EmptyLine text="尚未得到可展示的闭式解。" />
              )}
            </AssetSection>
          )}

          <AssetSection title="推导步骤">
            <OrderedList items={equilibrium.solvingSteps} />
          </AssetSection>

          <AssetSection title="存在条件">
            <OrderedList items={equilibrium.conditions} />
          </AssetSection>

          {equilibrium.warnings.length > 0 ? (
            <AssetSection title="注意">
              <div className="space-y-2">
                {equilibrium.warnings.map((warning) => (
                  <WarningBox key={warning} text={warning} />
                ))}
              </div>
            </AssetSection>
          ) : null}
        </>
      ) : (
        <EmptyLine text="确认模型后，可以在这里生成并检查符号均衡。" />
      )}
    </div>
  );
}

function PropertiesTab({
  analyses,
  analysisStatusLabel,
  hasThinAnalysis,
  isStale,
  canAnalyzeNow,
  isAnalyzingProperties,
  onAnalyzeProperties,
}: {
  analyses: NonNullable<ResearchProject["propertyAnalyses"]>;
  analysisStatusLabel: string;
  hasThinAnalysis: boolean;
  isStale: boolean;
  canAnalyzeNow: boolean;
  isAnalyzingProperties?: boolean;
  onAnalyzeProperties?: () => void;
}) {
  const primaryAction = getResearchPrimaryAction(
    {
      canConfirmModel: false,
      canSolveEquilibrium: false,
      canAnalyzeProperties: canAnalyzeNow,
    },
    "properties"
  );

  return (
    <div className="space-y-5">
      <AssetSection title="性质分析状态">
        <StatusBadge
          label={isStale ? "模型已修改，需要重做性质分析" : analysisStatusLabel}
          tone={isStale || hasThinAnalysis ? "warning" : analyses.length > 0 ? "success" : "neutral"}
        />
        {hasThinAnalysis ? (
          <WarningBox text="当前性质分析数量太少，只能算草稿。至少需要围绕核心参数、策略变量和阈值条件形成 3 条以上可检查命题。" />
        ) : null}
        {isStale ? (
          <WarningBox text="模型假设已被编辑，旧性质分析不再对应当前模型。" />
        ) : null}
      </AssetSection>

      <PhaseActionBar
        action={primaryAction}
        isBusy={isAnalyzingProperties}
        onAction={onAnalyzeProperties}
      />

      {analyses.length > 0 ? (
        <div className="space-y-3">
          {analyses.map((analysis, index) => (
            <article key={analysis.id} className="rounded-md border bg-background p-3">
              <p className="text-xs font-semibold text-muted-foreground">
                命题草稿 {index + 1}
              </p>
              <h3 className="mt-1 text-sm font-semibold leading-6">
                {analysis.target} 对 {analysis.parameter}
              </h3>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                {analysis.signCondition}
              </p>
              <div className="mt-3">
                <MathArtifact formula={analysis.symbolicResult} />
              </div>
              <MarkdownRenderer
                content={analysis.propositionDraft}
                className="paperforge-markdown mt-3 text-sm leading-6"
              />
              <MarkdownRenderer
                content={analysis.proofSketch}
                className="paperforge-markdown mt-2 text-xs leading-5 text-muted-foreground"
              />
            </article>
          ))}
        </div>
      ) : (
        <EmptyLine text="符号均衡完成后，可以在这里生成比较静态和命题草稿。" />
      )}
    </div>
  );
}

function PaperTab({
  project,
  copy,
}: {
  project?: ResearchProject;
  copy: ReturnType<typeof getAppCopy>["assets"];
}) {
  const markdown = project ? buildResearchProjectMarkdown(project) : "";
  const sections = project?.sections ?? [];
  const hasDraftSections = sections.length > 0;

  return (
    <div className="space-y-4">
      <AssetSection
        title={copy.exportGuideTitle}
        description={copy.exportGuideDescription}
      >
        <div className="grid gap-2 sm:grid-cols-2">
          <InfoTile
            label="导出格式"
            value="Markdown"
          />
          <InfoTile
            label="导出内容"
            value={hasDraftSections ? "正文 + 草稿章节" : "方向 / 模型 / 均衡 / 性质"}
          />
        </div>
      </AssetSection>

      <AssetSection title={copy.paperPreview}>
        {markdown ? (
          <div className="rounded-md border bg-background px-3 py-3">
            <MarkdownRenderer
              content={markdown}
              className="paperforge-markdown text-sm leading-7"
            />
          </div>
        ) : (
          <EmptyLine text={copy.emptyPaper} />
        )}
      </AssetSection>

      {hasDraftSections ? (
        <AssetSection title="草稿章节">
          <div className="space-y-3">
            {sections.map((section) => (
              <article key={section.id} className="rounded-md border bg-background p-3">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <FileText className="size-3.5" />
                  {section.status}
                </p>
                <h3 className="mt-1 text-sm font-semibold">{section.title}</h3>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {section.content}
                </p>
              </article>
            ))}
          </div>
        </AssetSection>
      ) : null}
    </div>
  );
}

function QualityTab({
  session,
  equilibrium,
  analysesCount,
  isSymbolicFailure,
  hasThinAnalysis,
  isEquilibriumStale,
  isPropertyAnalysisStale,
}: {
  session: ResearchSession;
  equilibrium?: ResearchProject["equilibriumResult"];
  analysesCount: number;
  isSymbolicFailure: boolean;
  hasThinAnalysis: boolean;
  isEquilibriumStale: boolean;
  isPropertyAnalysisStale: boolean;
}) {
  return (
    <div className="space-y-5">
      <AssetSection title="当前提示">
        {session.assetSummary.pendingDecision ? (
          <div className="flex gap-2 rounded-md border bg-background p-3 text-xs leading-5">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>{session.assetSummary.pendingDecision.prompt}</span>
          </div>
        ) : (
          <EmptyLine text="当前没有必须处理的流程提示，可以继续自由对话或编辑右侧资产。" />
        )}
      </AssetSection>

      <AssetSection title="质量检查">
        <div className="space-y-2">
          <QualityLine ok={!isEquilibriumStale} text="均衡结果对应当前模型" />
          <QualityLine ok={!isPropertyAnalysisStale} text="性质分析对应当前模型" />
          <QualityLine ok={!isSymbolicFailure} text="均衡不是符号推导草稿" />
          <QualityLine ok={!hasThinAnalysis} text="性质分析不是单条薄弱命题" />
          <QualityLine ok={analysesCount === 0 || analysesCount >= 3} text="性质分析达到 3 条以上" />
          <QualityLine ok={!equilibrium?.warnings.length} text="均衡结果没有显式注意事项" />
        </div>
      </AssetSection>

      <AssetSection title="下一步">
        <OrderedList items={session.assetSummary.nextActions} />
      </AssetSection>
    </div>
  );
}

function FormulaList({ items, emptyText }: { items: string[]; emptyText: string }) {
  if (items.length === 0) return <EmptyLine text={emptyText} />;

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <MathArtifact key={item} formula={item} />
      ))}
    </div>
  );
}

function OrderedList({ items }: { items: string[] }) {
  if (items.length === 0) return <EmptyLine text="暂无内容。" />;

  return (
    <ol className="space-y-2">
      {items.map((item, index) => (
        <li key={`${index}-${item}`} className="flex gap-2 text-xs leading-5">
          <span className="font-mono font-semibold text-muted-foreground">
            {index + 1}.
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ol>
  );
}

function AssetSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0">
      <div className="mb-3">
        <h3 className="text-xs font-semibold text-muted-foreground">{title}</h3>
        {description ? (
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md border bg-card px-2.5 py-2">
      <p className="text-muted-foreground">{label}</p>
      <p className="mt-0.5 break-words font-medium text-foreground">{value}</p>
    </div>
  );
}

function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: "neutral" | "success" | "warning";
}) {
  const className =
    tone === "success"
      ? "border-[oklch(0.82_0.04_155)] bg-[oklch(0.965_0.026_155)] text-[oklch(0.34_0.065_155)]"
      : tone === "warning"
        ? "border-[oklch(0.82_0.04_85)] bg-[oklch(0.965_0.03_85)] text-[oklch(0.38_0.07_65)]"
        : "border-border bg-background text-muted-foreground";

  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 rounded-sm border px-2 py-1 text-xs ${className}`}
    >
      <CircleDot className="size-3" />
      <span className="min-w-0 break-words">{label}</span>
    </span>
  );
}

function WarningBox({ text }: { text: string }) {
  return (
    <p className="mt-3 rounded-md border border-amber-200 bg-[oklch(0.965_0.03_85)] px-3 py-3 text-xs leading-5 text-[oklch(0.38_0.07_65)]">
      {text}
    </p>
  );
}

function EmptyLine({ text }: { text: string }) {
  return (
    <div className="min-w-0 rounded-md border border-dashed bg-background/60 px-3 py-3 text-xs leading-5 text-muted-foreground">
      {text}
    </div>
  );
}

function QualityLine({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div className="flex items-start gap-2 rounded-md border bg-background px-3 py-2 text-xs leading-5">
      {ok ? (
        <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-[oklch(0.38_0.07_155)]" />
      ) : (
        <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-[oklch(0.48_0.08_65)]" />
      )}
      <span>{text}</span>
    </div>
  );
}

function getPhaseShortLabel(phase: ResearchSession["phase"]) {
  switch (phase) {
    case "direction":
      return "D";
    case "model":
      return "M";
    case "equilibrium":
      return "E";
    case "analysis":
      return "A";
  }
}

function getPhaseLabel(
  phase: ResearchSession["phase"],
  copy?: ReturnType<typeof getAppCopy>["assets"]
) {
  if (copy) {
    switch (phase) {
      case "direction":
        return copy.phaseDirection;
      case "model":
        return copy.phaseModel;
      case "equilibrium":
        return copy.phaseEquilibrium;
      case "analysis":
        return copy.phaseAnalysis;
    }
  }

  switch (phase) {
    case "direction":
      return "方向发现";
    case "model":
      return "模型确认";
    case "equilibrium":
      return "均衡推导";
    case "analysis":
      return "性质分析";
  }
}
