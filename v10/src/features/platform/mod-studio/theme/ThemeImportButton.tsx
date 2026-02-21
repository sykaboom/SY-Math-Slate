"use client";

import { useCallback, useRef, type ChangeEvent } from "react";

import {
  parseThemeJsonText,
  type ThemeJsonDocument,
} from "./themeJsonIO";

type ThemeImportButtonProps = {
  onImportTheme: (theme: ThemeJsonDocument) => void;
  onStatusChange: (message: string) => void;
};

const MAX_THEME_JSON_BYTES = 1024 * 1024;

export function ThemeImportButton({
  onImportTheme,
  onStatusChange,
}: ThemeImportButtonProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelection = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;

      if (file.size > MAX_THEME_JSON_BYTES) {
        onStatusChange("Theme JSON exceeds 1MB and was not imported.");
        return;
      }

      let rawText = "";
      try {
        rawText = await file.text();
      } catch {
        onStatusChange("Unable to read selected file. Import was not applied.");
        return;
      }

      const parsed = parseThemeJsonText(rawText);
      if (!parsed.ok) {
        onStatusChange(parsed.error);
        return;
      }

      onImportTheme(parsed.value);
    },
    [onImportTheme, onStatusChange]
  );

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        onChange={handleFileSelection}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="rounded border border-theme-border/20 px-2 py-1 text-[11px] text-theme-text/80 hover:bg-theme-surface-soft"
      >
        Import JSON
      </button>
    </>
  );
}
