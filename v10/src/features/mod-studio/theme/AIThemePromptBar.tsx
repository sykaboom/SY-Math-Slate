"use client";

import { type KeyboardEvent } from "react";

type AIThemePromptBarProps = {
  description: string;
  providerId: string;
  isGenerating: boolean;
  onDescriptionChange: (value: string) => void;
  onProviderChange: (providerId: string) => void;
  onGenerate: () => void;
};

const PROVIDER_OPTIONS = [
  { value: "openai", label: "OpenAI" },
  { value: "mock", label: "Mock" },
] as const;

export function AIThemePromptBar({
  description,
  providerId,
  isGenerating,
  onDescriptionChange,
  onProviderChange,
  onGenerate,
}: AIThemePromptBarProps) {
  const isGenerateDisabled = isGenerating || description.trim().length === 0;

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter") return;
    if (!event.ctrlKey && !event.metaKey) return;
    event.preventDefault();
    if (isGenerateDisabled) return;
    onGenerate();
  };

  return (
    <section className="grid gap-2 rounded border border-theme-border/10 bg-theme-surface-soft p-2">
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div className="text-[11px] font-semibold text-theme-text/80">
          AI Theme Prompt
        </div>
        <select
          value={providerId}
          onChange={(event) => onProviderChange(event.target.value)}
          className="rounded border border-theme-border/20 bg-theme-surface/40 px-2 py-1 text-[11px] text-theme-text"
          disabled={isGenerating}
        >
          {PROVIDER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <textarea
        value={description}
        onChange={(event) => onDescriptionChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Describe the mood/style (for example: warm autumn dusk with brown and gold)."
        className="min-h-24 w-full resize-y rounded border border-theme-border/20 bg-theme-surface/40 px-2 py-1 text-xs text-theme-text outline-none focus:border-theme-border/35"
        disabled={isGenerating}
      />

      <div className="flex items-center justify-between gap-2">
        <div className="text-[10px] text-theme-text/55">Ctrl/Cmd + Enter to generate</div>
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerateDisabled}
          className="rounded border border-theme-border/20 px-2 py-1 text-[11px] text-theme-text/80 hover:bg-theme-surface-soft disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isGenerating ? "Generating..." : "Generate Theme"}
        </button>
      </div>
    </section>
  );
}
