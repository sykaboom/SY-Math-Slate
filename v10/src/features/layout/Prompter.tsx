"use client";

import { useMemo } from "react";

import { useCanvasStore } from "@features/store/useCanvasStore";
import type { CanvasItem, TextItem } from "@core/types/canvas";

const isTextItem = (item: CanvasItem): item is TextItem => item.type === "text";

const stripHtml = (value: string) =>
  value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

export function Prompter() {
  const { pages, currentPageId, currentStep } = useCanvasStore();

  const stepSummaries = useMemo(() => {
    const items = pages[currentPageId] ?? [];
    const maxStep = items.reduce((max, item) => {
      if (!isTextItem(item)) return max;
      const stepIndex = typeof item.stepIndex === "number" ? item.stepIndex : 0;
      return Math.max(max, stepIndex);
    }, -1);

    const summaries: { step: number; text: string }[] = [];
    for (let index = 0; index <= maxStep; index += 1) {
      const block = items.find((item) => {
        if (!isTextItem(item)) return false;
        const stepIndex = typeof item.stepIndex === "number" ? item.stepIndex : 0;
        return stepIndex === index;
      }) as TextItem | undefined;
      const text = block ? stripHtml(block.content) : "";
      summaries.push({
        step: index,
        text: text || "(공백)",
      });
    }
    return summaries;
  }, [currentPageId, pages]);

  const totalSteps = Math.max(stepSummaries.length, 0);
  const activeStep = Math.min(Math.max(currentStep, 0), Math.max(totalSteps - 1, 0));

  return (
    <div className="prompter-glass w-full py-3 px-6">
      <div className="flex w-full items-center gap-3 text-sm">
        <span className="text-neon-yellow text-xs font-bold uppercase tracking-wider">
          Steps
        </span>
        <div
          className="flex flex-1 items-center gap-2 overflow-x-auto py-1"
          style={{ scrollbarGutter: "stable both-edges" }}
        >
          {stepSummaries.length === 0 ? (
            <span className="text-xs text-white/50">미리보기 없음</span>
          ) : (
            stepSummaries.map((step) => {
              const isActive = step.step === activeStep;
              const isDone = step.step < currentStep;
              return (
                <div
                  key={step.step}
                  className={`flex min-w-[180px] shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs ${
                    isActive
                      ? "border-white/50 bg-white/15 text-white"
                      : isDone
                      ? "border-white/10 bg-white/5 text-white/70"
                      : "border-white/5 bg-transparent text-white/40"
                  }`}
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wide">
                    {step.step + 1}
                  </span>
                  <span className="truncate">{step.text}</span>
                </div>
              );
            })
          )}
        </div>
        {totalSteps > 0 && (
          <span className="text-xs text-white/50">
            {Math.min(currentStep + 1, totalSteps)}/{totalSteps}
          </span>
        )}
      </div>
    </div>
  );
}
