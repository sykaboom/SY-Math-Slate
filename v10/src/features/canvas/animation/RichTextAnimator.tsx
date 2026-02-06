"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";

import { loadMathJax } from "@core/math/loader";
import { typesetElement } from "@core/math/render";
import { cn } from "@core/utils";
import { BUILTIN_ANIMATION_PROFILES } from "@features/animation/model/builtinProfiles";
import type { AnimationModInput, AnimationModNormalizer } from "@features/animation/modding/modContract";
import { normalizeModProfile } from "@features/animation/modding/normalizeModProfile";
import { compileAnimationPlan } from "@features/animation/plan/compileAnimationPlan";
import { measureAnimationPlan } from "@features/animation/plan/measureAnimationPlan";
import { playAnimationPlan } from "@features/animation/runtime/playAnimationPlan";
import type { AnimationPlaybackController, AnimationRun } from "@features/animation/runtime/types";
import { useBoardTransform } from "@features/hooks/useBoardTransform";

type RichTextAnimatorProps = {
  html: string;
  className?: string;
  style?: CSSProperties;
  isActive: boolean;
  speed: number;
  isPaused: boolean;
  skipSignal: number;
  stopSignal: number;
  onMove: (pos: { x: number; y: number }, tool?: "chalk" | "marker") => void;
  onDone: () => void;
  modInput?: AnimationModInput | null;
  modNormalizer?: AnimationModNormalizer;
};

const hasMathToken = (value: string) => value.includes("$");

const revealRuns = (runs: AnimationRun[]) => {
  runs.forEach((run) => {
    if (run.type === "text") {
      run.spans.forEach((span) => span.classList.add("tw-visible"));
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

export function RichTextAnimator({
  html,
  className,
  style,
  isActive,
  speed,
  isPaused,
  skipSignal,
  stopSignal,
  onMove,
  onDone,
  modInput,
  modNormalizer,
}: RichTextAnimatorProps) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const renderIdRef = useRef(0);
  const runsRef = useRef<AnimationRun[]>([]);
  const controllerRef = useRef<AnimationPlaybackController | null>(null);

  const speedRef = useRef(speed);
  const pausedRef = useRef(isPaused);
  const skipRef = useRef(skipSignal);
  const stopRef = useRef(stopSignal);
  const onMoveRef = useRef(onMove);
  const onDoneRef = useRef(onDone);
  const { toBoardPoint } = useBoardTransform();

  const [ready, setReady] = useState(false);

  const profile = useMemo(() => {
    return normalizeModProfile(modInput, BUILTIN_ANIMATION_PROFILES[0], modNormalizer);
  }, [modInput, modNormalizer]);

  const mergedStyle: CSSProperties = {
    display: "inline-block",
    maxWidth: "100%",
    ...style,
  };

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    pausedRef.current = isPaused;
    if (controllerRef.current) {
      controllerRef.current.setPaused(isPaused);
    }
  }, [isPaused]);

  useEffect(() => {
    onMoveRef.current = onMove;
  }, [onMove]);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    renderIdRef.current += 1;
    const renderId = renderIdRef.current;
    setReady(false);
    runsRef.current = [];

    if (controllerRef.current) {
      controllerRef.current.stop();
      controllerRef.current = null;
    }

    el.classList.remove("hl-temporary");
    el.innerHTML = html;

    const run = async () => {
      try {
        if (hasMathToken(html)) {
          await loadMathJax();
          if (renderIdRef.current !== renderId) return;
          await typesetElement(el);
          if (renderIdRef.current !== renderId) return;
        }
        const compiled = compileAnimationPlan(el, html);
        runsRef.current = compiled.runs;
        setReady(true);
      } catch {
        if (renderIdRef.current !== renderId) return;
        el.innerHTML = html;
        const compiled = compileAnimationPlan(el, html);
        runsRef.current = compiled.runs;
        setReady(true);
      }
    };

    run();
  }, [html]);

  useEffect(() => {
    if (!ready) return;

    if (!isActive) {
      contentRef.current?.classList.remove("hl-temporary");
      if (controllerRef.current) {
        controllerRef.current.stop();
        controllerRef.current = null;
      }
      revealRuns(runsRef.current);
      return;
    }

    if (controllerRef.current) {
      controllerRef.current.stop();
      controllerRef.current = null;
    }

    contentRef.current?.classList.add("hl-temporary");

    const runs = runsRef.current;
    const metrics = measureAnimationPlan(runs);
    const controller = playAnimationPlan({
      runs,
      metrics,
      profile,
      toBoardPoint,
      onMove: (pos, tool) => {
        onMoveRef.current?.(pos, tool);
      },
      onDone: () => {
        contentRef.current?.classList.remove("hl-temporary");
        onDoneRef.current?.();
      },
      getSpeed: () => speedRef.current,
      getPaused: () => pausedRef.current,
    });
    controllerRef.current = controller;
    controller.start();
    controller.setPaused(pausedRef.current);

    return () => {
      if (controllerRef.current === controller) {
        controller.stop();
        controllerRef.current = null;
      }
      contentRef.current?.classList.remove("hl-temporary");
    };
  }, [isActive, profile, ready, toBoardPoint]);

  useEffect(() => {
    if (!isActive) {
      skipRef.current = skipSignal;
      return;
    }
    if (skipSignal === skipRef.current) return;
    skipRef.current = skipSignal;
    controllerRef.current?.skip();
    contentRef.current?.classList.remove("hl-temporary");
  }, [isActive, skipSignal]);

  useEffect(() => {
    if (!isActive) {
      stopRef.current = stopSignal;
      return;
    }
    if (stopSignal === stopRef.current) return;
    stopRef.current = stopSignal;
    controllerRef.current?.stop();
    contentRef.current?.classList.remove("hl-temporary");
  }, [isActive, stopSignal]);

  useEffect(() => {
    return () => {
      if (controllerRef.current) {
        controllerRef.current.stop();
        controllerRef.current = null;
      }
    };
  }, []);

  return <div ref={contentRef} className={cn(className)} style={mergedStyle} />;
}
