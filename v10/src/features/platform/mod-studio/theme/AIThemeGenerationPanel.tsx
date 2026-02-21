"use client";

import { useState } from "react";

import { AIThemePromptBar } from "./AIThemePromptBar";
import { useAIThemeGeneration } from "./useAIThemeGeneration";

type AIThemeGenerationPanelProps = {
  onSavePreset: (presetLabel: string) => boolean;
  saveStatusMessage?: string;
};

export function AIThemeGenerationPanel({
  onSavePreset,
  saveStatusMessage,
}: AIThemeGenerationPanelProps) {
  const [description, setDescription] = useState("");
  const [providerId, setProviderId] = useState("openai");
  const [presetLabel, setPresetLabel] = useState("");

  const aiTheme = useAIThemeGeneration();

  const handleGenerate = () => {
    void aiTheme.generateTheme({ description, providerId });
  };

  const handleSavePreset = () => {
    const saved = onSavePreset(presetLabel);
    if (saved) {
      setPresetLabel("");
    }
  };

  return (
    <section className="grid gap-2 rounded border border-theme-border/10 bg-theme-surface-soft p-2">
      <AIThemePromptBar
        description={description}
        providerId={providerId}
        isGenerating={aiTheme.isGenerating}
        onDescriptionChange={(value) => {
          setDescription(value);
          aiTheme.clearMessages();
        }}
        onProviderChange={(value) => {
          setProviderId(value);
          aiTheme.clearMessages();
        }}
        onGenerate={handleGenerate}
      />

      {aiTheme.lastGeneration ? (
        <div className="text-[10px] text-theme-text/60">
          Last generation: {aiTheme.lastGeneration.providerId}/
          {aiTheme.lastGeneration.model}
          {aiTheme.lastGeneration.mocked ? " (mock)" : ""}
        </div>
      ) : null}

      {aiTheme.statusMessage ? (
        <div className="text-[11px] text-theme-text/70">{aiTheme.statusMessage}</div>
      ) : null}

      {aiTheme.errorMessage ? (
        <div className="text-[11px] text-rose-200">{aiTheme.errorMessage}</div>
      ) : null}

      <div className="grid gap-2 rounded border border-theme-border/10 bg-theme-surface/25 p-2">
        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
          <input
            type="text"
            value={presetLabel}
            onChange={(event) => setPresetLabel(event.target.value)}
            placeholder="Custom preset name"
            className="rounded border border-theme-border/20 bg-theme-surface/40 px-2 py-1 text-xs text-theme-text"
            disabled={!aiTheme.hasGeneratedTheme}
          />
          <button
            type="button"
            onClick={() => aiTheme.applyLastGeneratedPreview()}
            disabled={!aiTheme.hasGeneratedTheme}
            className="rounded border border-theme-border/20 px-2 py-1 text-[11px] text-theme-text/80 hover:bg-theme-surface-soft disabled:cursor-not-allowed disabled:opacity-50"
          >
            Reapply Preview
          </button>
          <button
            type="button"
            onClick={handleSavePreset}
            disabled={!aiTheme.hasGeneratedTheme}
            className="rounded border border-theme-border/20 px-2 py-1 text-[11px] text-theme-text/80 hover:bg-theme-surface-soft disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save Preset
          </button>
        </div>
        {saveStatusMessage ? (
          <div className="text-[11px] text-theme-text/65">{saveStatusMessage}</div>
        ) : null}
      </div>
    </section>
  );
}
