"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { MoreHorizontal } from "lucide-react";

import { Popover, PopoverTrigger } from "@ui/components/popover";
import { cn } from "@core/utils";
import { COMPACT_MORE_PANEL_CLASSNAME } from "./compactToolbarSections";

import { ToolButton } from "./atoms/ToolButton";
import { ToolbarPanel } from "./atoms/ToolbarPanel";

type ThumbZoneDockProps = {
  controls: ReactNode;
  compact?: boolean;
  className?: string;
  expandedPanel?: ReactNode;
  expandedLabel?: string;
  expandedIcon?: LucideIcon;
  expandedOpen?: boolean;
  onExpandedOpenChange?: (open: boolean) => void;
  panelClassName?: string;
  beforeExpandedSlot?: ReactNode;
  afterExpandedSlot?: ReactNode;
};

export function ThumbZoneDock({
  controls,
  compact = false,
  className,
  expandedPanel,
  expandedLabel = "More",
  expandedIcon: ExpandedIcon = MoreHorizontal,
  expandedOpen,
  onExpandedOpenChange,
  panelClassName,
  beforeExpandedSlot,
  afterExpandedSlot,
}: ThumbZoneDockProps) {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-3xl border border-toolbar-border/10 bg-toolbar-surface/90 shadow-[var(--toolbar-shell-shadow)] backdrop-blur-md",
        compact ? "px-3 py-2" : "px-4 py-3",
        className
      )}
    >
      <div
        className={cn(
          "flex min-w-0 flex-1 items-center overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          compact ? "gap-1" : "gap-2"
        )}
      >
        {controls}
      </div>

      {beforeExpandedSlot}

      {expandedPanel ? (
        <Popover open={expandedOpen} onOpenChange={onExpandedOpenChange}>
          <PopoverTrigger asChild>
            <ToolButton icon={ExpandedIcon} label={expandedLabel} className="h-11 w-11 shrink-0" />
          </PopoverTrigger>
          <ToolbarPanel
            side="top"
            align="end"
            sideOffset={16}
            className={cn(COMPACT_MORE_PANEL_CLASSNAME, panelClassName)}
          >
            {expandedPanel}
          </ToolbarPanel>
        </Popover>
      ) : null}

      {afterExpandedSlot}
    </div>
  );
}
