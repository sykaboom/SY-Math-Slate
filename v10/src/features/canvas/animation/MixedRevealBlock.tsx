"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

import { loadMathJax } from "@core/math/loader";
import { typesetElement } from "@core/math/render";
import { cn } from "@core/utils";
import { useBoardTransform } from "@features/hooks/useBoardTransform";
import { AnimatedTextBlock } from "@features/canvas/animation/AnimatedTextBlock";
import { MathRevealBlock } from "@features/canvas/animation/MathRevealBlock";

type MixedRevealBlockProps = {
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

type TextRun = {
  type: "text";
  spans: HTMLElement[];
  highlightSpans: HTMLElement[];
};

type MathRun = {
  type: "math";
  node: HTMLElement;
};

type TextOverlayLine = {
  container: HTMLDivElement;
  left: number;
  right: number;
  width: number;
  bottom: number;
};

type TextOverlay = {
  lines: TextOverlayLine[];
  bounds: { minLeft: number; maxRight: number };
};

type TextRunDraft = {
  type: "text";
  nodes: Text[];
};

type MathRunDraft = {
  type: "math";
  node: HTMLElement;
};

type Run = TextRun | MathRun;

const TEXT_DURATION_PER_CHAR_MS = 26;
const MIN_TEXT_DURATION_MS = 320;
const MAX_TEXT_DURATION_MS = 7000;
const HIGHLIGHT_PER_CHAR_MS = 42;
const MIN_HIGHLIGHT_MS = 420;
const MAX_HIGHLIGHT_MS = 12000;
const BASELINE_OFFSET_TEXT = 4;
const BASELINE_OFFSET_MATH = 6;
const MATH_DURATION_MS = 1200;
const WIDTH_REFERENCE = 320;
const MIN_WEIGHT = 0.8;
const MAX_WEIGHT = 2.4;
const CLIP_OVERSCAN_PX = 2;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const hasMathToken = (value: string) => value.includes("$");

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

const buildTextOverlay = (
  spans: HTMLElement[],
  hostRect: DOMRect,
  overlayRoot: HTMLDivElement,
  transform: { scale: number; offsetX: number; offsetY: number }
): TextOverlay | null => {
  const lineGroups: Array<{
    top: number;
    metrics: Array<{
      span: HTMLElement;
      rect: DOMRect;
      boxTop: number;
      boxBottom: number;
    }>;
  }> = [];
  const scale = transform.scale;
  const offsetX = transform.offsetX;
  const offsetY = transform.offsetY;
  const hostLeft = (hostRect.left - offsetX) / scale;
  const hostTop = (hostRect.top - offsetY) / scale;

  spans.forEach((span) => {
    const rect = span.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;
    const style = window.getComputedStyle(span);
    const lineHeight = Number.parseFloat(style.lineHeight);
    const effectiveLineHeight =
      Number.isFinite(lineHeight) && lineHeight > 0 ? lineHeight : rect.height;
    const extra = Math.max(0, effectiveLineHeight - rect.height);
    const boxTop = rect.top - extra / 2;
    const boxBottom = rect.bottom + extra / 2;
    const localTop = (boxTop - offsetY) / scale;
    const top = Math.round(localTop);
    let group = lineGroups.find((line) => Math.abs(line.top - top) <= 1);
    if (!group) {
      group = { top, metrics: [] };
      lineGroups.push(group);
    }
    group.metrics.push({ span, rect, boxTop, boxBottom });
  });

  if (lineGroups.length === 0) return null;

  overlayRoot.innerHTML = "";
  const lines: TextOverlayLine[] = [];
  lineGroups
    .sort((a, b) => a.top - b.top)
    .forEach((group) => {
      const leftScreen = Math.min(...group.metrics.map((item) => item.rect.left));
      const topScreen = Math.min(...group.metrics.map((item) => item.boxTop));
      const left = Math.min(
        ...group.metrics.map((item) => (item.rect.left - offsetX) / scale)
      );
      const right = Math.max(
        ...group.metrics.map((item) => (item.rect.right - offsetX) / scale)
      );
      const top = Math.min(
        ...group.metrics.map((item) => (item.boxTop - offsetY) / scale)
      );
      const bottom = Math.max(
        ...group.metrics.map((item) => (item.boxBottom - offsetY) / scale)
      );
      const cursorBottom = Math.max(
        ...group.metrics.map((item) => (item.rect.bottom - offsetY) / scale)
      );
      if (right - left <= 0 || bottom - top <= 0) return;

      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.left = `${left - hostLeft}px`;
      container.style.top = `${top - hostTop}px`;
      container.style.width = `${right - left}px`;
      container.style.height = `${bottom - top}px`;
      container.style.overflow = "hidden";
      container.style.pointerEvents = "none";
      container.style.whiteSpace = "pre";
      container.style.transformOrigin = "0 0";

      const lineContent = document.createElement("span");
      lineContent.style.display = "inline-block";
      lineContent.style.whiteSpace = "pre";
      group.metrics.forEach((item) => {
        const clone = item.span.cloneNode(true) as HTMLElement;
        clone.classList.add("tw-visible");
        delete clone.dataset.hlActive;
        lineContent.appendChild(clone);
      });
      container.appendChild(lineContent);
      overlayRoot.appendChild(container);

      const overlayRect = container.getBoundingClientRect();
      if (overlayRect.width > 0 || overlayRect.height > 0) {
        const deltaX = (leftScreen - overlayRect.left) / scale;
        const deltaY = (topScreen - overlayRect.top) / scale;
        if (Number.isFinite(deltaX) || Number.isFinite(deltaY)) {
          container.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        }
      }

      lines.push({
        container,
        left,
        right,
        width: right - left,
        bottom: cursorBottom,
      });
    });

  if (lines.length === 0) return null;
  const minLeft = Math.min(...lines.map((line) => line.left));
  const maxRight = Math.max(...lines.map((line) => line.right));
  return { lines, bounds: { minLeft, maxRight } };
};

const buildCharSpansForNodes = (textNodes: Text[]) => {
  const spans: HTMLElement[] = [];
  textNodes.forEach((textNode) => {
    const text = textNode.textContent ?? "";
    const highlightColor = getHighlightColor(textNode);
    const fragment = document.createDocumentFragment();
    for (const char of text) {
      const span = document.createElement("span");
      span.textContent = char;
      if (highlightColor) {
        span.dataset.highlight = "1";
        span.dataset.highlightColor = highlightColor;
      }
      span.className = "tw-char";
      fragment.appendChild(span);
      spans.push(span);
    }
    textNode.parentNode?.replaceChild(fragment, textNode);
  });
  return spans;
};

const hasVisibleText = (root: HTMLElement) => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      if (!(node instanceof Text)) return NodeFilter.FILTER_REJECT;
      if (!node.nodeValue) return NodeFilter.FILTER_REJECT;
      if (node.parentElement?.closest("mjx-container")) {
        return NodeFilter.FILTER_REJECT;
      }
      if (node.nodeValue.replace(/\s+/g, "") === "") {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  return Boolean(walker.nextNode());
};

const buildRuns = (root: HTMLElement) => {
  const drafts: Array<TextRunDraft | MathRunDraft> = [];
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          if (!(node instanceof Text)) return NodeFilter.FILTER_REJECT;
          if (node.parentElement?.closest("mjx-container")) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as Element;
          if (el.tagName.toLowerCase() === "mjx-container") {
            return NodeFilter.FILTER_ACCEPT;
          }
          return NodeFilter.FILTER_SKIP;
        }
        return NodeFilter.FILTER_REJECT;
      },
    }
  );

  let textNodes: Text[] = [];

  const flushText = () => {
    if (textNodes.length === 0) return;
    drafts.push({ type: "text", nodes: textNodes });
    textNodes = [];
  };

  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.nodeType === Node.TEXT_NODE) {
      textNodes.push(node as Text);
      continue;
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      if (el.tagName.toLowerCase() === "mjx-container") {
        flushText();
        drafts.push({ type: "math", node: el });
      }
    }
  }
  flushText();

  return drafts.map((draft) => {
    if (draft.type === "math") return draft;
    const spans = buildCharSpansForNodes(draft.nodes);
    const highlightSpans = spans.filter(
      (span) => span.dataset.highlight === "1"
    );
    return { type: "text", spans, highlightSpans };
  });
};

export function MixedRevealBlock({
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
}: MixedRevealBlockProps) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const overlayHostRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const overlayDataRef = useRef<TextOverlay | null>(null);
  const runsRef = useRef<Run[]>([]);
  const rafRef = useRef(0);
  const startRef = useRef(0);
  const elapsedRef = useRef(0);
  const phaseDurationRef = useRef(0);
  const runIndexRef = useRef(0);
  const highlightIndexRef = useRef(0);
  const phaseRef = useRef<"text-reveal" | "text-highlight" | "math">("text-reveal");
  const renderIdRef = useRef(0);
  const skipRef = useRef(skipSignal);
  const stopRef = useRef(stopSignal);
  const speedRef = useRef(speed);
  const pausedRef = useRef(isPaused);
  const onMoveRef = useRef(onMove);
  const onDoneRef = useRef(onDone);
  const lastHighlightPosRef = useRef<{ x: number; y: number } | null>(null);
  const lastTextPosRef = useRef<{ x: number; y: number } | null>(null);
  const { toBoardPoint, getTransform, updateTransform } = useBoardTransform();

  const [mode, setMode] = useState<"mixed" | "math" | "text">("text");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    pausedRef.current = isPaused;
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
    el.innerHTML = html;

    if (!hasMathToken(html)) {
      setMode("text");
      setReady(true);
      return;
    }

    const run = async () => {
      try {
        await loadMathJax();
        if (renderIdRef.current !== renderId) return;
        await typesetElement(el);
        if (renderIdRef.current !== renderId) return;
        const hasMath = el.querySelectorAll("mjx-container").length > 0;
        const hasText = hasVisibleText(el);
        if (hasMath && hasText) {
          runsRef.current = buildRuns(el);
          setMode("mixed");
        } else if (hasMath) {
          setMode("math");
        } else {
          setMode("text");
        }
        setReady(true);
      } catch {
        if (renderIdRef.current !== renderId) return;
        setMode("text");
        setReady(true);
      }
    };

    run();
  }, [html]);

  const revealAll = useCallback(() => {
    if (overlayRef.current) {
      overlayRef.current.innerHTML = "";
      overlayRef.current.style.display = "none";
    }
    overlayDataRef.current = null;
    runsRef.current.forEach((run) => {
      if (run.type === "text") {
        run.spans.forEach((span) => span.classList.add("tw-visible"));
        run.highlightSpans.forEach((span) => {
          span.dataset.hlActive = "1";
        });
      } else {
        run.node.style.visibility = "visible";
        run.node.style.opacity = "1";
        run.node.style.filter = "";
        run.node.style.transform = "";
        run.node.style.transformOrigin = "";
      }
    });
  }, []);

  const finishAnimation = useCallback(() => {
    revealAll();
    if (contentRef.current) {
      contentRef.current.classList.remove("hl-temporary");
    }
    onDoneRef.current?.();
  }, [revealAll]);

  const getTextDuration = useCallback((count: number) => {
    if (count === 0) return 0;
    const base = count * TEXT_DURATION_PER_CHAR_MS;
    return clamp(
      base / Math.max(0.1, speedRef.current),
      MIN_TEXT_DURATION_MS,
      MAX_TEXT_DURATION_MS
    );
  }, []);

  const getHighlightDuration = useCallback((count: number) => {
    if (count === 0) return 0;
    const base = count * HIGHLIGHT_PER_CHAR_MS;
    return clamp(
      base / Math.max(0.1, speedRef.current),
      MIN_HIGHLIGHT_MS,
      MAX_HIGHLIGHT_MS
    );
  }, []);

  const getMathDuration = useCallback((width: number) => {
    const weight =
      width > 0
        ? Math.max(MIN_WEIGHT, Math.min(width / WIDTH_REFERENCE, MAX_WEIGHT))
        : 1;
    return (MATH_DURATION_MS * weight) / Math.max(0.1, speedRef.current);
  }, []);

  const startPhase = useCallback((now: number) => {
    startRef.current = now;
    elapsedRef.current = 0;
  }, []);

  const beginRun = useCallback(
    (run: Run, now: number) => {
      highlightIndexRef.current = 0;
      lastHighlightPosRef.current = null;
      lastTextPosRef.current = null;

      if (run.type === "text") {
        const overlayHost = overlayHostRef.current;
        const overlayRoot = overlayRef.current;
        overlayDataRef.current = null;
        if (overlayHost && overlayRoot) {
          const hostRect = overlayHost.getBoundingClientRect();
          let transform = getTransform();
          if (!Number.isFinite(transform.scale) || transform.scale === 0) {
            updateTransform();
            transform = getTransform();
          }
          overlayRoot.style.display = "block";
          if (!Number.isFinite(transform.scale) || transform.scale === 0) {
            overlayRoot.style.display = "none";
            overlayDataRef.current = null;
          } else {
            overlayDataRef.current = buildTextOverlay(
              run.spans,
              hostRect,
              overlayRoot,
              transform
            );
          }
          if (overlayDataRef.current) {
            overlayDataRef.current.lines.forEach((line) => {
              const initialRightClip = Math.ceil(
                line.width + CLIP_OVERSCAN_PX * 2
              );
              const initialClip = `inset(0 ${initialRightClip}px 0 0)`;
              line.container.style.clipPath = initialClip;
              line.container.style.setProperty("-webkit-clip-path", initialClip);
            });
          } else {
            overlayRoot.style.display = "none";
          }
        }
        run.spans.forEach((span) => span.classList.remove("tw-visible"));
        run.highlightSpans.forEach((span) => {
          delete span.dataset.hlActive;
        });
        phaseRef.current = "text-reveal";
        phaseDurationRef.current = getTextDuration(run.spans.length);
        startPhase(now);
        return;
      }

      run.node.style.visibility = "visible";
      run.node.style.opacity = "0";
      run.node.style.filter = "blur(2px)";
      run.node.style.transform = "scale(0.98)";
      run.node.style.transformOrigin = "50% 60%";
      const rect = run.node.getBoundingClientRect();
      phaseRef.current = "math";
      phaseDurationRef.current = getMathDuration(rect.width);
      startPhase(now);
    },
    [getMathDuration, getTextDuration, getTransform, startPhase, updateTransform]
  );

  const advanceRun = useCallback(
    (now: number) => {
      const runs = runsRef.current;
      if (runs.length === 0) {
        finishAnimation();
        return;
      }
      runIndexRef.current += 1;
      if (runIndexRef.current >= runs.length) {
        finishAnimation();
        return;
      }
      beginRun(runs[runIndexRef.current], now);
    },
    [beginRun, finishAnimation]
  );

  const animateFrame = useCallback(
    (now: number) => {
      const runs = runsRef.current;
      const run = runs[runIndexRef.current];
      if (!run) {
        finishAnimation();
        return;
      }
      const duration = phaseDurationRef.current;
      const elapsed = duration > 0 ? Math.min(duration, now - startRef.current) : duration;
      elapsedRef.current = elapsed;

      if (run.type === "text") {
        if (phaseRef.current === "text-reveal") {
          const overlayData = overlayDataRef.current;
          const revealDuration = duration;
          const progress =
            revealDuration > 0 ? Math.min(1, elapsed / revealDuration) : 1;
          if (overlayData) {
            const { lines, bounds } = overlayData;
            const runWidth = Math.max(0, bounds.maxRight - bounds.minLeft);
            const clipX = bounds.minLeft + runWidth * progress;
            let activeLine = lines[lines.length - 1];
            lines.forEach((line) => {
              const reveal = Math.min(
                line.width,
                Math.max(0, clipX - line.left)
              );
              const rightClip = Math.max(
                0,
                Math.ceil(line.width - reveal) - CLIP_OVERSCAN_PX
              );
              const clipValue = `inset(0 ${rightClip}px 0 0)`;
              line.container.style.clipPath = clipValue;
              line.container.style.setProperty("-webkit-clip-path", clipValue);
              if (clipX <= line.right) {
                activeLine = line;
              }
            });
            const targetX = Math.min(
              activeLine.right,
              Math.max(activeLine.left, clipX)
            );
            const lead = Math.max(6, Math.min(activeLine.width * 0.05, 14));
            const boardPos = {
              x: targetX + lead,
              y: activeLine.bottom - BASELINE_OFFSET_TEXT,
            };
            lastTextPosRef.current = boardPos;
            onMoveRef.current?.(boardPos, "chalk");
          } else if (lastTextPosRef.current) {
            onMoveRef.current?.(lastTextPosRef.current, "chalk");
          }

          if (progress >= 1) {
            if (overlayRef.current) {
              overlayRef.current.innerHTML = "";
              overlayRef.current.style.display = "none";
            }
            overlayDataRef.current = null;
            run.spans.forEach((span) => span.classList.add("tw-visible"));
            if (run.highlightSpans.length > 0) {
              phaseRef.current = "text-highlight";
              phaseDurationRef.current = getHighlightDuration(
                run.highlightSpans.length
              );
              startPhase(now);
            } else {
              advanceRun(now);
            }
          }
        } else {
          const highlightSpans = run.highlightSpans;
          const highlightDuration = duration;
          const progress =
            highlightDuration > 0 ? Math.min(1, elapsed / highlightDuration) : 1;
          const exactIndex = progress * highlightSpans.length;
          const targetIndex = Math.min(
            Math.floor(exactIndex),
            highlightSpans.length
          );
          for (let i = highlightIndexRef.current; i < targetIndex; i += 1) {
            const span = highlightSpans[i];
            if (span) {
              span.dataset.hlActive = "1";
            }
          }
          highlightIndexRef.current = Math.min(
            targetIndex,
            highlightSpans.length
          );
          const activeIndex =
            highlightSpans.length > 0
              ? Math.min(
                  Math.max(Math.floor(exactIndex), 0),
                  highlightSpans.length - 1
                )
              : -1;
          const activeSpan =
            activeIndex >= 0 ? highlightSpans[activeIndex] : undefined;
          if (activeSpan) {
            const rect = activeSpan.getBoundingClientRect();
            if (rect.width > 0 || rect.height > 0) {
              const lead = Math.max(4, Math.min(rect.width, 10));
              const boardPos = toBoardPoint(
                rect.left + rect.width + lead,
                rect.bottom - BASELINE_OFFSET_TEXT
              );
              lastHighlightPosRef.current = boardPos;
              onMoveRef.current?.(boardPos, "marker");
            } else if (lastHighlightPosRef.current) {
              onMoveRef.current?.(lastHighlightPosRef.current, "marker");
            }
          }
          if (progress >= 1) {
            highlightSpans.forEach((span) => {
              if (span) {
                span.dataset.hlActive = "1";
              }
            });
            advanceRun(now);
          }
        }
      } else {
        const rect = run.node.getBoundingClientRect();
        const mathDuration = duration;
        const progress =
          mathDuration > 0 ? Math.min(1, elapsed / mathDuration) : 1;
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const popPhase = progress < 0.7 ? progress / 0.7 : (progress - 0.7) / 0.3;
        const scale =
          progress < 0.7
            ? 0.98 + 0.04 * popPhase
            : 1.02 - 0.02 * popPhase;
        const opacity = Math.min(1, progress * 1.4);
        const blur = (1 - easeOut) * 2;
        run.node.style.opacity = String(opacity);
        run.node.style.filter = `blur(${blur.toFixed(2)}px)`;
        run.node.style.transform = `scale(${scale.toFixed(4)})`;
        const x = rect.left + rect.width * 0.5;
        const y = rect.bottom - BASELINE_OFFSET_MATH;
        const boardPos = toBoardPoint(x, y);
        onMoveRef.current?.(boardPos, "chalk");

        if (progress >= 1) {
          run.node.style.opacity = "1";
          run.node.style.filter = "";
          run.node.style.transform = "";
          run.node.style.transformOrigin = "";
          advanceRun(now);
        }
      }

      if (!pausedRef.current) {
        rafRef.current = requestAnimationFrame(animateFrame);
      } else {
        rafRef.current = 0;
      }
    },
    [advanceRun, finishAnimation, getHighlightDuration, startPhase, toBoardPoint]
  );

  useEffect(() => {
    if (!isActive || mode !== "mixed" || !ready) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const el = contentRef.current;
    if (el) {
      el.classList.add("hl-temporary");
    }

    runsRef.current.forEach((run) => {
      if (run.type === "text") {
        run.spans.forEach((span) => span.classList.remove("tw-visible"));
        run.highlightSpans.forEach((span) => {
          delete span.dataset.hlActive;
        });
      } else {
        run.node.style.visibility = "hidden";
        run.node.style.opacity = "0";
        run.node.style.filter = "";
        run.node.style.transform = "";
        run.node.style.transformOrigin = "";
      }
    });
    if (overlayRef.current) {
      overlayRef.current.innerHTML = "";
      overlayRef.current.style.display = "none";
    }
    overlayDataRef.current = null;

    runIndexRef.current = 0;
    const runs = runsRef.current;
    if (runs.length === 0) {
      finishAnimation();
      return;
    }

    beginRun(runs[0], performance.now());
    if (!pausedRef.current) {
      rafRef.current = requestAnimationFrame(animateFrame);
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, [animateFrame, beginRun, finishAnimation, isActive, mode, ready]);

  useEffect(() => {
    if (mode !== "mixed" || !isActive) return;
    if (!pausedRef.current && rafRef.current === 0) {
      startRef.current = performance.now() - elapsedRef.current;
      rafRef.current = requestAnimationFrame(animateFrame);
    }
  }, [animateFrame, isActive, mode, isPaused]);

  useEffect(() => {
    if (mode !== "mixed" || !isActive) {
      skipRef.current = skipSignal;
      return;
    }
    if (skipSignal === skipRef.current) return;
    skipRef.current = skipSignal;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    if (overlayRef.current) {
      overlayRef.current.innerHTML = "";
      overlayRef.current.style.display = "none";
    }
    overlayDataRef.current = null;
    revealAll();
    if (contentRef.current) {
      contentRef.current.classList.remove("hl-temporary");
    }
    onDoneRef.current?.();
  }, [isActive, mode, onDone, revealAll, skipSignal]);

  useEffect(() => {
    if (mode !== "mixed" || !isActive) {
      stopRef.current = stopSignal;
      return;
    }
    if (stopSignal === stopRef.current) return;
    stopRef.current = stopSignal;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    if (overlayRef.current) {
      overlayRef.current.innerHTML = "";
      overlayRef.current.style.display = "none";
    }
    overlayDataRef.current = null;
    revealAll();
    if (contentRef.current) {
      contentRef.current.classList.remove("hl-temporary");
    }
  }, [isActive, mode, revealAll, stopSignal]);

  const wrapperClass = cn(className, mode === "mixed" && isActive && "hl-temporary");

  return (
    <div className={wrapperClass} style={style}>
      <div
        ref={overlayHostRef}
        style={{
          display: mode === "mixed" ? "inline-block" : "none",
          maxWidth: "100%",
          position: "relative",
        }}
        aria-hidden={mode !== "mixed"}
      >
        <div ref={contentRef} />
        <div
          ref={overlayRef}
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            display: "none",
          }}
        />
      </div>
      {mode !== "mixed" && (
        <>
          {mode === "math" && (
            <MathRevealBlock
              html={html}
              isActive={isActive}
              speed={speed}
              isPaused={isPaused}
              skipSignal={skipSignal}
              stopSignal={stopSignal}
              onMove={onMove}
              onDone={onDone}
            />
          )}
          {mode === "text" && (
            <AnimatedTextBlock
              html={html}
              isActive={isActive}
              speed={speed}
              isPaused={isPaused}
              skipSignal={skipSignal}
              stopSignal={stopSignal}
              onMove={onMove}
              onDone={onDone}
            />
          )}
        </>
      )}
    </div>
  );
}
