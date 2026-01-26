"use client";

import { useEffect, useRef } from "react";
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
  const mergedStyle: CSSProperties = {
    display: "inline-block",
    maxWidth: "100%",
    ...style,
  };

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

  useEffect(() => {
    speedRef.current = speed;
    if (!isActive) return;
    const duration = DURATION_MS / Math.max(0.1, speed);
    startRef.current = performance.now() - progressRef.current * duration;
  }, [isActive, speed]);

  useEffect(() => {
    pausedRef.current = isPaused;
    if (!isPaused && isActive && rafRef.current === 0) {
      const duration = DURATION_MS / Math.max(0.1, speedRef.current);
      startRef.current = performance.now() - progressRef.current * duration;
      rafRef.current = requestAnimationFrame(animateFrame);
    }
  }, [isActive, isPaused]);

  const animateFrame = (now: number) => {
    const el = ref.current;
    if (!el) return;
    const duration = DURATION_MS / Math.max(0.1, speedRef.current);
    const progress = Math.min(1, (now - startRef.current) / duration);
    progressRef.current = progress;

    const wrapperRect = el.getBoundingClientRect();
    const contentRect = getContentRect(el);
    if (contentRect.width > 0 || contentRect.height > 0) {
      const x = contentRect.left + contentRect.width * progress;
      const y = contentRect.bottom - BASELINE_OFFSET;
      const boardPos = toBoardPoint(x, y);
      onMove(boardPos, "chalk");
    }
    const contentLeft = contentRect.left - wrapperRect.left;
    const revealWidth = contentRect.width * progress;
    const rightClip = Math.max(
      0,
      wrapperRect.width - (contentLeft + revealWidth)
    );
    const leftClip = Math.max(0, contentLeft);
    el.style.clipPath = `inset(0 ${rightClip}px 0 ${leftClip}px)`;
    (el.style as CSSStyleDeclaration).webkitClipPath = `inset(0 ${rightClip}px 0 ${leftClip}px)`;

    if (progress < 1 && !pausedRef.current) {
      rafRef.current = requestAnimationFrame(animateFrame);
    } else {
      rafRef.current = 0;
      if (progress >= 1) {
        el.style.clipPath = "";
        (el.style as CSSStyleDeclaration).webkitClipPath = "";
        onDone();
      }
    }
  };

  useEffect(() => {
    const el = ref.current;
    if (!el || !isActive) return;

    progressRef.current = 0;
    const rect = el.getBoundingClientRect();
    const contentRect = getContentRect(el);
    const contentLeft = contentRect.left - rect.left;
    el.style.clipPath = `inset(0 ${rect.width}px 0 ${Math.max(
      0,
      contentLeft
    )}px)`;
    (el.style as CSSStyleDeclaration).webkitClipPath = `inset(0 ${rect.width}px 0 ${Math.max(
      0,
      contentLeft
    )}px)`;

    if (!pausedRef.current) {
      startRef.current = performance.now();
      rafRef.current = requestAnimationFrame(animateFrame);
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      el.style.clipPath = "";
      (el.style as CSSStyleDeclaration).webkitClipPath = "";
    };
  }, [isActive, onDone, onMove, toBoardPoint]);

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
    el.style.clipPath = "";
    (el.style as CSSStyleDeclaration).webkitClipPath = "";
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
    el.style.clipPath = "";
    (el.style as CSSStyleDeclaration).webkitClipPath = "";
  }, [isActive, stopSignal]);

  return (
    <div ref={ref} className={cn(className)} style={mergedStyle}>
      <MathTextBlock html={html} />
    </div>
  );
}
