"use client";

import type { LucideIcon } from "lucide-react";
import {
  Captions,
  Keyboard,
  LayoutGrid,
  Palette,
  PanelLeftOpen,
  SlidersHorizontal,
} from "lucide-react";

import { cn } from "@core/utils";
import { Button } from "@ui/components/button";
import { Popover, PopoverContent, PopoverTrigger } from "@ui/components/popover";

export type PanelLauncherEntry = {
  panelId: string;
  launcherId: string;
  title: string;
  description: string;
  icon: string;
  isOpen: boolean;
};

export type PanelLauncherProps = {
  entries: readonly PanelLauncherEntry[];
  onTogglePanelOpen: (panelId: string, nextOpen: boolean) => void;
  className?: string;
};

const ENTRY_ICON_BY_NAME: Record<string, LucideIcon> = {
  Keyboard,
  Captions,
  SlidersHorizontal,
  Palette,
};

const resolveLauncherIcon = (icon: string): LucideIcon =>
  ENTRY_ICON_BY_NAME[icon] ?? LayoutGrid;

export function PanelLauncher({
  entries,
  onTogglePanelOpen,
  className,
}: PanelLauncherProps) {
  if (entries.length === 0) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="패널 런처 열기"
          title="패널 런처 열기"
          className={cn(
            "h-14 w-14 rounded-full border-theme-border/20 bg-theme-surface/60 text-theme-text hover:bg-theme-surface/75",
            className
          )}
          data-layout-id="action_panel_launcher_toggle"
        >
          <PanelLeftOpen className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        sideOffset={12}
        className="w-[min(320px,calc(100vw-32px))] border-theme-border/15 bg-theme-surface/80 p-2 text-theme-text shadow-[0_18px_40px_rgba(0,0,0,0.5)] backdrop-blur-md"
      >
        <div className="px-2 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-theme-text/55">
          Panel Launcher
        </div>
        <div className="flex flex-col gap-1.5">
          {entries.map((entry) => {
            const EntryIcon = resolveLauncherIcon(entry.icon);
            const actionLabel = entry.isOpen ? "Close" : "Open";
            const actionBadgeClass = entry.isOpen
              ? "border-theme-border/35 bg-theme-surface-soft text-theme-text"
              : "border-theme-border/20 bg-theme-surface-soft text-theme-text/80";

            return (
              <Button
                key={entry.launcherId}
                type="button"
                variant="ghost"
                className="h-11 w-full items-center justify-start gap-2 rounded-lg border border-theme-border/10 px-2.5 text-left text-theme-text hover:bg-theme-surface-soft"
                onClick={() => onTogglePanelOpen(entry.panelId, !entry.isOpen)}
                data-layout-id={`action_panel_launcher_${entry.launcherId}`}
              >
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-theme-border/15 bg-theme-surface-soft">
                  <EntryIcon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-theme-text">
                    {entry.title}
                  </span>
                  <span className="block truncate text-[11px] text-theme-text/60">
                    {entry.description}
                  </span>
                </span>
                <span
                  className={cn(
                    "inline-flex h-7 min-w-11 shrink-0 items-center justify-center rounded-full border px-2 text-[10px] font-semibold uppercase tracking-[0.12em]",
                    actionBadgeClass
                  )}
                >
                  {actionLabel}
                </span>
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
