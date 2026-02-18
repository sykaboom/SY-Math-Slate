"use client";

import { useMemo } from "react";

import { listThemePresets } from "@core/themes/presets";
import { cn } from "@core/utils";
import { useThemeStore } from "@features/store/useThemeStore";

export function ThemePickerPanel() {
  const activePresetId = useThemeStore((state) => state.activePresetId);
  const setPreset = useThemeStore((state) => state.setPreset);
  const presets = useMemo(() => listThemePresets().slice(0, 3), []);

  return (
    <section className="flex h-full w-full flex-col gap-2 p-3">
      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-theme-text/65">
        Theme Presets
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-3 gap-2">
        {presets.map((preset) => {
          const isActive = preset.id === activePresetId;
          return (
            <button
              key={preset.id}
              type="button"
              aria-pressed={isActive}
              className={cn(
                "flex min-h-0 flex-col gap-2 rounded-lg border px-2 py-2 text-left transition",
                isActive
                  ? "border-[var(--theme-accent)] bg-[var(--theme-accent-soft)]"
                  : "border-theme-border/20 bg-theme-surface-soft hover:border-theme-border/35"
              )}
              onClick={() => setPreset(preset.id)}
            >
              <div className="grid h-12 w-full grid-rows-3 overflow-hidden rounded-md border border-theme-border/20">
                <span style={{ backgroundColor: preset.globalTokens.surface }} />
                <span style={{ backgroundColor: preset.globalTokens.accent }} />
                <span style={{ backgroundColor: preset.globalTokens.text }} />
              </div>
              <div className="min-w-0">
                <div className="truncate text-[11px] font-semibold text-theme-text">
                  {preset.label}
                </div>
                <div className="truncate text-[10px] text-theme-text/60">
                  {preset.id}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
