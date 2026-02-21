"use client";

import { useCallback } from "react";

import type {
  ThemeGlobalTokenMap,
  ThemeModuleScopedTokenMap,
} from "@core/ui/theming/tokens/themeTokens";

import { serializeThemeJson, toThemeJsonFilename } from "./themeJsonIO";

type ThemeExportButtonProps = {
  label: string;
  description: string;
  globalTokens: ThemeGlobalTokenMap;
  moduleScopedTokens: ThemeModuleScopedTokenMap;
  onStatusChange: (message: string) => void;
};

export function ThemeExportButton({
  label,
  description,
  globalTokens,
  moduleScopedTokens,
  onStatusChange,
}: ThemeExportButtonProps) {
  const handleExport = useCallback(() => {
    const serialized = serializeThemeJson({
      label,
      description,
      globalTokens,
      moduleScopedTokens,
    });

    if (!serialized.ok) {
      onStatusChange(serialized.error);
      return;
    }
    if (!serialized.json) {
      onStatusChange("Theme export failed. No JSON payload generated.");
      return;
    }

    if (typeof window === "undefined") {
      onStatusChange("Theme export is only available in browser runtime.");
      return;
    }

    const blob = new Blob([serialized.json], {
      type: "application/json;charset=utf-8",
    });
    const url = window.URL.createObjectURL(blob);
    const anchor = window.document.createElement("a");
    anchor.href = url;
    anchor.download = toThemeJsonFilename(serialized.value.label);
    window.document.body.appendChild(anchor);
    anchor.click();
    window.document.body.removeChild(anchor);
    window.URL.revokeObjectURL(url);

    onStatusChange(`Exported theme \"${serialized.value.label}\".`);
  }, [description, globalTokens, label, moduleScopedTokens, onStatusChange]);

  return (
    <button
      type="button"
      onClick={handleExport}
      className="rounded border border-theme-border/20 px-2 py-1 text-[11px] text-theme-text/80 hover:bg-theme-surface-soft"
    >
      Export JSON
    </button>
  );
}
