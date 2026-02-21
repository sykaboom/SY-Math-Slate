"use client";

import { ChevronLeft, ChevronRight, Minus, Plus, Trash2 } from "lucide-react";

import { useDocumentOutline } from "@features/platform/hooks/useDocumentOutline";
import { useCanvasStore } from "@features/platform/store/useCanvasStore";
import { useUIStore } from "@features/platform/store/useUIStoreBridge";
import { Popover, PopoverTrigger } from "@ui/components/popover";
import { Slider } from "@ui/components/slider";

import { ToolButton } from "./atoms/ToolButton";
import { NAVIGATION_LABELS } from "./navigationLabels";
import { fireToolbarCommand } from "./toolbarFeedback";
import { ToolbarPanel } from "./atoms/ToolbarPanel";

export function PageNavigator() {
  const {
    pageOrder,
    currentPageId,
    pageColumnCounts,
    isPageEmpty,
  } = useCanvasStore();
  const { isOverviewMode } = useUIStore();
  const totalPages = pageOrder.length || 1;
  const currentIndex = Math.max(0, pageOrder.indexOf(currentPageId));
  const columnCount = pageColumnCounts?.[currentPageId] ?? 2;
  const canDelete = isPageEmpty(currentPageId) && pageOrder.length > 1;
  const canDecrease = columnCount > 1;
  const canIncrease = columnCount < 4;
  const canPageJump = totalPages > 1;
  const {
    entries: outlineEntries,
    currentEntry,
    currentStepIndex,
    jumpToStep,
  } = useDocumentOutline();
  const canOutlineJump = outlineEntries.length > 0;
  const pageSliderValue = Math.min(currentIndex + 1, totalPages);

  const dispatchPageCommand = (commandId: string, payload: unknown = {}) => {
    fireToolbarCommand({
      commandId,
      payload,
      source: "toolbar.page-navigator",
      errorMessage: "페이지/아웃라인 이동 요청을 처리하지 못했습니다.",
    });
  };

  const handleJump = (value: number) => {
    const target = Math.round(value);
    const clamped = Math.max(1, Math.min(totalPages, target));
    const nextId = pageOrder[clamped - 1];
    if (nextId) {
      dispatchPageCommand("goToPage", { pageId: nextId });
    }
  };

  return (
    <div className="flex items-center gap-2 rounded-full border border-toolbar-border/10 bg-toolbar-chip/5 px-2 py-1 text-xs text-toolbar-muted/60">
      <ToolButton
        icon={ChevronLeft}
        label="Previous Page"
        onClick={() => dispatchPageCommand("prevPage")}
        disabled={currentIndex === 0 || isOverviewMode}
        className="h-8 w-8"
      />
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="whitespace-nowrap rounded-full px-2 py-1 text-[11px] text-toolbar-text/70 hover:text-toolbar-text disabled:text-toolbar-muted/40"
            disabled={isOverviewMode || !canPageJump}
            title={NAVIGATION_LABELS.page.hint}
          >
            {NAVIGATION_LABELS.page.short} {currentIndex + 1} / {totalPages}
          </button>
        </PopoverTrigger>
        {canPageJump && (
          <ToolbarPanel side="top" align="center" sideOffset={18}>
            <div className="flex w-48 items-center gap-3">
              <Slider
                value={[pageSliderValue]}
                min={1}
                max={totalPages}
                step={1}
                onValueChange={(value) => handleJump(value[0])}
              />
              <span className="w-10 text-right text-xs text-toolbar-text/80">
                {currentIndex + 1}/{totalPages}
              </span>
            </div>
          </ToolbarPanel>
        )}
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="whitespace-nowrap rounded-full px-2 py-1 text-[11px] text-toolbar-text/70 hover:text-toolbar-text disabled:text-toolbar-muted/40"
            disabled={isOverviewMode || !canOutlineJump}
            title={currentEntry?.label ?? NAVIGATION_LABELS.outlineStep.hint}
          >
            {NAVIGATION_LABELS.outlineStep.short}{" "}
            {canOutlineJump ? currentStepIndex + 1 : 0}/
            {outlineEntries.length}
          </button>
        </PopoverTrigger>
        {canOutlineJump && (
          <ToolbarPanel side="top" align="center" sideOffset={18} className="w-72 p-2">
            <div className="max-h-64 space-y-1 overflow-y-auto pr-1">
              {outlineEntries.map((entry) => {
                const isActive = entry.stepIndex === currentStepIndex;
                return (
                  <button
                    key={entry.stepId}
                    type="button"
                    className={`flex w-full flex-col rounded-lg border px-2 py-1.5 text-left transition ${
                      isActive
                        ? "border-toolbar-border/40 bg-toolbar-chip/20 text-toolbar-text"
                        : "border-transparent text-toolbar-text/70 hover:border-toolbar-border/25 hover:bg-toolbar-chip/10"
                    }`}
                    onClick={() => jumpToStep(entry.stepIndex)}
                  >
                    <span className="text-[10px] uppercase tracking-wide text-toolbar-muted/50">
                      {NAVIGATION_LABELS.outlineStep.short} {entry.stepIndex + 1}
                    </span>
                    <span className="truncate text-xs">{entry.preview}</span>
                  </button>
                );
              })}
            </div>
          </ToolbarPanel>
        )}
      </Popover>
      <ToolButton
        icon={ChevronRight}
        label="Next Page"
        onClick={() => dispatchPageCommand("nextPage")}
        disabled={currentIndex >= totalPages - 1 || isOverviewMode}
        className="h-8 w-8"
      />
      <ToolButton
        icon={Plus}
        label="Add Page"
        onClick={() => dispatchPageCommand("addPage")}
        disabled={isOverviewMode}
        className="h-8 w-8"
      />
      <ToolButton
        icon={Trash2}
        label="Delete Page"
        onClick={() => dispatchPageCommand("deletePage")}
        disabled={!canDelete || isOverviewMode}
        className="h-8 w-8"
      />
      <span className="h-4 border-r border-toolbar-border/10" />
      <div className="flex items-center gap-1 rounded-full border border-toolbar-border/10 bg-toolbar-chip/5 px-1 py-0.5">
        <ToolButton
          icon={Minus}
          label="Decrease Columns"
          onClick={() =>
            dispatchPageCommand("setColumnCount", { count: columnCount - 1 })
          }
          disabled={!canDecrease || isOverviewMode}
          className="h-8 w-8"
        />
        <span className="min-w-[36px] text-center text-[11px] text-toolbar-text/70">
          {columnCount}단
        </span>
        <ToolButton
          icon={Plus}
          label="Increase Columns"
          onClick={() =>
            dispatchPageCommand("setColumnCount", { count: columnCount + 1 })
          }
          disabled={!canIncrease || isOverviewMode}
          className="h-8 w-8"
        />
      </div>
    </div>
  );
}
