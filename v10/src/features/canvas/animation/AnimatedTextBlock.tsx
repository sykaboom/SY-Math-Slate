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

const CHAR_INTERVAL_MS = 28;
const MIN_INTERVAL_MS = 8;
const HIGHLIGHT_INTERVAL_MS = 20;
const HIGHLIGHT_MIN_INTERVAL_MS = 10;
const BASELINE_OFFSET = 4;

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

  return index;
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
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const stepRef = useRef<(() => void) | null>(null);
  const speedRef = useRef(speed);
  const pausedRef = useRef(isPaused);
  const skipRef = useRef(skipSignal);
  const stopRef = useRef(stopSignal);
  const highlightSpansRef = useRef<HTMLElement[]>([]);
  const { toBoardPoint } = useBoardTransform();

  const revealAll = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const spans = Array.from(el.querySelectorAll<HTMLElement>("[data-char-index]"));
    spans.forEach((span) => span.classList.add("tw-visible"));
    highlightSpansRef.current.forEach((span) => {
      span.dataset.hlActive = "1";
    });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = html;
    buildCharSpans(el);
    highlightSpansRef.current = Array.from(
      el.querySelectorAll<HTMLElement>("[data-highlight='1']")
    );
    if (!isActive) {
      revealAll();
    }
  }, [html, isActive, revealAll]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    pausedRef.current = isPaused;
    if (!isPaused && isActive && stepRef.current && timeoutRef.current === null) {
      stepRef.current();
    }
  }, [isPaused, isActive]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !isActive) return;

    const spans = Array.from(el.querySelectorAll<HTMLElement>("[data-char-index]"));
    spans.forEach((span) => span.classList.remove("tw-visible"));
    highlightSpansRef.current.forEach((span) => {
      delete span.dataset.hlActive;
    });

    let index = 0;
    let cancelled = false;

    const step = () => {
      if (cancelled) return;
      if (pausedRef.current) {
        timeoutRef.current = null;
        return;
      }
      if (index >= spans.length) {
        const highlightSpans = highlightSpansRef.current;
        if (highlightSpans.length === 0) {
          revealAll();
          onDone();
          return;
        }
        let highlightIndex = 0;
        const highlightStep = () => {
          if (cancelled) return;
          if (pausedRef.current) {
            timeoutRef.current = null;
            return;
          }
          if (highlightIndex >= highlightSpans.length) {
            onDone();
            return;
          }
          const span = highlightSpans[highlightIndex];
          span.dataset.hlActive = "1";
          const rect = span.getBoundingClientRect();
          if (rect.width > 0 || rect.height > 0) {
            const boardPos = toBoardPoint(
              rect.left + rect.width / 2,
              rect.bottom - BASELINE_OFFSET
            );
            lastPosRef.current = boardPos;
            onMove(boardPos, "marker");
          } else if (lastPosRef.current) {
            onMove(lastPosRef.current, "marker");
          }
          highlightIndex += 1;
          const interval = Math.max(
            HIGHLIGHT_MIN_INTERVAL_MS,
            HIGHLIGHT_INTERVAL_MS / Math.max(0.1, speedRef.current)
          );
          timeoutRef.current = window.setTimeout(highlightStep, interval);
        };
        highlightStep();
        return;
      }
      const span = spans[index];
      span.classList.add("tw-visible");
      const rect = span.getBoundingClientRect();
      if (rect.width > 0 || rect.height > 0) {
        const boardPos = toBoardPoint(
          rect.left + rect.width / 2,
          rect.bottom - BASELINE_OFFSET
        );
        lastPosRef.current = boardPos;
        onMove(boardPos, "chalk");
      } else if (lastPosRef.current) {
        onMove(lastPosRef.current, "chalk");
      }
      index += 1;
      const interval = Math.max(
        MIN_INTERVAL_MS,
        CHAR_INTERVAL_MS / Math.max(0.1, speedRef.current)
      );
      timeoutRef.current = window.setTimeout(step, interval);
    };

    stepRef.current = step;
    step();

    return () => {
      cancelled = true;
      stepRef.current = null;
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isActive, onDone, onMove, revealAll, toBoardPoint]);

  useEffect(() => {
    if (!isActive) {
      skipRef.current = skipSignal;
      return;
    }
    if (skipSignal === skipRef.current) return;
    skipRef.current = skipSignal;
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    revealAll();
    onDone();
  }, [isActive, onDone, revealAll, skipSignal]);

  useEffect(() => {
    if (!isActive) {
      stopRef.current = stopSignal;
      return;
    }
    if (stopSignal === stopRef.current) return;
    stopRef.current = stopSignal;
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    stepRef.current = null;
  }, [isActive, stopSignal]);

  return (
    <div
      ref={ref}
      className={cn(className, isActive && "hl-temporary")}
      style={style}
    />
  );
}
