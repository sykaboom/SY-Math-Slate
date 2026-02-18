"use client";

import { useState } from "react";

import type {
  ThemeGlobalTokenKey,
  ThemeGlobalTokenMap,
} from "@core/config/themeTokens";

import { toGlobalThemeVariable } from "./themeIsolation";
import { TokenColorPicker } from "./TokenColorPicker";

type TokenEditorPanelProps = {
  tokens: ThemeGlobalTokenMap;
  onTokenChange: (tokenKey: ThemeGlobalTokenKey, tokenValue: string) => void;
  onApplyPreview: () => void;
  onSavePreset: (presetLabel: string) => boolean;
  onReset: () => void;
  saveStatusMessage?: string;
};

const TOKEN_GROUPS: { label: string; keys: ThemeGlobalTokenKey[] }[] = [
  {
    label: "Surface",
    keys: ["surface", "surface-soft", "surface-overlay"],
  },
  {
    label: "Text",
    keys: ["text", "text-muted", "text-subtle"],
  },
  {
    label: "Border",
    keys: ["border", "border-strong"],
  },
  {
    label: "Accent",
    keys: ["accent", "accent-soft", "accent-strong", "accent-text"],
  },
  {
    label: "Status",
    keys: [
      "success",
      "success-soft",
      "warning",
      "warning-soft",
      "danger",
      "danger-soft",
    ],
  },
];

export function TokenEditorPanel({
  tokens,
  onTokenChange,
  onApplyPreview,
  onSavePreset,
  onReset,
  saveStatusMessage,
}: TokenEditorPanelProps) {
  const [presetLabel, setPresetLabel] = useState("");

  return (
    <section className="grid gap-3 rounded border border-theme-border/10 bg-theme-surface-soft p-2">
      {TOKEN_GROUPS.map((group) => (
        <div
          key={group.label}
          className="grid gap-2 rounded border border-theme-border/10 bg-theme-surface/25 p-2"
        >
          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-theme-text/70">
            {group.label}
          </div>
          {group.keys.map((tokenKey) => (
            <div key={tokenKey} className="grid gap-1">
              <TokenColorPicker
                tokenKey={tokenKey}
                value={tokens[tokenKey] ?? ""}
                onChange={onTokenChange}
              />
              <div className="text-[10px] text-theme-text/50">
                {toGlobalThemeVariable(tokenKey)}
              </div>
            </div>
          ))}
        </div>
      ))}

      <div className="grid gap-2 rounded border border-theme-border/10 bg-theme-surface/25 p-2">
        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
          <input
            type="text"
            value={presetLabel}
            onChange={(event) => setPresetLabel(event.target.value)}
            placeholder="Custom preset name"
            className="rounded border border-theme-border/20 bg-theme-surface/40 px-2 py-1 text-xs text-theme-text"
          />
          <button
            type="button"
            onClick={onApplyPreview}
            className="rounded border border-theme-border/20 px-2 py-1 text-[11px] text-theme-text/80 hover:bg-theme-surface-soft"
          >
            Apply Preview
          </button>
          <button
            type="button"
            onClick={() => {
              const saved = onSavePreset(presetLabel);
              if (saved) {
                setPresetLabel("");
              }
            }}
            className="rounded border border-theme-border/20 px-2 py-1 text-[11px] text-theme-text/80 hover:bg-theme-surface-soft"
          >
            Save Preset
          </button>
          <button
            type="button"
            onClick={onReset}
            className="rounded border border-theme-border/20 px-2 py-1 text-[11px] text-theme-text/80 hover:bg-theme-surface-soft"
          >
            Reset
          </button>
        </div>
        {saveStatusMessage ? (
          <div className="text-[11px] text-theme-text/65">{saveStatusMessage}</div>
        ) : null}
      </div>
    </section>
  );
}
