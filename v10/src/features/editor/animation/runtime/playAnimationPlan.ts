import type {
  AnimationPlaybackController,
  AnimationPlaybackOptions,
  AnimationRun,
  TextAnimationRun,
} from "@features/editor/animation/runtime/types";

const clamp = (value: number, min: number, max: number) => {
  return Math.min(max, Math.max(min, value));
};

type Phase = "text-reveal" | "text-highlight" | "math";

const resetRuns = (runs: AnimationRun[]) => {
  runs.forEach((run) => {
    if (run.type === "text") {
      run.spans.forEach((span) => {
        span.classList.remove("tw-visible");
      });
      run.highlightSpans.forEach((span) => {
        delete span.dataset.hlActive;
      });
      return;
    }

    run.node.style.visibility = "hidden";
    run.node.style.opacity = "0";
    run.node.style.filter = "";
    run.node.style.transform = "";
    run.node.style.transformOrigin = "";
  });
};

const revealAll = (runs: AnimationRun[]) => {
  runs.forEach((run) => {
    if (run.type === "text") {
      run.spans.forEach((span) => {
        span.classList.add("tw-visible");
      });
      run.highlightSpans.forEach((span) => {
        span.dataset.hlActive = "1";
      });
      return;
    }

    run.node.style.visibility = "visible";
    run.node.style.opacity = "1";
    run.node.style.filter = "";
    run.node.style.transform = "";
    run.node.style.transformOrigin = "";
  });
};

const getTextDurationMs = (
  count: number,
  options: AnimationPlaybackOptions
): number => {
  if (count === 0) return 0;
  const speed = Math.max(0.1, options.getSpeed());
  const profile = options.profile.text;
  return clamp(
    (count * profile.durationPerCharMs) / speed,
    profile.minDurationMs,
    profile.maxDurationMs
  );
};

const getHighlightDurationMs = (
  count: number,
  options: AnimationPlaybackOptions
): number => {
  if (count === 0) return 0;
  const speed = Math.max(0.1, options.getSpeed());
  const profile = options.profile.highlight;
  return clamp(
    (count * profile.durationPerCharMs) / speed,
    profile.minDurationMs,
    profile.maxDurationMs
  );
};

const getMathDurationMs = (
  width: number,
  options: AnimationPlaybackOptions
): number => {
  const speed = Math.max(0.1, options.getSpeed());
  const profile = options.profile.math;
  const weight =
    width > 0
      ? Math.max(
          profile.minWeight,
          Math.min(width / profile.widthReferencePx, profile.maxWeight)
        )
      : 1;
  return (profile.durationMs * weight) / speed;
};

export const playAnimationPlan = (
  options: AnimationPlaybackOptions
): AnimationPlaybackController => {
  const runs = options.runs;
  let rafId = 0;
  let started = false;
  let finished = false;
  let paused = options.getPaused();

  let runIndex = 0;
  let phase: Phase = "text-reveal";
  let phaseStart = 0;
  let phaseDuration = 0;
  let phaseElapsed = 0;

  let visibleIndex = 0;
  let highlightIndex = 0;
  let lastTextPos: { x: number; y: number } | null = null;
  let lastHighlightPos: { x: number; y: number } | null = null;

  const stopRaf = () => {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  };

  const finish = (callDone: boolean) => {
    if (finished) return;
    finished = true;
    stopRaf();
    revealAll(runs);
    if (callDone) {
      options.onDone();
    }
  };

  const beginPhase = (now: number) => {
    phaseStart = now;
    phaseElapsed = 0;
  };

  const advanceRun = (now: number) => {
    runIndex += 1;
    if (runIndex >= runs.length) {
      finish(true);
      return;
    }
    beginRun(runs[runIndex], now);
  };

  const beginRun = (run: AnimationRun, now: number) => {
    visibleIndex = 0;
    highlightIndex = 0;
    lastTextPos = null;
    lastHighlightPos = null;

    if (run.type === "text") {
      phase = "text-reveal";
      phaseDuration = getTextDurationMs(run.spans.length, options);
      beginPhase(now);
      return;
    }

    run.node.style.visibility = "visible";
    run.node.style.opacity = "0";
    run.node.style.filter = "blur(2px)";
    run.node.style.transform = "scale(0.98)";
    run.node.style.transformOrigin = "50% 60%";

    const rect = run.node.getBoundingClientRect();
    phase = "math";
    phaseDuration = getMathDurationMs(rect.width, options);
    beginPhase(now);
  };

  const moveTextCursor = (run: TextAnimationRun, exactIndex: number) => {
    if (run.spans.length === 0) return;

    const activeIndex = Math.min(
      Math.max(Math.floor(exactIndex), 0),
      run.spans.length - 1
    );
    const intra = Math.min(1, Math.max(0, exactIndex - activeIndex));
    const activeSpan = run.spans[activeIndex];
    if (!activeSpan) return;

    const rect = activeSpan.getBoundingClientRect();
    if (rect.width > 0 || rect.height > 0) {
      const lead = clamp(
        rect.width * 0.05,
        options.profile.text.cursorLeadMinPx,
        options.profile.text.cursorLeadMaxPx
      );
      const boardPos = options.toBoardPoint(
        rect.left + rect.width * intra + lead,
        rect.bottom - options.profile.text.baselineOffsetPx
      );
      lastTextPos = boardPos;
      options.onMove(boardPos, "chalk");
    } else if (lastTextPos) {
      options.onMove(lastTextPos, "chalk");
    }
  };

  const animateFrame = (now: number) => {
    if (finished) return;

    const run = runs[runIndex];
    if (!run) {
      finish(true);
      return;
    }

    const elapsed = phaseDuration > 0 ? Math.min(phaseDuration, now - phaseStart) : 0;
    phaseElapsed = elapsed;

    if (run.type === "text") {
      if (phase === "text-reveal") {
        const progress = phaseDuration > 0 ? Math.min(1, elapsed / phaseDuration) : 1;
        const exactIndex = progress * run.spans.length;
        const targetIndex = Math.min(
          run.spans.length,
          options.profile.text.revealMode === "clip"
            ? Math.ceil(exactIndex)
            : Math.floor(exactIndex)
        );

        for (let i = visibleIndex; i < targetIndex; i += 1) {
          const span = run.spans[i];
          if (span) {
            span.classList.add("tw-visible");
          }
        }
        visibleIndex = Math.max(visibleIndex, targetIndex);

        moveTextCursor(run, exactIndex);

        if (progress >= 1) {
          run.spans.forEach((span) => {
            span.classList.add("tw-visible");
          });
          if (run.highlightSpans.length > 0) {
            phase = "text-highlight";
            phaseDuration = getHighlightDurationMs(run.highlightSpans.length, options);
            beginPhase(now);
          } else {
            advanceRun(now);
          }
        }
      } else {
        const progress = phaseDuration > 0 ? Math.min(1, elapsed / phaseDuration) : 1;
        const exactIndex = progress * run.highlightSpans.length;
        const targetIndex = Math.min(
          Math.floor(exactIndex),
          run.highlightSpans.length
        );

        for (let i = highlightIndex; i < targetIndex; i += 1) {
          const span = run.highlightSpans[i];
          if (span) {
            span.dataset.hlActive = "1";
          }
        }
        highlightIndex = Math.max(highlightIndex, targetIndex);

        const activeIndex =
          run.highlightSpans.length > 0
            ? Math.min(
                Math.max(Math.floor(exactIndex), 0),
                run.highlightSpans.length - 1
              )
            : -1;
        const activeSpan = activeIndex >= 0 ? run.highlightSpans[activeIndex] : undefined;
        if (activeSpan) {
          const rect = activeSpan.getBoundingClientRect();
          if (rect.width > 0 || rect.height > 0) {
            const lead = clamp(
              rect.width,
              options.profile.highlight.markerLeadMinPx,
              options.profile.highlight.markerLeadMaxPx
            );
            const boardPos = options.toBoardPoint(
              rect.left + rect.width + lead,
              rect.bottom - options.profile.highlight.baselineOffsetPx
            );
            lastHighlightPos = boardPos;
            options.onMove(boardPos, "marker");
          } else if (lastHighlightPos) {
            options.onMove(lastHighlightPos, "marker");
          }
        }

        if (progress >= 1) {
          run.highlightSpans.forEach((span) => {
            span.dataset.hlActive = "1";
          });
          advanceRun(now);
        }
      }
    } else {
      const progress = phaseDuration > 0 ? Math.min(1, elapsed / phaseDuration) : 1;
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const popPhase = progress < 0.7 ? progress / 0.7 : (progress - 0.7) / 0.3;
      const scale = progress < 0.7 ? 0.98 + 0.04 * popPhase : 1.02 - 0.02 * popPhase;
      const opacity = Math.min(1, progress * 1.4);
      const blur = (1 - easeOut) * 2;
      run.node.style.opacity = String(opacity);
      run.node.style.filter = `blur(${blur.toFixed(2)}px)`;
      run.node.style.transform = `scale(${scale.toFixed(4)})`;

      const rect = run.node.getBoundingClientRect();
      const boardPos = options.toBoardPoint(
        rect.left + rect.width * 0.5,
        rect.bottom - options.profile.math.baselineOffsetPx
      );
      options.onMove(boardPos, "chalk");

      if (progress >= 1) {
        run.node.style.opacity = "1";
        run.node.style.filter = "";
        run.node.style.transform = "";
        run.node.style.transformOrigin = "";
        advanceRun(now);
      }
    }

    if (!finished && !paused) {
      rafId = requestAnimationFrame(animateFrame);
    } else {
      rafId = 0;
    }
  };

  return {
    start: () => {
      if (started || finished) return;
      started = true;
      paused = options.getPaused();
      resetRuns(runs);
      if (runs.length === 0) {
        finish(true);
        return;
      }
      runIndex = 0;
      beginRun(runs[runIndex], performance.now());
      if (!paused) {
        rafId = requestAnimationFrame(animateFrame);
      }
    },
    setPaused: (nextPaused: boolean) => {
      if (finished || !started) return;
      if (paused === nextPaused) return;
      paused = nextPaused;
      if (!paused && rafId === 0) {
        phaseStart = performance.now() - phaseElapsed;
        rafId = requestAnimationFrame(animateFrame);
      }
      if (paused) {
        stopRaf();
      }
    },
    skip: () => {
      if (finished) return;
      finish(true);
    },
    stop: () => {
      if (finished) return;
      finish(false);
    },
  };
};
