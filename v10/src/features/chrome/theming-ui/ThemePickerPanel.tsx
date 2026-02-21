"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  CUSTOM_THEME_PRESET_STORAGE_KEY,
  CUSTOM_THEME_PRESET_UPDATED_EVENT,
  deleteCustomThemePreset,
  listCustomThemePresets,
  listThemePresets,
  type CustomThemePresetDefinition,
} from "@core/ui/theming/presets/presets";
import { cn } from "@core/utils";
import { useThemeStore } from "@features/platform/store/useThemeStore";

const sortByUpdatedAtDesc = (
  left: CustomThemePresetDefinition,
  right: CustomThemePresetDefinition
): number => right.updatedAt - left.updatedAt;

export function ThemePickerPanel() {
  const activePresetId = useThemeStore((state) => state.activePresetId);
  const setPreset = useThemeStore((state) => state.setPreset);
  const setTokenOverride = useThemeStore((state) => state.setTokenOverride);
  const setModuleTokenOverride = useThemeStore((state) => state.setModuleTokenOverride);
  const resetToPreset = useThemeStore((state) => state.resetToPreset);

  const presets = useMemo(() => listThemePresets(), []);
  const [customPresets, setCustomPresets] = useState<CustomThemePresetDefinition[]>(
    () => listCustomThemePresets().sort(sortByUpdatedAtDesc)
  );
  const [activeCustomPresetId, setActiveCustomPresetId] = useState<string | null>(
    null
  );

  const refreshCustomPresets = useCallback(() => {
    setCustomPresets(listCustomThemePresets().sort(sortByUpdatedAtDesc));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const onCustomPresetUpdated = () => refreshCustomPresets();
    const onStorage = (event: StorageEvent) => {
      if (event.key !== CUSTOM_THEME_PRESET_STORAGE_KEY) return;
      refreshCustomPresets();
    };

    window.addEventListener(CUSTOM_THEME_PRESET_UPDATED_EVENT, onCustomPresetUpdated);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(
        CUSTOM_THEME_PRESET_UPDATED_EVENT,
        onCustomPresetUpdated
      );
      window.removeEventListener("storage", onStorage);
    };
  }, [refreshCustomPresets]);

  const applyCustomPreset = useCallback(
    (preset: CustomThemePresetDefinition) => {
      resetToPreset(preset.basePresetId);
      Object.entries(preset.globalTokens).forEach(([tokenKey, tokenValue]) => {
        setTokenOverride(tokenKey, tokenValue);
      });
      Object.entries(preset.moduleScopedTokens).forEach(([moduleId, tokens]) => {
        Object.entries(tokens).forEach(([tokenKey, tokenValue]) => {
          setModuleTokenOverride(moduleId, tokenKey, tokenValue);
        });
      });
      setActiveCustomPresetId(preset.id);
    },
    [resetToPreset, setModuleTokenOverride, setTokenOverride]
  );

  const removeCustomPreset = useCallback(
    (presetId: string) => {
      const removed = deleteCustomThemePreset(presetId);
      if (!removed) return;
      if (activeCustomPresetId === presetId) {
        setActiveCustomPresetId(null);
      }
      refreshCustomPresets();
    },
    [activeCustomPresetId, refreshCustomPresets]
  );

  return (
    <section className="flex h-full w-full min-h-0 flex-col gap-2 p-3">
      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-theme-text/65">
        Theme Presets
      </div>

      <div className="grid min-h-0 flex-1 gap-3 overflow-y-auto pr-1">
        <div className="grid grid-cols-3 gap-2">
          {presets.map((preset) => {
            const isActive = preset.id === activePresetId && !activeCustomPresetId;
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
                onClick={() => {
                  setActiveCustomPresetId(null);
                  setPreset(preset.id);
                }}
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

        <div className="grid gap-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-theme-text/60">
            Custom Presets
          </div>
          {customPresets.length === 0 ? (
            <div className="rounded border border-dashed border-theme-border/25 bg-theme-surface-soft px-2 py-2 text-[10px] text-theme-text/55">
              No custom presets saved.
            </div>
          ) : (
            <div className="grid gap-2">
              {customPresets.map((preset) => {
                const isActive = preset.id === activeCustomPresetId;
                return (
                  <div
                    key={preset.id}
                    className={cn(
                      "grid gap-2 rounded-lg border px-2 py-2 transition",
                      isActive
                        ? "border-[var(--theme-accent)] bg-[var(--theme-accent-soft)]"
                        : "border-theme-border/20 bg-theme-surface-soft"
                    )}
                  >
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                      <button
                        type="button"
                        onClick={() => applyCustomPreset(preset)}
                        className="min-w-0 text-left"
                      >
                        <div className="truncate text-[11px] font-semibold text-theme-text">
                          {preset.label}
                        </div>
                        <div className="truncate text-[10px] text-theme-text/60">
                          Base: {preset.basePresetId}
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => removeCustomPreset(preset.id)}
                        className="rounded border border-theme-border/25 px-2 py-1 text-[10px] text-theme-text/65 hover:bg-theme-surface/50"
                      >
                        Delete
                      </button>
                    </div>
                    <div className="grid h-7 w-full grid-cols-3 overflow-hidden rounded border border-theme-border/20">
                      <span style={{ backgroundColor: preset.globalTokens.surface }} />
                      <span style={{ backgroundColor: preset.globalTokens.accent }} />
                      <span style={{ backgroundColor: preset.globalTokens.text }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
