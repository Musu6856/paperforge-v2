"use client";

import type { ResearchAssetsTab } from "@/lib/research-flow";
import type { getAppCopy } from "@/lib/app-language-copy";

type ResearchAssetsTabsProps = {
  activeTab: ResearchAssetsTab;
  onActiveTabChange: (tab: ResearchAssetsTab) => void;
  copy: ReturnType<typeof getAppCopy>["assets"];
};

const tabs: Array<{
  id: ResearchAssetsTab;
  labelKey:
    | "tabDirections"
    | "tabModel"
    | "tabEquilibrium"
    | "tabProperties"
    | "tabPaper"
    | "tabQuality"
    | "tabAgent";
}> = [
  { id: "directions", labelKey: "tabDirections" },
  { id: "model", labelKey: "tabModel" },
  { id: "equilibrium", labelKey: "tabEquilibrium" },
  { id: "properties", labelKey: "tabProperties" },
  { id: "paper", labelKey: "tabPaper" },
  { id: "quality", labelKey: "tabQuality" },
  { id: "agent", labelKey: "tabAgent" },
];

export function ResearchAssetsTabs({
  activeTab,
  onActiveTabChange,
  copy,
}: ResearchAssetsTabsProps) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b px-3 py-2" role="tablist" aria-label={copy.tabAriaLabel}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          className="shrink-0 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors aria-selected:bg-primary aria-selected:text-primary-foreground"
          onClick={() => onActiveTabChange(tab.id)}
        >
          {copy[tab.labelKey]}
        </button>
      ))}
    </div>
  );
}
