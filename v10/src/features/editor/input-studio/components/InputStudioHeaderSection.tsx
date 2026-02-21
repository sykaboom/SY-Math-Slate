"use client";

import { X } from "lucide-react";

import { cn } from "@core/utils";
import type { InputStudioHeaderSectionProps } from "@features/editor/input-studio/hooks/types";
import { Button } from "@ui/components/button";

const DEFAULT_TITLE = "데이터 입력";
const DEFAULT_SUBTITLE = "한 줄 = 한 블록 (step)";
const DEFAULT_COMPACT_LABEL = "간단";
const DEFAULT_ADVANCED_LABEL = "상세";
const DEFAULT_CLOSE_LABEL = "닫기";

export function InputStudioHeaderSection({
  mode,
  onModeChange,
  onClose,
  title = DEFAULT_TITLE,
  subtitle = DEFAULT_SUBTITLE,
  compactLabel = DEFAULT_COMPACT_LABEL,
  advancedLabel = DEFAULT_ADVANCED_LABEL,
  closeLabel = DEFAULT_CLOSE_LABEL,
  className,
}: InputStudioHeaderSectionProps) {
  const isAdvancedMode = mode === "advanced";

  return (
    <div
      data-layout-id="region_drafting_header"
      className={cn("mb-4 flex items-center justify-between", className)}
    >
      <div>
        <p className="text-sm font-semibold text-theme-text">{title}</p>
        <p className="text-xs text-theme-text/50">{subtitle}</p>
        <div className="mt-2 inline-flex items-center rounded-full border border-theme-border/15 bg-theme-surface/40 p-1">
          <button
            type="button"
            className={cn(
              "h-11 min-w-[84px] rounded-full px-4 text-xs font-semibold transition-colors",
              isAdvancedMode
                ? "text-theme-text/60 hover:bg-theme-surface-soft hover:text-theme-text"
                : "bg-[var(--theme-accent)] text-[var(--theme-accent-text)]"
            )}
            onClick={() => onModeChange("compact")}
            data-layout-id="action_mode_compact"
          >
            {compactLabel}
          </button>
          <button
            type="button"
            className={cn(
              "h-11 min-w-[84px] rounded-full px-4 text-xs font-semibold transition-colors",
              isAdvancedMode
                ? "bg-[var(--theme-accent)] text-[var(--theme-accent-text)]"
                : "text-theme-text/60 hover:bg-theme-surface-soft hover:text-theme-text"
            )}
            onClick={() => onModeChange("advanced")}
            data-layout-id="action_mode_advanced"
          >
            {advancedLabel}
          </button>
        </div>
      </div>
      <Button
        data-layout-id="action_return_to_canvas"
        variant="ghost"
        size="icon"
        className="h-11 w-11 text-theme-text/70 hover:text-theme-text"
        onClick={onClose}
        aria-label={closeLabel}
      >
        <X className="h-5 w-5" />
      </Button>
    </div>
  );
}
