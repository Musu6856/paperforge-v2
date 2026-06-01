"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  DEFAULT_RESEARCH_PANEL_LAYOUT,
  RESEARCH_PANEL_LAYOUT_STORAGE_KEY,
  clampResearchPanelLayout,
  deserializeResearchPanelLayout,
  serializeResearchPanelLayout,
  toggleResearchPane,
  type ResearchPanelLayout,
} from "@/lib/panel-layout";
import type { getAppCopy } from "@/lib/app-language-copy";
import { PaneSplitter } from "./pane-splitter";

type ResearchWorkspaceShellProps = {
  left: React.ReactNode;
  center: React.ReactNode;
  right: (controls: {
    isCollapsed: boolean;
    toggleRight: () => void;
  }) => React.ReactNode;
  copy: ReturnType<typeof getAppCopy>["shell"];
};

export function ResearchWorkspaceShell({
  left,
  center,
  right,
  copy,
}: ResearchWorkspaceShellProps) {
  const [viewportWidth, setViewportWidth] = useState(1440);
  const [layout, setLayout] = useState<ResearchPanelLayout>(
    DEFAULT_RESEARCH_PANEL_LAYOUT
  );
  const collapsedPaneWidth = 72;
  const splitterWidth = 8;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const width = window.innerWidth;
      const stored = deserializeResearchPanelLayout(
        window.localStorage.getItem(RESEARCH_PANEL_LAYOUT_STORAGE_KEY)
      );

      setViewportWidth(width);
      setLayout((current) => clampResearchPanelLayout(stored ?? current, width));
    });

    function handleResize() {
      setViewportWidth(window.innerWidth);
      setLayout((current) => clampResearchPanelLayout(current, window.innerWidth));
    }

    window.addEventListener("resize", handleResize);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      RESEARCH_PANEL_LAYOUT_STORAGE_KEY,
      serializeResearchPanelLayout(layout)
    );
  }, [layout]);

  const clampedLayout = useMemo(
    () => clampResearchPanelLayout(layout, viewportWidth),
    [layout, viewportWidth]
  );

  function updateLayoutFromCurrent(
    transform: (current: ResearchPanelLayout) => ResearchPanelLayout
  ) {
    setLayout((current) =>
      clampResearchPanelLayout(transform(current), viewportWidth)
    );
  }

  const leftWidth = clampedLayout.leftCollapsed
    ? collapsedPaneWidth
    : clampedLayout.leftWidth;
  const rightWidth = clampedLayout.rightCollapsed
    ? collapsedPaneWidth
    : clampedLayout.rightWidth;

  return (
    <div
      className="research-workspace-shell"
      style={{
        gridTemplateColumns: `${leftWidth}px ${splitterWidth}px minmax(520px, 1fr) ${splitterWidth}px ${rightWidth}px`,
      }}
    >
      <aside className="research-workspace-pane research-workspace-pane-left">
        <button
          type="button"
          className="research-pane-icon-button"
          aria-label={
            clampedLayout.leftCollapsed
              ? copy.expandLeftPane
              : copy.collapseLeftPane
          }
          onClick={() =>
            updateLayoutFromCurrent((current) => toggleResearchPane(current, "left"))
          }
        >
          {clampedLayout.leftCollapsed ? (
            <PanelLeftOpen size={16} />
          ) : (
            <PanelLeftClose size={16} />
          )}
        </button>
        {!clampedLayout.leftCollapsed ? left : null}
      </aside>

      <PaneSplitter
        label={copy.resizeLeftPane}
        onDrag={(deltaX) =>
          updateLayoutFromCurrent((current) => ({
            ...current,
            leftWidth: current.leftWidth + deltaX,
          }))
        }
        onKeyboardResize={(deltaX) =>
          updateLayoutFromCurrent((current) => ({
            ...current,
            leftWidth: current.leftWidth + deltaX,
          }))
        }
      />

      <main className="research-workspace-pane research-workspace-pane-center">
        {center}
      </main>

      <PaneSplitter
        label={copy.resizeRightPane}
        onDrag={(deltaX) =>
          updateLayoutFromCurrent((current) => ({
            ...current,
            rightWidth: current.rightWidth - deltaX,
          }))
        }
        onKeyboardResize={(deltaX) =>
          updateLayoutFromCurrent((current) => ({
            ...current,
            rightWidth: current.rightWidth - deltaX,
          }))
        }
      />

      <aside className="research-workspace-pane research-workspace-pane-right">
        {right({
          isCollapsed: clampedLayout.rightCollapsed,
          toggleRight: () =>
            updateLayoutFromCurrent((current) => toggleResearchPane(current, "right")),
        })}
      </aside>
    </div>
  );
}
