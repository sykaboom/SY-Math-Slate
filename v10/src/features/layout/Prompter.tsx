"use client";

import { useMemo } from "react";

import { useCanvasStore } from "@features/store/useCanvasStore";
import type { CanvasItem, TextItem } from "@core/foundation/types/canvas";

const isTextItem = (item: CanvasItem): item is TextItem => item.type === "text";

const stripHtml = (value: string) =>
  value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

export function Prompter() {
  const { pages, currentPageId, currentStep } = useCanvasStore();

  const stepTextMap = useMemo(() => {
    const items = pages[currentPageId] ?? [];
    const map = new Map<number, string[]>();
    items.forEach((item) => {
      if (!isTextItem(item)) return;
      const stepIndex = typeof item.stepIndex === "number" ? item.stepIndex : 0;
      const text = stripHtml(item.content);
      const current = map.get(stepIndex) ?? [];
      if (text) current.push(text);
      map.set(stepIndex, current);
    });

    const textMap = new Map<number, string>();
    map.forEach((list, stepIndex) => {
      textMap.set(stepIndex, list.join(" ").trim());
    });
    return textMap;
  }, [currentPageId, pages]);

  const orderedSteps = useMemo(
    () => Array.from(stepTextMap.keys()).sort((a, b) => a - b),
    [stepTextMap]
  );
  const hasSteps = orderedSteps.length > 0;
  const fallbackStep = orderedSteps[0];
  const currentStepKey = stepTextMap.has(currentStep)
    ? currentStep
    : fallbackStep ?? currentStep;
  const currentTextRaw = stepTextMap.get(currentStepKey) ?? "";
  const currentText = currentTextRaw || (hasSteps ? "(공백)" : "");
  const nextStepKey = orderedSteps.find((step) => step > currentStepKey);
  const nextTextRaw =
    typeof nextStepKey === "number" ? stepTextMap.get(nextStepKey) ?? "" : "";
  const nextText =
    typeof nextStepKey === "number" ? nextTextRaw || "(공백)" : "";
  const nextLineText = nextText ? `다음: ${nextText}` : "\u00a0";

  return (
    <div className="flex w-full justify-center">
      <div className="w-full max-w-[min(720px,92vw)] rounded-full border border-theme-border/10 bg-theme-surface/60 px-6 py-3 text-theme-text/80 backdrop-blur-md">
        <div
          key={currentStepKey}
          className="flex flex-col items-center gap-1 text-center animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
        >
          <div className="w-full truncate text-sm font-semibold text-theme-text/90">
            {hasSteps ? currentText : "미리보기 없음"}
          </div>
          <div
            className={`w-full truncate text-xs text-theme-text/50 ${
              nextText ? "" : "opacity-0"
            }`}
          >
            {nextLineText}
          </div>
        </div>
      </div>
    </div>
  );
}
