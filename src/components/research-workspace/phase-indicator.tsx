import { CheckCircle2, CircleDot } from "lucide-react";

import { cn } from "@/lib/utils";
import type { getAppCopy } from "@/lib/app-language-copy";
import type { ResearchSession } from "@/lib/types";

const PHASES: {
  id: ResearchSession["phase"];
  labelKey: "phaseDirection" | "phaseModel" | "phaseEquilibrium" | "phaseAnalysis";
}[] = [
  { id: "direction", labelKey: "phaseDirection" },
  { id: "model", labelKey: "phaseModel" },
  { id: "equilibrium", labelKey: "phaseEquilibrium" },
  { id: "analysis", labelKey: "phaseAnalysis" },
];

export function PhaseIndicator({
  phase,
  copy,
}: {
  phase: ResearchSession["phase"];
  copy: ReturnType<typeof getAppCopy>["assets"];
}) {
  const activeIndex = PHASES.findIndex((item) => item.id === phase);

  return (
    <div
      className="flex min-w-0 max-w-full items-center gap-1 overflow-x-auto pb-1 text-[11px] sm:flex-wrap sm:overflow-visible sm:pb-0"
      aria-label={copy.phaseAriaLabel}
    >
      {PHASES.map((item, index) => {
        const isActive = index === activeIndex;
        const isComplete = activeIndex > index;

        return (
          <span
            key={item.id}
            className={cn(
              "inline-flex min-h-7 shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 leading-none transition-colors",
              isActive &&
                "border-primary bg-primary text-primary-foreground shadow-sm",
              !isActive &&
                isComplete &&
                "border-primary/20 bg-primary/5 text-foreground",
              !isActive &&
                !isComplete &&
                "border-border bg-muted/40 text-muted-foreground"
            )}
          >
            {isComplete ? (
              <CheckCircle2 className="size-3" />
            ) : isActive ? (
              <CircleDot className="size-3" />
            ) : (
              <span className="size-1.5 rounded-full bg-current/40" />
            )}
            {copy[item.labelKey]}
          </span>
        );
      })}
    </div>
  );
}
