"use client";

import { Fragment } from "react";
import {
  ChevronDown,
  ChevronUp,
  Columns,
  CornerDownLeft,
  FilePlus,
  GripVertical,
  Trash2,
} from "lucide-react";

import { cn } from "@core/utils";
import type {
  InputStudioBlocksSectionProps,
  InputStudioInsertionMarkerRenderArgs,
} from "@features/input-studio/hooks/types";
import { Button } from "@ui/components/button";

const DEFAULT_SECTION_LABEL = "블록 미리보기";
const DEFAULT_LINE_BREAK_LABEL = "줄바꿈";
const DEFAULT_COLUMN_BREAK_LABEL = "단나눔";
const DEFAULT_PAGE_BREAK_LABEL = "페이지";
const FALLBACK_BREAK_LABEL = "구분선";

const createDefaultInsertionMarker = ({
  index,
  isActive,
  onSelect,
}: InputStudioInsertionMarkerRenderArgs) => (
  <button
    type="button"
    className={cn(
      "group flex w-full items-center gap-2 rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.2em]",
      isActive
        ? "text-[var(--theme-text)]"
        : "text-[var(--theme-text-subtle)] hover:text-[var(--theme-text-muted)]"
    )}
    onClick={onSelect}
  >
    <span
      className={cn(
        "h-px flex-1 transition-colors",
        isActive
          ? "bg-[var(--theme-accent-strong)]"
          : "bg-[var(--theme-surface-soft)] group-hover:bg-[var(--theme-border)]"
      )}
    />
    <span
      className={cn(
        "rounded-full border px-2 py-0.5",
        isActive
          ? "border-[var(--theme-accent)] bg-[var(--theme-accent-soft)]"
          : "border-[var(--theme-border)] bg-[var(--theme-surface-soft)]"
      )}
    >
      삽입 {index}
    </span>
    <span
      className={cn(
        "h-px flex-1 transition-colors",
        isActive
          ? "bg-[var(--theme-accent-strong)]"
          : "bg-[var(--theme-surface-soft)] group-hover:bg-[var(--theme-border)]"
      )}
    />
  </button>
);

export function InputStudioBlocksSection({
  blocks,
  editorSurface,
  contentOrderByBlockId,
  expandedBlockId,
  onExpandedBlockChange,
  onMoveBlock,
  onMoveBlockByIndex,
  onDeleteBlock,
  onInsertionIndexChange,
  onInsertBreakBlock,
  renderExpandedContent,
  renderInsertionMarker,
  label = DEFAULT_SECTION_LABEL,
  lineBreakLabel = DEFAULT_LINE_BREAK_LABEL,
  columnBreakLabel = DEFAULT_COLUMN_BREAK_LABEL,
  pageBreakLabel = DEFAULT_PAGE_BREAK_LABEL,
  className,
}: InputStudioBlocksSectionProps) {
  const markerRenderer = renderInsertionMarker ?? createDefaultInsertionMarker;

  return (
    <section className={cn("flex min-h-0 flex-1 flex-col gap-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-white/60">{label}</span>
        <span className="text-[11px] text-white/40">{blocks.length}개</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          className="h-10 px-3 text-xs"
          onClick={() => onInsertBreakBlock("line-break")}
        >
          <CornerDownLeft className="mr-1 h-3 w-3" />
          {lineBreakLabel}
        </Button>
        <Button
          variant="outline"
          className="h-10 px-3 text-xs"
          onClick={() => onInsertBreakBlock("column-break")}
        >
          <Columns className="mr-1 h-3 w-3" />
          {columnBreakLabel}
        </Button>
        <Button
          variant="outline"
          className="h-10 px-3 text-xs"
          onClick={() => onInsertBreakBlock("page-break")}
        >
          <FilePlus className="mr-1 h-3 w-3" />
          {pageBreakLabel}
        </Button>
      </div>

      <div className="flex flex-col gap-3 pr-1">
        {editorSurface.blockEntries.map((blockEntry) => {
          const block = blocks[blockEntry.blockIndex];
          if (!block) return null;

          const index = blockEntry.blockIndex;
          const isBreakBlock = blockEntry.isBreakBlock;
          const stepOrder = contentOrderByBlockId[blockEntry.blockId];
          const stepNumber = typeof stepOrder === "number" ? stepOrder + 1 : null;
          const isExpanded = !isBreakBlock && expandedBlockId === block.id;
          const breakLabel = blockEntry.breakLabel ?? FALLBACK_BREAK_LABEL;
          const insertionMarker = editorSurface.insertionMarkers[index];

          return (
            <Fragment key={block.id}>
              {markerRenderer({
                index,
                isActive: insertionMarker?.isActive ?? false,
                onSelect: () => onInsertionIndexChange(index),
              })}

              <div
                className={cn(
                  "group rounded-lg border bg-white/5",
                  isBreakBlock
                    ? "min-h-9 border-dashed border-[var(--theme-accent)] bg-[var(--theme-accent-soft)] px-3 py-2"
                    : "border-[var(--theme-border)] p-3"
                )}
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData("text/plain", block.id);
                }}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  const fromId = event.dataTransfer.getData("text/plain");
                  if (!fromId || fromId === block.id) return;
                  onMoveBlock(fromId, block.id);
                }}
              >
                <div className={cn("flex items-start gap-2", isBreakBlock && "items-center")}>
                  <div className="text-white/40">
                    <GripVertical className="h-4 w-4" />
                  </div>

                  {isBreakBlock ? (
                    <span className="flex-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--theme-text)]">
                      {breakLabel}
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="min-h-11 min-w-0 flex-1 rounded-md px-1 py-1 text-left hover:bg-white/5"
                      onClick={() =>
                        onExpandedBlockChange(isExpanded ? null : block.id)
                      }
                    >
                      <span className="text-xs font-semibold text-white">
                        Step {stepNumber}
                      </span>
                      <p className="mt-1 truncate text-[11px] text-white/45">
                        {blockEntry.preview}
                      </p>
                    </button>
                  )}

                  {!isBreakBlock && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-11 w-11 text-white/60 hover:text-white"
                      onClick={() =>
                        onExpandedBlockChange(isExpanded ? null : block.id)
                      }
                      aria-label={isExpanded ? "블록 접기" : "블록 펼치기"}
                    >
                      <ChevronDown
                        className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")}
                      />
                    </Button>
                  )}

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-11 w-11 text-white/50 hover:text-white"
                      onClick={() => onMoveBlockByIndex(index, -1)}
                      disabled={index === 0}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-11 w-11 text-white/50 hover:text-white"
                      onClick={() => onMoveBlockByIndex(index, 1)}
                      disabled={index === blocks.length - 1}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-11 w-11 text-white/50 hover:text-white"
                      onClick={() => onDeleteBlock(block.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {!isBreakBlock && isExpanded && renderExpandedContent && (
                  <div className="mt-3">
                    {renderExpandedContent({
                      block,
                      blockEntry,
                      index,
                      stepNumber,
                      isExpanded,
                    })}
                  </div>
                )}
              </div>
            </Fragment>
          );
        })}

        {markerRenderer({
          index: blocks.length,
          isActive: editorSurface.insertionMarkers[blocks.length]?.isActive ?? false,
          onSelect: () => onInsertionIndexChange(blocks.length),
        })}
      </div>
    </section>
  );
}
