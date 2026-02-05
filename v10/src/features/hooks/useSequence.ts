"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";

import { useCanvasStore } from "@features/store/useCanvasStore";
import { useUIStore } from "@features/store/useUIStore";
import type { CanvasItem, TextItem } from "@core/types/canvas";
import { useAudioPlayer } from "@features/hooks/useAudioPlayer";
import { useSFX } from "@features/hooks/useSFX";
import { chalkTheme } from "@core/themes/chalkTheme";
import type { ActorState } from "@features/canvas/actors/ActorLayer";

const isTextItem = (item: CanvasItem): item is TextItem => item.type === "text";
const isImageItem = (item: CanvasItem) => item.type === "image";
const hasMathToken = (value: string) => value.includes("$");

const MARKER_TIP_OFFSET = { x: 10, y: 18 };
const CHALK_TIP_OFFSET = chalkTheme.tipOffset;

const idleActor: ActorState = {
  visible: false,
  isMoving: false,
  type: "chalk",
};

export type AnimationState = {
  activeItemId: string | null;
  activeMode: "text" | "math" | null;
  isAnimating: boolean;
  speed: number;
  isPaused: boolean;
  skipSignal: number;
  stopSignal: number;
  onMove: (pos: { x: number; y: number }, tool?: "chalk" | "marker") => void;
  onDone: () => void;
  actor: ActorState;
};

export function useSequence({
  enabled,
  actorRef,
}: {
  enabled: boolean;
  actorRef?: RefObject<HTMLDivElement | null>;
}): AnimationState {
  const {
    pages,
    currentPageId,
    currentStep,
    nextStep,
    audioByStep,
  } = useCanvasStore();
  const {
    isAutoPlay,
    playSignal,
    playbackSpeed,
    autoPlayDelayMs,
    isPaused,
    skipSignal,
    stopSignal,
    isAnimating: storeIsAnimating,
    setAnimating,
    setAutoPlay,
    setPaused,
    triggerPlay,
  } = useUIStore();
  const { play, stop } = useSFX();
  const { play: playAudio, stop: stopAudio } = useAudioPlayer();

  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<"text" | "math" | null>(null);
  const [actor, setActor] = useState<ActorState>(idleActor);

  const runIdRef = useRef(0);
  const resolveRef = useRef<(() => void) | null>(null);
  const lastPlaySignalRef = useRef(playSignal);
  const lastStopSignalRef = useRef(stopSignal);
  const itemsRef = useRef<TextItem[]>([]);
  const lastSoundToolRef = useRef<"chalk" | "marker" | null>(null);
  const autoTimerRef = useRef<number | null>(null);

  const moveActor = useCallback(
    (pos: { x: number; y: number }, tool?: "chalk" | "marker") => {
      const el = actorRef?.current;
      if (!el) return;
      const resolvedTool = tool ?? "chalk";
      const offset =
        resolvedTool === "marker" ? MARKER_TIP_OFFSET : CHALK_TIP_OFFSET;
      const rawX = pos.x - offset.x;
      const rawY = pos.y - offset.y;
      const dpr =
        typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;
      const snappedX = Math.round(rawX * dpr) / dpr;
      const snappedY = Math.round(rawY * dpr) / dpr;
      el.style.transform = `translate3d(${snappedX}px, ${snappedY}px, 0)`;
    },
    [actorRef]
  );

  const itemsForStep = useMemo(() => {
    const items = pages[currentPageId] ?? [];
    return items.filter(
      (item): item is TextItem =>
        isTextItem(item) &&
        (typeof item.stepIndex === "number" ? item.stepIndex : 0) === currentStep
    );
  }, [pages, currentPageId, currentStep]);
  const maxStep = useMemo(() => {
    return Object.values(pages).reduce((max, items) => {
      return items.reduce((innerMax, item) => {
        if (!isTextItem(item) && !isImageItem(item)) return innerMax;
        const stepIndex =
          typeof item.stepIndex === "number" ? item.stepIndex : 0;
        return Math.max(innerMax, stepIndex);
      }, max);
    }, -1);
  }, [pages]);

  const cancelActive = useCallback(() => {
    resolveRef.current?.();
    resolveRef.current = null;
  }, []);

  useEffect(() => {
    itemsRef.current = itemsForStep;
  }, [itemsForStep]);

  const clearAutoTimer = useCallback(() => {
    if (autoTimerRef.current) {
      window.clearTimeout(autoTimerRef.current);
      autoTimerRef.current = null;
    }
  }, []);

  const onMove = useCallback(
    (pos: { x: number; y: number }, tool?: "chalk" | "marker") => {
      const resolvedTool = tool ?? "chalk";
      moveActor(pos, resolvedTool);
      if (resolvedTool !== lastSoundToolRef.current) {
        lastSoundToolRef.current = resolvedTool;
        play(resolvedTool);
      }
      setActor((prev) => {
        if (prev.visible && prev.isMoving && prev.type === resolvedTool) {
          return prev;
        }
        return {
          ...prev,
          visible: true,
          isMoving: true,
          type: resolvedTool,
        };
      });
    },
    [moveActor, play]
  );

  const onDone = useCallback(() => {
    resolveRef.current?.();
    resolveRef.current = null;
  }, []);

  const handleStepComplete = useCallback(() => {
    if (currentStep > maxStep) return;
    nextStep();
    if (!isAutoPlay || isPaused) return;
    const nextIndex = currentStep + 1;
    if (nextIndex > maxStep) {
      setAutoPlay(false);
      return;
    }
    clearAutoTimer();
    autoTimerRef.current = window.setTimeout(() => {
      triggerPlay();
    }, autoPlayDelayMs);
  }, [
    autoPlayDelayMs,
    clearAutoTimer,
    currentStep,
    isAutoPlay,
    isPaused,
    maxStep,
    nextStep,
    setAutoPlay,
    triggerPlay,
  ]);

  const runSequence = useCallback(async () => {
    if (!enabled) return;
    const items = itemsRef.current;

    cancelActive();
    runIdRef.current += 1;
    const runId = runIdRef.current;

    setAnimating(true);

    const audio = audioByStep[currentStep];
    const audioPromise = audio ? playAudio(audio.src) : Promise.resolve();

    const animationPromise = (async () => {
      if (items.length === 0) return;
      for (const item of items) {
        if (runIdRef.current !== runId) return;
        const mode = hasMathToken(item.content) ? "math" : "text";
        setActiveItemId(item.id);
        setActiveMode(mode);
        lastSoundToolRef.current = null;
        setActor((prev) => ({
          ...prev,
          type: "chalk",
          visible: false,
          isMoving: true,
        }));
        await new Promise<void>((resolve) => {
          resolveRef.current = resolve;
        });
      }
    })();

    await Promise.all([audioPromise, animationPromise]);

    if (runIdRef.current !== runId) return;
    setActiveItemId(null);
    setActiveMode(null);
    setActor((prev) => ({ ...prev, isMoving: false, visible: false }));
    stop();
    setAnimating(false);
    handleStepComplete();
  }, [
    audioByStep,
    cancelActive,
    enabled,
    handleStepComplete,
    setActor,
    setAnimating,
    stop,
    playAudio,
    currentStep,
  ]);

  useEffect(() => {
    if (!enabled) return;
    if (playSignal === lastPlaySignalRef.current) return;
    lastPlaySignalRef.current = playSignal;
    if (currentStep > maxStep) return;
    if (isPaused) setPaused(false);
    clearAutoTimer();
    runSequence();
  }, [clearAutoTimer, currentStep, enabled, isPaused, maxStep, playSignal, runSequence, setPaused]);

  useEffect(() => {
    if (!enabled) return;
    if (stopSignal === lastStopSignalRef.current) return;
    lastStopSignalRef.current = stopSignal;
    runIdRef.current += 1;
    cancelActive();
    setActiveItemId(null);
    setActiveMode(null);
    setActor((prev) => ({ ...prev, isMoving: false, visible: false }));
    stop();
    stopAudio();
    setAnimating(false);
    clearAutoTimer();
    if (isPaused) {
      setPaused(false);
    }
  }, [cancelActive, clearAutoTimer, enabled, isPaused, setAnimating, setPaused, stop, stopAudio, stopSignal]);

  useEffect(() => {
    if (!isPaused) return;
    stop();
    stopAudio();
    setActor((prev) => ({ ...prev, isMoving: false }));
    clearAutoTimer();
  }, [isPaused, stop, stopAudio]);

  useEffect(() => {
    return () => {
      cancelActive();
      stop();
      stopAudio();
      setAnimating(false);
      clearAutoTimer();
    };
  }, [cancelActive, clearAutoTimer, setAnimating, stop, stopAudio]);

  useEffect(() => {
    if (enabled) return;
    cancelActive();
    stop();
    stopAudio();
    setAnimating(false);
    setActiveItemId(null);
    setActiveMode(null);
    setActor(idleActor);
  }, [cancelActive, enabled, setAnimating, stop, stopAudio]);

  return {
    activeItemId,
    activeMode,
    isAnimating: activeItemId !== null || storeIsAnimating,
    speed: playbackSpeed,
    isPaused,
    skipSignal,
    stopSignal,
    onMove,
    onDone,
    actor,
  };
}
