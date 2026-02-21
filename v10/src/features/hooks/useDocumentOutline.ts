"use client";

import { useCallback, useMemo } from "react";

import { dispatchCommand } from "@core/runtime/command/commandBus";
import {
  buildDocumentOutline,
  type DocumentOutlineEntry,
} from "@features/editor-core/outline/documentOutline";
import { useCanvasStore } from "@features/store/useCanvasStore";

type UseDocumentOutlineResult = {
  entries: DocumentOutlineEntry[];
  currentEntry: DocumentOutlineEntry | null;
  currentStepIndex: number;
  jumpToStep: (stepIndex: number) => void;
};

export function useDocumentOutline(): UseDocumentOutlineResult {
  const { stepBlocks, currentStep } = useCanvasStore();

  const entries = useMemo(() => buildDocumentOutline(stepBlocks), [stepBlocks]);
  const currentEntry = useMemo(() => {
    return entries.find((entry) => entry.stepIndex === currentStep) ?? null;
  }, [entries, currentStep]);

  const jumpToStep = useCallback((stepIndex: number) => {
    if (!Number.isFinite(stepIndex)) return;
    const normalizedStep = Math.max(0, Math.floor(stepIndex));

    void dispatchCommand("goToStep", { step: normalizedStep }, {
      meta: { source: "hook.document-outline" },
    }).catch(() => undefined);
  }, []);

  return {
    entries,
    currentEntry,
    currentStepIndex: currentStep,
    jumpToStep,
  };
}
