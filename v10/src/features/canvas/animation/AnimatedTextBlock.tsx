"use client";

import { useCallback, useEffect, useRef } from "react";
import type { CSSProperties } from "react";

import { useBoardTransform } from "@features/hooks/useBoardTransform";
import { cn } from "@core/utils";

type AnimatedTextBlockProps = {
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

const DURATION_PER_CHAR_MS = 26;
const MIN_DURATION_MS = 320;
const MAX_DURATION_MS = 7000;
const HIGHLIGHT_PER_CHAR_MS = 42;
const MIN_HIGHLIGHT_MS = 420;
const MAX_HIGHLIGHT_MS = 12000;
const BASELINE_OFFSET = 4;
const CLIP_OVERSCAN_PX = 2;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

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

const getHighlightColor = (node: Node) => {
  let current = node.parentElement;
  while (current) {
    if (current.classList.contains("hl-yellow")) {
      return "yellow";
    }
    if (current.classList.contains("hl-cyan")) {
      return "cyan";
    }
    current = current.parentElement;
  }
  return null;
};

const buildCharSpans = (root: HTMLElement) => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  let node = walker.nextNode();
  while (node) {
    if (node.nodeType === Node.TEXT_NODE) {
      textNodes.push(node as Text);
    }
    node = walker.nextNode();
  }

  let index = 0;
  textNodes.forEach((textNode) => {
    const text = textNode.textContent ?? "";
    const highlightColor = getHighlightColor(textNode);
    const fragment = document.createDocumentFragment();
    for (const char of text) {
      const span = document.createElement("span");
      span.textContent = char;
      span.dataset.charIndex = String(index);
      if (highlightColor) {
        span.dataset.highlight = "1";
        span.dataset.highlightColor = highlightColor;
      }
      span.className = "tw-char";
      fragment.appendChild(span);
      index += 1;
    }
    textNode.parentNode?.replaceChild(fragment, textNode);
  });
};

export function AnimatedTextBlock({
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
}: AnimatedTextBlockProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef(0);
  const startRef = useRef(0);
  const elapsedRef = useRef(0);
  const speedRef = useRef(speed);
  const pausedRef = useRef(isPaused);
  const skipRef = useRef(skipSignal);
  const stopRef = useRef(stopSignal);
  const highlightSpansRef = useRef<HTMLElement[]>([]);
  const highlightIndexRef = useRef(0);
  const lastHighlightPosRef = useRef<{ x: number; y: number } | null>(null);
  const { toBoardPoint } = useBoardTransform();
  const mergedStyle: CSSProperties = {
    display: "inline-block",
    maxWidth: "100%",
    ...style,
  };

  const getRevealDurationMs = useCallback((el: HTMLDivElement) => {
    const length = el.textContent?.length ?? 0;
    if (length === 0) return 0;
    const base = length * DURATION_PER_CHAR_MS;
    return clamp(
      base / Math.max(0.1, speedRef.current),
      MIN_DURATION_MS,
      MAX_DURATION_MS
    );
  }, []);

  const getHighlightDurationMs = useCallback((count: number) => {
    if (count === 0) return 0;
    const base = count * HIGHLIGHT_PER_CHAR_MS;
    return clamp(
      base / Math.max(0.1, speedRef.current),
      MIN_HIGHLIGHT_MS,
      MAX_HIGHLIGHT_MS
    );
  }, []);

  const animateFrame = useCallback(
    (now: number) => {
      const el = ref.current;
      if (!el) return;
      const revealDuration = getRevealDurationMs(el);
      const highlightSpans = highlightSpansRef.current;
      const highlightDuration = getHighlightDurationMs(highlightSpans.length);
      const totalDuration = revealDuration + highlightDuration;
      if (totalDuration <= 0) {
        el.style.clipPath = "";
        el.style.setProperty("-webkit-clip-path", "");
        onDone();
        return;
      }

      const elapsed = Math.min(totalDuration, now - startRef.current);
      elapsedRef.current = elapsed;

      if (revealDuration > 0) {
        const revealProgress = Math.min(1, elapsed / revealDuration);
        const wrapperRect = el.getBoundingClientRect();
        const contentRect = getContentRect(el);
        if (contentRect.width > 0 || contentRect.height > 0) {
          const lead = Math.max(6, Math.min(contentRect.width * 0.05, 14));
          const x = contentRect.left + contentRect.width * revealProgress + lead;
          const y = contentRect.bottom - BASELINE_OFFSET;
          const boardPos = toBoardPoint(x, y);
          onMove(boardPos, "chalk");
        }
        const contentLeft = contentRect.left - wrapperRect.left;
        const revealWidth = contentRect.width * revealProgress;
        const leftClip = Math.max(
          0,
          Math.floor(contentLeft) - CLIP_OVERSCAN_PX
        );
        const rightClip = Math.max(
          0,
          Math.ceil(wrapperRect.width - (contentLeft + revealWidth)) -
            CLIP_OVERSCAN_PX
        );
        const clipValue = `inset(0 ${rightClip}px 0 ${leftClip}px)`;
        el.style.clipPath = clipValue;
        el.style.setProperty("-webkit-clip-path", clipValue);
      }

      if (highlightSpans.length > 0 && elapsed >= revealDuration) {
        const highlightElapsed = elapsed - revealDuration;
        const highlightProgress =
          highlightDuration > 0
            ? Math.min(1, highlightElapsed / highlightDuration)
            : 1;
        const exactIndex = highlightProgress * highlightSpans.length;
        const targetIndex = Math.min(
          Math.floor(exactIndex),
          highlightSpans.length
        );
        for (let i = highlightIndexRef.current; i < targetIndex; i += 1) {
          highlightSpans[i].dataset.hlActive = "1";
        }
        highlightIndexRef.current = targetIndex;
        const activeIndex = Math.min(
          Math.max(Math.floor(exactIndex), 0),
          highlightSpans.length - 1
        );
        const intra = Math.min(
          1,
          Math.max(0, exactIndex - activeIndex)
        );
        const activeSpan = highlightSpans[activeIndex];
        if (activeSpan) {
          const rect = activeSpan.getBoundingClientRect();
          if (rect.width > 0 || rect.height > 0) {
            const lead = Math.max(4, Math.min(rect.width, 10));
            const boardPos = toBoardPoint(
              rect.left + rect.width * intra + lead,
              rect.bottom - BASELINE_OFFSET
            );
            lastHighlightPosRef.current = boardPos;
            onMove(boardPos, "marker");
          } else if (lastHighlightPosRef.current) {
            onMove(lastHighlightPosRef.current, "marker");
          }
        }
      }

      if (elapsed < totalDuration && !pausedRef.current) {
        rafRef.current = requestAnimationFrame(animateFrame);
      } else {
        rafRef.current = 0;
        el.style.clipPath = "";
        el.style.setProperty("-webkit-clip-path", "");
        if (highlightSpans.length > 0) {
          highlightSpans.forEach((span) => {
            span.dataset.hlActive = "1";
          });
        }
        onDone();
      }
    },
    [getHighlightDurationMs, getRevealDurationMs, onDone, onMove, toBoardPoint]
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = html;

    const hasHighlight = Boolean(el.querySelector(".hl-yellow, .hl-cyan"));
    if (hasHighlight) {
      buildCharSpans(el);
      const spans = Array.from(
        el.querySelectorAll<HTMLElement>("[data-char-index]")
      );
      spans.forEach((span) => span.classList.add("tw-visible"));
      highlightSpansRef.current = Array.from(
        el.querySelectorAll<HTMLElement>("[data-highlight='1']")
      );
    } else {
      highlightSpansRef.current = [];
    }
  }, [html]);

  useEffect(() => {
    speedRef.current = speed;
    if (!isActive) return;
    const el = ref.current;
    if (!el) return;
    const revealDuration = getRevealDurationMs(el);
    const highlightDuration = getHighlightDurationMs(
      highlightSpansRef.current.length
    );
    const totalDuration = revealDuration + highlightDuration;
    startRef.current = performance.now() - elapsedRef.current;
    if (elapsedRef.current > totalDuration) {
      elapsedRef.current = totalDuration;
    }
  }, [getHighlightDurationMs, getRevealDurationMs, isActive, speed]);

  useEffect(() => {
    pausedRef.current = isPaused;
    if (!isPaused && isActive && rafRef.current === 0) {
      const el = ref.current;
      if (!el) return;
      startRef.current = performance.now() - elapsedRef.current;
      rafRef.current = requestAnimationFrame(animateFrame);
    }
  }, [animateFrame, isActive, isPaused]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !isActive) return;

    elapsedRef.current = 0;
    highlightIndexRef.current = 0;
    lastHighlightPosRef.current = null;

    highlightSpansRef.current.forEach((span) => {
      delete span.dataset.hlActive;
    });

    const rect = el.getBoundingClientRect();
    const contentRect = getContentRect(el);
    const contentLeft = contentRect.left - rect.left;
    const initialLeftClip = Math.max(
      0,
      Math.floor(contentLeft) - CLIP_OVERSCAN_PX
    );
    const initialRightClip = Math.ceil(rect.width + CLIP_OVERSCAN_PX * 2);
    const initialClip = `inset(0 ${initialRightClip}px 0 ${initialLeftClip}px)`;
    el.style.clipPath = initialClip;
    el.style.setProperty("-webkit-clip-path", initialClip);

    if (!pausedRef.current) {
      startRef.current = performance.now();
      rafRef.current = requestAnimationFrame(animateFrame);
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      el.style.clipPath = "";
      el.style.setProperty("-webkit-clip-path", "");
    };
  }, [animateFrame, isActive]);

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
    el.style.setProperty("-webkit-clip-path", "");
    highlightSpansRef.current.forEach((span) => {
      span.dataset.hlActive = "1";
    });
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
    el.style.setProperty("-webkit-clip-path", "");
  }, [isActive, stopSignal]);

  return (
    <div
      ref={ref}
      className={cn(className, isActive && "hl-temporary")}
      style={mergedStyle}
    />
  );
}
