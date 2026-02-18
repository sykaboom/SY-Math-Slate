"use client";

import { Button } from "@ui/components/button";

export type ReAskPresetId = "shorter" | "simpler" | "example" | "retry";

export type ReAskPreset = {
  id: ReAskPresetId;
  label: string;
  prompt: string | null;
};

const DEFAULT_PRESETS: ReAskPreset[] = [
  {
    id: "shorter",
    label: "더 짧게",
    prompt: "Please provide a shorter explanation",
  },
  {
    id: "simpler",
    label: "더 쉽게",
    prompt: "Explain more simply for students",
  },
  {
    id: "example",
    label: "예시 추가",
    prompt: "Include a concrete example",
  },
  {
    id: "retry",
    label: "다시 시도",
    prompt: null,
  },
];

type ReAskPresetBarProps = {
  className?: string;
  disabled?: boolean;
  presets?: ReAskPreset[];
  onSelect: (preset: ReAskPreset) => void;
};

export function ReAskPresetBar({
  className,
  disabled = false,
  presets,
  onSelect,
}: ReAskPresetBarProps) {
  const resolvedPresets = presets && presets.length > 0 ? presets : DEFAULT_PRESETS;

  return (
    <div
      className={["flex flex-wrap items-center gap-1.5", className ?? ""].join(" ").trim()}
      aria-label="Re-ask presets"
    >
      {resolvedPresets.map((preset) => (
        <Button
          key={preset.id}
          type="button"
          size="sm"
          variant="outline"
          className="h-7 border-toolbar-border/20 bg-transparent px-2 text-[11px] text-toolbar-text/85 hover:bg-toolbar-chip/15 hover:text-toolbar-text"
          onClick={() => onSelect(preset)}
          disabled={disabled}
        >
          {preset.label}
        </Button>
      ))}
    </div>
  );
}
