"use client";

import { useMemo, useState } from "react";

import { isThemePresetId, type ThemePresetId } from "@core/config/themeTokens";
import { getThemePreset, listThemePresets } from "@core/themes/presets";
import {
  applyThemeDraftPreview,
  toGlobalThemeVariable,
  toModuleScopedThemeVariable,
} from "@features/mod-studio/theme/themeIsolation";
import { useModStudioStore } from "@features/store/useModStudioStore";

export function ThemeStudioSection() {
  const themeDraft = useModStudioStore((state) => state.draft.theme);
  const setThemePreset = useModStudioStore((state) => state.setThemePreset);
  const setThemeToken = useModStudioStore((state) => state.setThemeToken);
  const setModuleThemeToken = useModStudioStore((state) => state.setModuleThemeToken);
  const presets = useMemo(() => listThemePresets(), []);
  const [globalTokenKey, setGlobalTokenKey] = useState("surface");
  const [globalTokenValue, setGlobalTokenValue] = useState("var(--theme-surface)");
  const [moduleId, setModuleId] = useState("core-toolbar");
  const [moduleTokenKey, setModuleTokenKey] = useState("accent");
  const [moduleTokenValue, setModuleTokenValue] = useState("var(--theme-accent)");

  const applyPreset = (nextPresetId: ThemePresetId) => {
    const preset = getThemePreset(nextPresetId);
    setThemePreset(nextPresetId);
    applyThemeDraftPreview(
      preset.globalTokens,
      preset.moduleScopedTokens,
      nextPresetId
    );
  };

  const preview = () => {
    applyThemeDraftPreview(
      themeDraft.globalTokens,
      themeDraft.moduleScopedTokens,
      themeDraft.presetId
    );
  };

  return (
    <div className="grid gap-3 text-xs text-white/85">
      <div className="text-[11px] uppercase tracking-[0.18em] text-white/60">
        Theme Tokens
      </div>

      <section className="grid gap-2 rounded border border-white/10 bg-white/5 p-2">
        <div className="text-[11px] font-semibold text-white/80">Preset</div>
        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
          <select
            value={themeDraft.presetId}
            onChange={(event) => {
              const nextValue = event.target.value;
              if (!isThemePresetId(nextValue)) return;
              applyPreset(nextValue);
            }}
            className="rounded border border-white/20 bg-black/40 px-2 py-1 text-xs text-white"
          >
            {presets.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => applyPreset(themeDraft.presetId)}
            className="rounded border border-white/20 px-2 py-1 text-[11px] text-white/80 hover:bg-white/10"
          >
            Apply Preset
          </button>
        </div>
      </section>

      <section className="grid gap-2 rounded border border-white/10 bg-white/5 p-2">
        <div className="text-[11px] font-semibold text-white/80">Global token</div>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            value={globalTokenKey}
            onChange={(event) => setGlobalTokenKey(event.target.value)}
            className="rounded border border-white/20 bg-black/40 px-2 py-1 text-xs text-white"
          />
          <input
            type="text"
            value={globalTokenValue}
            onChange={(event) => setGlobalTokenValue(event.target.value)}
            className="rounded border border-white/20 bg-black/40 px-2 py-1 text-xs text-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setThemeToken(globalTokenKey, globalTokenValue)}
            className="rounded border border-white/20 px-2 py-1 text-[11px] text-white/80 hover:bg-white/10"
          >
            Set Global
          </button>
          <span className="text-[11px] text-white/60">
            {toGlobalThemeVariable(globalTokenKey)}
          </span>
        </div>
      </section>

      <section className="grid gap-2 rounded border border-white/10 bg-white/5 p-2">
        <div className="text-[11px] font-semibold text-white/80">Module-scoped token</div>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            value={moduleId}
            onChange={(event) => setModuleId(event.target.value)}
            className="rounded border border-white/20 bg-black/40 px-2 py-1 text-xs text-white"
          />
          <input
            type="text"
            value={moduleTokenKey}
            onChange={(event) => setModuleTokenKey(event.target.value)}
            className="rounded border border-white/20 bg-black/40 px-2 py-1 text-xs text-white"
          />
          <input
            type="text"
            value={moduleTokenValue}
            onChange={(event) => setModuleTokenValue(event.target.value)}
            className="col-span-2 rounded border border-white/20 bg-black/40 px-2 py-1 text-xs text-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setModuleThemeToken(moduleId, moduleTokenKey, moduleTokenValue)
            }
            className="rounded border border-white/20 px-2 py-1 text-[11px] text-white/80 hover:bg-white/10"
          >
            Set Module Token
          </button>
          <span className="text-[11px] text-white/60">
            {toModuleScopedThemeVariable(moduleId, moduleTokenKey)}
          </span>
        </div>
      </section>

      <button
        type="button"
        onClick={preview}
        className="w-fit rounded border border-[var(--theme-border-strong)] bg-[var(--theme-accent-soft)] px-2 py-1 text-[11px] text-[var(--theme-text)] hover:bg-[var(--theme-accent-strong)]"
      >
        Apply Preview
      </button>
    </div>
  );
}
