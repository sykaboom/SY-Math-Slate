import type { CanvasItem, StepBlock } from "@core/foundation/types/canvas";

type ToolbarStepMetricsInput = {
  pages: Record<string, CanvasItem[]>;
  currentStep: number;
  stepBlocks?: readonly StepBlock[];
};

export type ToolbarStepMetrics = {
  maxStep: number;
  totalSteps: number;
  displayStep: number;
  canStepPrev: boolean;
  canStepNext: boolean;
  canStepJump: boolean;
  stepSliderMax: number;
  stepSliderValue: number;
};

const getMaxStepFromPages = (pages: Record<string, CanvasItem[]>) => {
  return Object.values(pages).reduce((max, items) => {
    return items.reduce((innerMax, item) => {
      if (item.type !== "text" && item.type !== "image") return innerMax;
      const stepIndex = typeof item.stepIndex === "number" ? item.stepIndex : 0;
      return Math.max(innerMax, stepIndex);
    }, max);
  }, -1);
};

export const selectToolbarStepMetrics = ({
  pages,
  currentStep,
  stepBlocks,
}: ToolbarStepMetricsInput): ToolbarStepMetrics => {
  const maxStep =
    stepBlocks && stepBlocks.length > 0
      ? stepBlocks.length - 1
      : getMaxStepFromPages(pages);
  const totalSteps = Math.max(maxStep + 1, 0);
  const displayStep =
    totalSteps === 0 ? 0 : Math.min(currentStep + 1, totalSteps);
  const canStepPrev = currentStep > 0;
  const canStepNext = currentStep <= maxStep;
  const canStepJump = totalSteps > 1;
  const stepSliderMax = Math.max(maxStep + 1, 0);
  const stepSliderValue = Math.min(currentStep, stepSliderMax);

  return {
    maxStep,
    totalSteps,
    displayStep,
    canStepPrev,
    canStepNext,
    canStepJump,
    stepSliderMax,
    stepSliderValue,
  };
};
