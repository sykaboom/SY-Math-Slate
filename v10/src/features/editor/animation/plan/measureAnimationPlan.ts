import type {
  AnimationPlanMetrics,
  AnimationRun,
} from "@features/editor/animation/runtime/types";

export const measureAnimationPlan = (runs: AnimationRun[]): AnimationPlanMetrics => {
  let textCharCount = 0;
  let highlightCharCount = 0;
  let mathWidthPx = 0;

  runs.forEach((run) => {
    if (run.type === "text") {
      textCharCount += run.spans.length;
      highlightCharCount += run.highlightSpans.length;
      return;
    }
    const rect = run.node.getBoundingClientRect();
    mathWidthPx += rect.width;
  });

  return {
    textCharCount,
    highlightCharCount,
    mathWidthPx,
  };
};
