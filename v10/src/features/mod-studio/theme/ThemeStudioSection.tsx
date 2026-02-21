"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { isThemePresetId, type ThemeGlobalTokenKey, type ThemePresetId } from "@core/ui/theming/tokens/themeTokens";
import { getThemePreset, listThemePresets, saveCustomThemePreset } from "@core/ui/theming/presets/presets";
import {
  applyThemeDraftPreview,
  toGlobalThemeVariable,
  toModuleScopedThemeVariable,
} from "@features/mod-studio/theme/themeIsolation";
import { useModStudioStore } from "@features/store/useModStudioStore";
import { useTokenDraftStore } from "@features/store/useTokenDraftStore";

import { AIThemeGenerationPanel } from "./AIThemeGenerationPanel";
import { ThemeExportButton } from "./ThemeExportButton";
import { ThemeImportButton } from "./ThemeImportButton";
import { TokenEditorPanel } from "./TokenEditorPanel";
import type { ThemeJsonDocument } from "./themeJsonIO";

type ThemeEditorMode = "basic" | "advanced" | "ai";

export function ThemeStudioSection() {
  const themeDraft = useModStudioStore((state) => state.draft.theme);
  const setThemePreset = useModStudioStore((state) => state.setThemePreset);
  const setThemeToken = useModStudioStore((state) => state.setThemeToken);
  const setModuleThemeToken = useModStudioStore((state) => state.setModuleThemeToken);

  const presets = useMemo(() => listThemePresets(), []);
  const activePreset = useMemo(
    () =>
      presets.find((preset) => preset.id === themeDraft.presetId) ??
      getThemePreset(themeDraft.presetId),
    [presets, themeDraft.presetId]
  );
  const [editorMode, setEditorMode] = useState<ThemeEditorMode>("basic");
  const [saveStatusMessage, setSaveStatusMessage] = useState("");
  const [ioStatusMessage, setIoStatusMessage] = useState("");

  const [globalTokenKey, setGlobalTokenKey] = useState("surface");
  const [globalTokenValue, setGlobalTokenValue] = useState("var(--theme-surface)");
  const [moduleId, setModuleId] = useState("core-toolbar");
  const [moduleTokenKey, setModuleTokenKey] = useState("accent");
  const [moduleTokenValue, setModuleTokenValue] = useState("var(--theme-accent)");
  const seededPresetIdRef = useRef<ThemePresetId | null>(null);

  const draftGlobalTokens = useTokenDraftStore((state) => state.draftGlobalTokens);
  const baseGlobalTokens = useTokenDraftStore((state) => state.baseGlobalTokens);
  const initializeDraft = useTokenDraftStore((state) => state.initializeDraft);
  const setTokenDraftValue = useTokenDraftStore((state) => state.setTokenDraftValue);
  const resetDraft = useTokenDraftStore((state) => state.resetDraft);

  useEffect(() => {
    if (seededPresetIdRef.current === themeDraft.presetId) return;
    seededPresetIdRef.current = themeDraft.presetId;
    initializeDraft(themeDraft.presetId, themeDraft.globalTokens);
  }, [initializeDraft, themeDraft.globalTokens, themeDraft.presetId]);

  useEffect(() => {
    if (editorMode !== "advanced") return;
    const timerId = setTimeout(() => {
      applyThemeDraftPreview(
        draftGlobalTokens,
        themeDraft.moduleScopedTokens,
        themeDraft.presetId
      );
    }, 100);
    return () => clearTimeout(timerId);
  }, [
    draftGlobalTokens,
    editorMode,
    themeDraft.moduleScopedTokens,
    themeDraft.presetId,
  ]);

  const applyPreset = (nextPresetId: ThemePresetId) => {
    const preset = getThemePreset(nextPresetId);
    setThemePreset(nextPresetId);
    initializeDraft(preset.id, preset.globalTokens);
    setSaveStatusMessage("");
    setIoStatusMessage("");
    applyThemeDraftPreview(
      preset.globalTokens,
      preset.moduleScopedTokens,
      nextPresetId
    );
  };

  const preview = useCallback(() => {
    applyThemeDraftPreview(
      themeDraft.globalTokens,
      themeDraft.moduleScopedTokens,
      themeDraft.presetId
    );
  }, [themeDraft.globalTokens, themeDraft.moduleScopedTokens, themeDraft.presetId]);

  const previewAdvancedDraft = useCallback(() => {
    applyThemeDraftPreview(
      draftGlobalTokens,
      themeDraft.moduleScopedTokens,
      themeDraft.presetId
    );
  }, [draftGlobalTokens, themeDraft.moduleScopedTokens, themeDraft.presetId]);

  const onAdvancedTokenChange = useCallback(
    (tokenKey: ThemeGlobalTokenKey, tokenValue: string) => {
      setTokenDraftValue(tokenKey, tokenValue);
      setThemeToken(tokenKey, tokenValue);
    },
    [setThemeToken, setTokenDraftValue]
  );

  const saveTokenDraftAsPreset = useCallback(
    (presetLabel: string): boolean => {
      const normalizedLabel = presetLabel.trim();
      if (!normalizedLabel) {
        setSaveStatusMessage("Preset name is required.");
        return false;
      }
      const savedPreset = saveCustomThemePreset({
        label: normalizedLabel,
        basePresetId: themeDraft.presetId,
        globalTokens: draftGlobalTokens,
        moduleScopedTokens: themeDraft.moduleScopedTokens,
      });
      if (!savedPreset) {
        setSaveStatusMessage("Failed to save custom preset.");
        return false;
      }
      setSaveStatusMessage(`Saved preset "${savedPreset.label}".`);
      return true;
    },
    [
      draftGlobalTokens,
      themeDraft.moduleScopedTokens,
      themeDraft.presetId,
      setSaveStatusMessage,
    ]
  );

  const importThemeJson = useCallback(
    (importedTheme: ThemeJsonDocument) => {
      const savedPreset = saveCustomThemePreset({
        label: importedTheme.label,
        description: importedTheme.description,
        basePresetId: themeDraft.presetId,
        globalTokens: importedTheme.globalTokens,
        moduleScopedTokens: importedTheme.moduleScopedTokens,
      });
      if (!savedPreset) {
        setIoStatusMessage("Failed to save imported theme as custom preset.");
        return;
      }

      const allGlobalTokenKeys = new Set<string>([
        ...Object.keys(themeDraft.globalTokens),
        ...Object.keys(savedPreset.globalTokens),
      ]);
      allGlobalTokenKeys.forEach((tokenKey) => {
        setThemeToken(tokenKey, savedPreset.globalTokens[tokenKey] ?? "");
      });

      const allModuleIds = new Set<string>([
        ...Object.keys(themeDraft.moduleScopedTokens),
        ...Object.keys(savedPreset.moduleScopedTokens),
      ]);
      allModuleIds.forEach((nextModuleId) => {
        const currentTokens = themeDraft.moduleScopedTokens[nextModuleId] ?? {};
        const importedTokens = savedPreset.moduleScopedTokens[nextModuleId] ?? {};
        const allModuleTokenKeys = new Set<string>([
          ...Object.keys(currentTokens),
          ...Object.keys(importedTokens),
        ]);
        allModuleTokenKeys.forEach((tokenKey) => {
          setModuleThemeToken(nextModuleId, tokenKey, importedTokens[tokenKey] ?? "");
        });
      });

      initializeDraft(themeDraft.presetId, savedPreset.globalTokens);
      applyThemeDraftPreview(
        savedPreset.globalTokens,
        savedPreset.moduleScopedTokens,
        themeDraft.presetId
      );

      setSaveStatusMessage("");
      setIoStatusMessage(`Imported and applied "${savedPreset.label}".`);
    },
    [
      initializeDraft,
      setModuleThemeToken,
      setThemeToken,
      themeDraft.globalTokens,
      themeDraft.moduleScopedTokens,
      themeDraft.presetId,
    ]
  );

  const resetAdvancedDraft = useCallback(() => {
    const allKeys = new Set<string>([
      ...Object.keys(themeDraft.globalTokens),
      ...Object.keys(baseGlobalTokens),
    ]);
    allKeys.forEach((tokenKey) => {
      setThemeToken(tokenKey, baseGlobalTokens[tokenKey] ?? "");
    });
    resetDraft();
    setSaveStatusMessage("Advanced token draft reset.");
    applyThemeDraftPreview(
      baseGlobalTokens,
      themeDraft.moduleScopedTokens,
      themeDraft.presetId
    );
  }, [
    baseGlobalTokens,
    resetDraft,
    setThemeToken,
    themeDraft.globalTokens,
    themeDraft.moduleScopedTokens,
    themeDraft.presetId,
  ]);

  return (
    <div className="grid gap-3 text-xs text-theme-text/85">
      <div className="text-[11px] uppercase tracking-[0.18em] text-theme-text/60">
        Theme Tokens
      </div>

      <section className="grid gap-2 rounded border border-theme-border/10 bg-theme-surface-soft p-2">
        <div className="text-[11px] font-semibold text-theme-text/80">Preset</div>
        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
          <select
            value={themeDraft.presetId}
            onChange={(event) => {
              const nextValue = event.target.value;
              if (!isThemePresetId(nextValue)) return;
              applyPreset(nextValue);
            }}
            className="rounded border border-theme-border/20 bg-theme-surface/40 px-2 py-1 text-xs text-theme-text"
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
            className="rounded border border-theme-border/20 px-2 py-1 text-[11px] text-theme-text/80 hover:bg-theme-surface-soft"
          >
            Apply Preset
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <ThemeExportButton
            label={activePreset.label}
            description={activePreset.description}
            globalTokens={themeDraft.globalTokens}
            moduleScopedTokens={themeDraft.moduleScopedTokens}
            onStatusChange={setIoStatusMessage}
          />
          <ThemeImportButton
            onImportTheme={importThemeJson}
            onStatusChange={setIoStatusMessage}
          />
        </div>
        {ioStatusMessage ? (
          <div className="text-[10px] text-theme-text/65">{ioStatusMessage}</div>
        ) : null}
      </section>

      <div className="grid grid-cols-3 gap-2 rounded border border-theme-border/10 bg-theme-surface-soft p-1">
        <button
          type="button"
          onClick={() => setEditorMode("basic")}
          aria-pressed={editorMode === "basic"}
          className={`rounded px-2 py-1 text-[11px] font-medium transition ${
            editorMode === "basic"
              ? "bg-theme-accent-soft text-theme-text"
              : "text-theme-text/70 hover:bg-theme-surface/40"
          }`}
        >
          Basic
        </button>
        <button
          type="button"
          onClick={() => {
            initializeDraft(themeDraft.presetId, themeDraft.globalTokens);
            setEditorMode("advanced");
          }}
          aria-pressed={editorMode === "advanced"}
          className={`rounded px-2 py-1 text-[11px] font-medium transition ${
            editorMode === "advanced"
              ? "bg-theme-accent-soft text-theme-text"
              : "text-theme-text/70 hover:bg-theme-surface/40"
          }`}
        >
          Advanced
        </button>
        <button
          type="button"
          onClick={() => setEditorMode("ai")}
          aria-pressed={editorMode === "ai"}
          className={`rounded px-2 py-1 text-[11px] font-medium transition ${
            editorMode === "ai"
              ? "bg-theme-accent-soft text-theme-text"
              : "text-theme-text/70 hover:bg-theme-surface/40"
          }`}
        >
          AI 생성
        </button>
      </div>

      {editorMode === "basic" ? (
        <>
          <section className="grid gap-2 rounded border border-theme-border/10 bg-theme-surface-soft p-2">
            <div className="text-[11px] font-semibold text-theme-text/80">
              Global token
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={globalTokenKey}
                onChange={(event) => setGlobalTokenKey(event.target.value)}
                className="rounded border border-theme-border/20 bg-theme-surface/40 px-2 py-1 text-xs text-theme-text"
              />
              <input
                type="text"
                value={globalTokenValue}
                onChange={(event) => setGlobalTokenValue(event.target.value)}
                className="rounded border border-theme-border/20 bg-theme-surface/40 px-2 py-1 text-xs text-theme-text"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setThemeToken(globalTokenKey, globalTokenValue)}
                className="rounded border border-theme-border/20 px-2 py-1 text-[11px] text-theme-text/80 hover:bg-theme-surface-soft"
              >
                Set Global
              </button>
              <span className="text-[11px] text-theme-text/60">
                {toGlobalThemeVariable(globalTokenKey)}
              </span>
            </div>
          </section>

          <section className="grid gap-2 rounded border border-theme-border/10 bg-theme-surface-soft p-2">
            <div className="text-[11px] font-semibold text-theme-text/80">
              Module-scoped token
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={moduleId}
                onChange={(event) => setModuleId(event.target.value)}
                className="rounded border border-theme-border/20 bg-theme-surface/40 px-2 py-1 text-xs text-theme-text"
              />
              <input
                type="text"
                value={moduleTokenKey}
                onChange={(event) => setModuleTokenKey(event.target.value)}
                className="rounded border border-theme-border/20 bg-theme-surface/40 px-2 py-1 text-xs text-theme-text"
              />
              <input
                type="text"
                value={moduleTokenValue}
                onChange={(event) => setModuleTokenValue(event.target.value)}
                className="col-span-2 rounded border border-theme-border/20 bg-theme-surface/40 px-2 py-1 text-xs text-theme-text"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setModuleThemeToken(moduleId, moduleTokenKey, moduleTokenValue)
                }
                className="rounded border border-theme-border/20 px-2 py-1 text-[11px] text-theme-text/80 hover:bg-theme-surface-soft"
              >
                Set Module Token
              </button>
              <span className="text-[11px] text-theme-text/60">
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
        </>
      ) : editorMode === "advanced" ? (
        <TokenEditorPanel
          tokens={draftGlobalTokens}
          onTokenChange={onAdvancedTokenChange}
          onApplyPreview={previewAdvancedDraft}
          onSavePreset={saveTokenDraftAsPreset}
          onReset={resetAdvancedDraft}
          saveStatusMessage={saveStatusMessage}
        />
      ) : (
        <AIThemeGenerationPanel
          onSavePreset={saveTokenDraftAsPreset}
          saveStatusMessage={saveStatusMessage}
        />
      )}
    </div>
  );
}
