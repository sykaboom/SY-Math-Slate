"use client";

import { cn } from "@core/utils";

type PublicToggleProps = {
  isPublic: boolean;
  onChange: (nextValue: boolean) => void;
  disabled?: boolean;
};

export function PublicToggle({
  isPublic,
  onChange,
  disabled = false,
}: PublicToggleProps) {
  return (
    <button
      type="button"
      className={cn(
        "rounded-full border border-theme-border/10 px-3 py-1 text-[11px]",
        "transition-colors",
        disabled
          ? "cursor-not-allowed bg-theme-surface-soft text-theme-text/40"
          : isPublic
            ? "bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25"
            : "bg-theme-surface-soft text-theme-text/70 hover:bg-theme-surface/30"
      )}
      onClick={() => {
        if (disabled) return;
        onChange(!isPublic);
      }}
      disabled={disabled}
      aria-pressed={isPublic}
      aria-label="Toggle snapshot visibility"
      title={isPublic ? "Public snapshot" : "Private snapshot"}
    >
      {isPublic ? "Public" : "Private"}
    </button>
  );
}
