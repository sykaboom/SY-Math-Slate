"use client";

import { cn } from "@core/utils";
import type { InputStudioActionsSectionProps } from "@features/input-studio/hooks/types";
import { Button } from "@ui/components/button";

const DEFAULT_CLOSE_LABEL = "닫기";
const DEFAULT_RESTORE_LABEL = "되돌리기";
const DEFAULT_AUTO_LAYOUT_LABEL = "Auto Layout";
const DEFAULT_AUTO_LAYOUT_RUNNING_LABEL = "배치 중...";
const DEFAULT_APPLY_LABEL = "캔버스에 적용";

export function InputStudioActionsSection({
  onClose,
  onRestoreLayoutSnapshot,
  canRestoreLayoutSnapshot = false,
  onAutoLayout,
  isAutoLayoutRunning = false,
  onApply,
  canApply,
  unmatchedBlockCount = 0,
  onRestoreUnmatchedBlocks,
  onDiscardUnmatchedBlocks,
  closeLabel = DEFAULT_CLOSE_LABEL,
  restoreLabel = DEFAULT_RESTORE_LABEL,
  autoLayoutLabel = DEFAULT_AUTO_LAYOUT_LABEL,
  autoLayoutRunningLabel = DEFAULT_AUTO_LAYOUT_RUNNING_LABEL,
  applyLabel = DEFAULT_APPLY_LABEL,
  unmatchedTitle,
  unmatchedBody,
  className,
}: InputStudioActionsSectionProps) {
  const hasUnmatchedBlocks = unmatchedBlockCount > 0;
  const fallbackUnmatchedTitle = `보존 블록 ${unmatchedBlockCount}개가 임시 보관 중입니다.`;
  const fallbackUnmatchedBody =
    "적용 전 복원 또는 폐기를 선택해야 데이터 유실 없이 진행됩니다.";

  return (
    <>
      {hasUnmatchedBlocks && (
        <div className="mt-3 rounded-lg border border-[var(--theme-warning)] bg-[var(--theme-warning-soft)] p-3 text-[var(--theme-text)]">
          <p className="text-xs font-semibold">
            {unmatchedTitle ?? fallbackUnmatchedTitle}
          </p>
          <p className="mt-1 text-[11px] text-[var(--theme-text-muted)]">
            {unmatchedBody ?? fallbackUnmatchedBody}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="h-10 border-[var(--theme-warning)] text-xs text-[var(--theme-text)] hover:bg-[var(--theme-warning-soft)]"
              onClick={onRestoreUnmatchedBlocks}
              disabled={!onRestoreUnmatchedBlocks}
            >
              보존 블록 복원
            </Button>
            <Button
              variant="ghost"
              className="h-10 text-xs text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
              onClick={onDiscardUnmatchedBlocks}
              disabled={!onDiscardUnmatchedBlocks}
            >
              보존 블록 폐기
            </Button>
          </div>
        </div>
      )}

      <div
        data-layout-id="region_drafting_actions"
        className={cn(
          "sticky bottom-0 mt-4 border-t border-[var(--theme-border)] bg-[var(--theme-surface-overlay)] pb-[env(safe-area-inset-bottom)] pt-3 xl:bg-[var(--theme-surface-soft)]",
          className
        )}
      >
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="ghost"
            className="h-11 border border-theme-border/20 bg-theme-surface-soft text-theme-text/70 hover:bg-theme-surface-soft"
            onClick={onClose}
          >
            {closeLabel}
          </Button>
          <Button
            variant="ghost"
            className="h-11 border border-theme-border/20 bg-theme-surface-soft text-theme-text/70 hover:bg-theme-surface-soft"
            onClick={onRestoreLayoutSnapshot}
            disabled={!canRestoreLayoutSnapshot || !onRestoreLayoutSnapshot}
          >
            {restoreLabel}
          </Button>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="h-11 border-[var(--theme-accent)] bg-[var(--theme-accent-soft)] text-[var(--theme-text)] hover:bg-[var(--theme-accent-strong)]"
            onClick={onAutoLayout}
            disabled={isAutoLayoutRunning || !onAutoLayout}
          >
            {isAutoLayoutRunning ? autoLayoutRunningLabel : autoLayoutLabel}
          </Button>
          <Button
            className="h-11 bg-[var(--theme-accent)] text-[var(--theme-accent-text)] hover:bg-[var(--theme-accent-strong)] disabled:bg-[var(--theme-surface-soft)] disabled:text-[var(--theme-text-subtle)]"
            onClick={onApply}
            disabled={!canApply}
          >
            {applyLabel}
          </Button>
        </div>
      </div>
    </>
  );
}
