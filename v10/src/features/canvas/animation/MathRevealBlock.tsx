"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

import { useBoardTransform } from "@features/hooks/useBoardTransform";
import { cn } from "@core/utils";
import { MathTextBlock } from "@features/canvas/MathTextBlock";

type MathRevealBlockProps = {
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
};

const DURATION_MS = 1200;
const BASELINE_OFFSET = 6;
const WIDTH_REFERENCE = 320;
const MIN_WEIGHT = 0.8;
const MAX_WEIGHT = 2.4;

const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3);

export function MathRevealBlock({
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
}: MathRevealBlockProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { toBoardPoint } = useBoardTransform();
  const rafRef = useRef(0);
  const progressRef = useRef(0);
  const startRef = useRef(0);
  const speedRef = useRef(speed);
  const pausedRef = useRef(isPaused);
  const skipRef = useRef(skipSignal);
  const stopRef = useRef(stopSignal);
  const [typesetReady, setTypesetReady] = useState(false);
  const mergedStyle: CSSProperties = {
    display: "inline-block",
    maxWidth: "100%",
    ...style,
  };
  const handleTypeset = useCallback(() => {
    setTypesetReady(true);
  }, []);

  const getContentRect = (el: HTMLDivElement) => {
    try {
      const range = document.createRange();
      range.selectNodeContents(el);
      const rect = range.getBoundingClientRect();
      if (rect.width > 0 || rect.height > 0) return rect;
    } catch {
      // ignore
    }
    return el.getBoundingClientRect();
  };

  const getDurationMs = (el: HTMLDivElement) => {
    const contentRect = getContentRect(el);
    const width = contentRect.width;
    const weight =
      width > 0
        ? Math.max(MIN_WEIGHT, Math.min(width / WIDTH_REFERENCE, MAX_WEIGHT))
        : 1;
    return (DURATION_MS * weight) / Math.max(0.1, speedRef.current);
  };

  useEffect(() => {
    speedRef.current = speed;
    if (!isActive) return;
    const el = ref.current;
    if (!el || !typesetReady) return;
    const duration = getDurationMs(el);
    startRef.current = performance.now() - progressRef.current * duration;
  }, [isActive, speed, typesetReady]);

  useEffect(() => {
    pausedRef.current = isPaused;
    if (!isPaused && isActive && rafRef.current === 0) {
      const el = ref.current;
      if (!el || !typesetReady) return;
      const duration = getDurationMs(el);
      startRef.current = performance.now() - progressRef.current * duration;
      rafRef.current = requestAnimationFrame(animateFrame);
    }
  }, [isActive, isPaused, typesetReady]);

  const animateFrame = (now: number) => {
    const el = ref.current;
    if (!el) return;
    const duration = getDurationMs(el);
    const progress = Math.min(1, (now - startRef.current) / duration);
    progressRef.current = progress;

    const contentRect = getContentRect(el);
    if (contentRect.width > 0 || contentRect.height > 0) {
      const x = contentRect.left + contentRect.width * 0.5;
      const y = contentRect.bottom - BASELINE_OFFSET;
      const boardPos = toBoardPoint(x, y);
      onMove(boardPos, "chalk");
    }
    const easeOut = easeOutCubic(progress);
    const popPhase = progress < 0.7 ? progress / 0.7 : (progress - 0.7) / 0.3;
    const scale =
      progress < 0.7 ? 0.98 + 0.04 * popPhase : 1.02 - 0.02 * popPhase;
    const opacity = Math.min(1, progress * 1.4);
    const blur = (1 - easeOut) * 2;
    el.style.opacity = String(opacity);
    el.style.filter = `blur(${blur.toFixed(2)}px)`;
    el.style.transform = `scale(${scale.toFixed(4)})`;

    if (progress < 1 && !pausedRef.current) {
      rafRef.current = requestAnimationFrame(animateFrame);
    } else {
      rafRef.current = 0;
      if (progress >= 1) {
        el.style.opacity = "1";
        el.style.filter = "";
        el.style.transform = "";
        el.style.transformOrigin = "";
        onDone();
      }
    }
  };

  useEffect(() => {
    const el = ref.current;
    if (!el || !isActive || !typesetReady) return;

    progressRef.current = 0;
    el.style.opacity = "0";
    el.style.filter = "blur(2px)";
    el.style.transform = "scale(0.98)";
    el.style.transformOrigin = "50% 60%";
    el.style.clipPath = "";
    el.style.setProperty("-webkit-clip-path", "");

    if (!pausedRef.current) {
      startRef.current = performance.now();
      rafRef.current = requestAnimationFrame(animateFrame);
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      el.style.opacity = "1";
      el.style.filter = "";
      el.style.transform = "";
      el.style.transformOrigin = "";
      el.style.clipPath = "";
      el.style.setProperty("-webkit-clip-path", "");
    };
  }, [isActive, onDone, onMove, toBoardPoint, typesetReady]);

  useEffect(() => {
    setTypesetReady(false);
  }, [html]);

  useEffect(() => {
    if (!isActive) {
      skipRef.current = skipSignal;
      return;
    }
    if (skipSignal === skipRef.current) return;
    skipRef.current = skipSignal;
    const el = ref.current;
    if (!el) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    el.style.opacity = "1";
    el.style.filter = "";
    el.style.transform = "";
    el.style.transformOrigin = "";
    el.style.clipPath = "";
    el.style.setProperty("-webkit-clip-path", "");
    progressRef.current = 1;
    onDone();
  }, [isActive, onDone, skipSignal]);

  useEffect(() => {
    if (!isActive) {
      stopRef.current = stopSignal;
      return;
    }
    if (stopSignal === stopRef.current) return;
    stopRef.current = stopSignal;
    const el = ref.current;
    if (!el) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    el.style.opacity = "1";
    el.style.filter = "";
    el.style.transform = "";
    el.style.transformOrigin = "";
    el.style.clipPath = "";
    el.style.setProperty("-webkit-clip-path", "");
  }, [isActive, stopSignal]);

  return (
    <div ref={ref} className={cn(className)} style={mergedStyle}>
      <MathTextBlock html={html} onTypeset={handleTypeset} />
    </div>
  );
}
