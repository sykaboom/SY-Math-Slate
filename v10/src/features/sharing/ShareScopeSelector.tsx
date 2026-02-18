"use client";

import type { SnapshotScope } from "@core/types/snapshot";
import { cn } from "@core/utils";

type ShareScopeSelectorProps = {
  scope: SnapshotScope;
  selectedLayerCount: number;
  disabled?: boolean;
  onScopeChange: (scope: SnapshotScope) => void;
  onOpenLayerPicker: () => void;
};

const SCOPE_OPTIONS: Array<{ id: SnapshotScope; label: string; title: string }> = [
  {
    id: "full_canvas",
    label: "Full",
    title: "Share the full canvas",
  },
  {
    id: "selected_layer",
    label: "Layer",
    title: "Share selected layer only",
  },
  {
    id: "viewport_only",
    label: "Viewport",
    title: "Share only what is visible in the current viewport",
  },
];

export function ShareScopeSelector({
  scope,
  selectedLayerCount,
  disabled = false,
  onScopeChange,
  onOpenLayerPicker,
}: ShareScopeSelectorProps) {
  const layerLabel = selectedLayerCount > 0 ? `${selectedLayerCount} selected` : "Pick layer";

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-1 rounded-full border border-theme-border/10 bg-theme-surface-soft px-1 py-1">
        {SCOPE_OPTIONS.map((option) => {
          const isActive = scope === option.id;
          return (
            <button
              key={option.id}
              type="button"
              className={cn(
                "rounded-full px-2 py-1 text-[10px] transition-colors",
                disabled
                  ? "cursor-not-allowed text-theme-text/35"
                  : isActive
                    ? "bg-theme-surface/50 text-theme-text"
                    : "text-theme-text/60 hover:bg-theme-surface/30"
              )}
              onClick={() => {
                if (disabled) return;
                onScopeChange(option.id);
              }}
              disabled={disabled}
              aria-pressed={isActive}
              aria-label={option.title}
              title={option.title}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {scope === "selected_layer" ? (
        <button
          type="button"
          className={cn(
            "rounded-full border border-theme-border/10 px-2 py-1 text-[10px] transition-colors",
            disabled
              ? "cursor-not-allowed bg-theme-surface-soft text-theme-text/35"
              : "bg-theme-surface-soft text-theme-text/70 hover:bg-theme-surface/30"
          )}
          onClick={() => {
            if (disabled) return;
            onOpenLayerPicker();
          }}
          disabled={disabled}
          aria-label="Pick shared layer"
          title="Pick shared layer"
        >
          {layerLabel}
        </button>
      ) : null}
    </div>
  );
}
