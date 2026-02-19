"use client";

import { useMemo, useState } from "react";

import { AIModulePromptBar } from "./AIModulePromptBar";
import { useAIModuleGeneration } from "./useAIModuleGeneration";

export function AIModuleGenerationPanel() {
  const [description, setDescription] = useState("");
  const [providerId, setProviderId] = useState("openai");

  const aiModule = useAIModuleGeneration();
  const sortedPreviewModules = useMemo(
    () =>
      aiModule.lastGeneratedModules.slice().sort((left, right) => left.order - right.order),
    [aiModule.lastGeneratedModules]
  );

  const handleGenerate = () => {
    void aiModule.generateModules({ description, providerId });
  };

  const handleRetry = () => {
    void aiModule.retryLastRequest();
  };

  return (
    <section className="grid gap-2 rounded border border-theme-border/10 bg-theme-surface-soft p-2">
      <AIModulePromptBar
        description={description}
        providerId={providerId}
        isGenerating={aiModule.isGenerating}
        onDescriptionChange={(value) => {
          setDescription(value);
          aiModule.clearMessages();
        }}
        onProviderChange={(value) => {
          setProviderId(value);
          aiModule.clearMessages();
        }}
        onGenerate={handleGenerate}
      />

      {aiModule.lastGeneration ? (
        <div className="text-[10px] text-theme-text/60">
          Last generation: {aiModule.lastGeneration.providerId}/
          {aiModule.lastGeneration.model}
          {aiModule.lastGeneration.mocked ? " (mock)" : ""}
        </div>
      ) : null}

      {aiModule.statusMessage ? (
        <div className="text-[11px] text-theme-text/70">{aiModule.statusMessage}</div>
      ) : null}

      {aiModule.errorMessage ? (
        <div className="grid gap-2 rounded border border-[var(--theme-danger)] bg-[var(--theme-danger-soft)] p-2 text-[11px] text-theme-text">
          <div>{aiModule.errorMessage}</div>
          <button
            type="button"
            onClick={handleRetry}
            disabled={!aiModule.canRetry || aiModule.isGenerating}
            className="w-fit rounded border border-[var(--theme-danger)] px-2 py-1 text-[11px] text-theme-text disabled:cursor-not-allowed disabled:opacity-50"
          >
            Retry
          </button>
        </div>
      ) : null}

      <section className="grid gap-2 rounded border border-theme-border/10 bg-theme-surface/25 p-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-[11px] font-semibold text-theme-text/80">
            Generated Module Preview
          </div>
          <button
            type="button"
            onClick={() => aiModule.applyLastGeneratedModules()}
            disabled={!aiModule.hasGeneratedModules}
            className="rounded border border-theme-border/20 px-2 py-1 text-[11px] text-theme-text/80 hover:bg-theme-surface-soft disabled:cursor-not-allowed disabled:opacity-50"
          >
            Apply Again
          </button>
        </div>

        {!aiModule.hasGeneratedModules ? (
          <div className="text-[11px] text-theme-text/60">
            No AI-generated modules yet.
          </div>
        ) : (
          <div className="grid gap-1.5">
            {sortedPreviewModules.map((module) => (
              <article
                key={module.id}
                className="grid gap-1 rounded border border-theme-border/10 bg-theme-surface/35 p-2 text-[11px] text-theme-text/80"
              >
                <div className="font-semibold text-theme-text/85">
                  {module.label} ({module.id})
                </div>
                <div className="flex flex-wrap items-center gap-3 text-theme-text/65">
                  <span>slot: {module.slot}</span>
                  <span>order: {module.order}</span>
                  <span>command: {module.action.commandId}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
