"use client";

import { useState } from "react";

import {
  applyThemeDraftPreview,
  toGlobalThemeVariable,
  toModuleScopedThemeVariable,
} from "@features/mod-studio/theme/themeIsolation";
import { useModStudioStore } from "@features/store/useModStudioStore";

export function ThemeStudioSection() {
  const themeDraft = useModStudioStore((state) => state.draft.theme);
  const setThemeToken = useModStudioStore((state) => state.setThemeToken);
  const setModuleThemeToken = useModStudioStore((state) => state.setModuleThemeToken);
  const [globalTokenKey, setGlobalTokenKey] = useState("surface");
  const [globalTokenValue, setGlobalTokenValue] = useState("#111827");
  const [moduleId, setModuleId] = useState("core-toolbar");
  const [moduleTokenKey, setModuleTokenKey] = useState("accent");
  const [moduleTokenValue, setModuleTokenValue] = useState("#22d3ee");

  const preview = () => {
    applyThemeDraftPreview(themeDraft.globalTokens, themeDraft.moduleScopedTokens);
  };

  return (
    <div className="grid gap-3 text-xs text-white/85">
      <div className="text-[11px] uppercase tracking-[0.18em] text-white/60">
        Theme Tokens
      </div>

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
        className="w-fit rounded border border-cyan-400/40 bg-cyan-500/15 px-2 py-1 text-[11px] text-cyan-100 hover:bg-cyan-500/25"
      >
        Apply Preview
      </button>
    </div>
  );
}
