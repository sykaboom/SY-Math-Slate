"use client";

import { useState } from "react";

import { AIModuleGenerationPanel } from "@features/platform/mod-studio/ai/AIModuleGenerationPanel";
import {
  exportStudioDraftBundle,
  importStudioDraftBundle,
} from "@features/platform/mod-studio/io/ioStudio";
import { useModStudioStore } from "@features/platform/store/useModStudioStore";

type IoEditorMode = "json" | "ai";

export function IoStudioSection() {
  const draft = useModStudioStore((state) => state.draft);
  const setDraftBundle = useModStudioStore((state) => state.setDraftBundle);
  const setLastPublishResult = useModStudioStore(
    (state) => state.setLastPublishResult
  );
  const [payload, setPayload] = useState<string>("");
  const [editorMode, setEditorMode] = useState<IoEditorMode>("json");

  const handleExport = () => {
    const next = exportStudioDraftBundle(draft);
    setPayload(next);
    setLastPublishResult({ ok: true, message: "export ready" });
  };

  const handleImport = () => {
    const result = importStudioDraftBundle(payload);
    if (!result.ok) {
      setLastPublishResult({ ok: false, message: result.error });
      return;
    }
    setDraftBundle(result.value);
    setLastPublishResult({
      ok: true,
      message:
        result.migratedFrom === null
          ? "import applied"
          : `import applied (migrated from v${result.migratedFrom})`,
    });
  };

  return (
    <div className="grid gap-3 text-xs text-theme-text/85">
      <div className="text-[11px] uppercase tracking-[0.18em] text-theme-text/60">IO</div>

      <div className="grid grid-cols-2 gap-2 rounded border border-theme-border/10 bg-theme-surface-soft p-1">
        <button
          type="button"
          onClick={() => setEditorMode("json")}
          aria-pressed={editorMode === "json"}
          className={`rounded px-2 py-1 text-[11px] font-medium transition ${
            editorMode === "json"
              ? "bg-theme-accent-soft text-theme-text"
              : "text-theme-text/70 hover:bg-theme-surface/40"
          }`}
        >
          JSON Import/Export
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

      {editorMode === "json" ? (
        <>
          <div className="text-[11px] uppercase tracking-[0.18em] text-theme-text/60">
            JSON Import / Export
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="rounded border border-theme-border/20 px-2 py-1 text-[11px] text-theme-text/80 hover:bg-theme-surface-soft"
            >
              Export
            </button>
            <button
              type="button"
              onClick={handleImport}
              className="rounded border border-theme-border/20 px-2 py-1 text-[11px] text-theme-text/80 hover:bg-theme-surface-soft"
            >
              Import
            </button>
          </div>
          <textarea
            value={payload}
            onChange={(event) => setPayload(event.target.value)}
            className="h-64 w-full rounded border border-theme-border/20 bg-theme-surface/50 p-2 font-mono text-[11px] text-theme-text/90"
            spellCheck={false}
          />
        </>
      ) : (
        <AIModuleGenerationPanel />
      )}
    </div>
  );
}
