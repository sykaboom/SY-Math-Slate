"use client";

import { useState } from "react";

import {
  exportStudioDraftBundle,
  importStudioDraftBundle,
} from "@features/mod-studio/io/ioStudio";
import { useModStudioStore } from "@features/store/useModStudioStore";

export function IoStudioSection() {
  const draft = useModStudioStore((state) => state.draft);
  const setDraftBundle = useModStudioStore((state) => state.setDraftBundle);
  const setLastPublishResult = useModStudioStore(
    (state) => state.setLastPublishResult
  );
  const [payload, setPayload] = useState<string>("");

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
    <div className="grid gap-3 text-xs text-white/85">
      <div className="text-[11px] uppercase tracking-[0.18em] text-white/60">
        JSON Import / Export
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleExport}
          className="rounded border border-white/20 px-2 py-1 text-[11px] text-white/80 hover:bg-white/10"
        >
          Export
        </button>
        <button
          type="button"
          onClick={handleImport}
          className="rounded border border-white/20 px-2 py-1 text-[11px] text-white/80 hover:bg-white/10"
        >
          Import
        </button>
      </div>
      <textarea
        value={payload}
        onChange={(event) => setPayload(event.target.value)}
        className="h-64 w-full rounded border border-white/20 bg-black/50 p-2 font-mono text-[11px] text-white/90"
        spellCheck={false}
      />
    </div>
  );
}
