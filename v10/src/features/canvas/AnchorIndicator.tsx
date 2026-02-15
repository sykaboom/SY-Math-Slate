"use client";

import { useLayoutEffect, useMemo, useState } from "react";

import { cn } from "@core/utils";
import { useCanvasStore } from "@features/store/useCanvasStore";
import { useUIStore } from "@features/store/useUIStoreBridge";
import { getBoardPadding } from "@core/config/boardSpec";
import { useBoardTransform } from "@features/hooks/useBoardTransform";
import { chalkTheme } from "@core/themes/chalkTheme";

type AnchorIndicatorProps = {
  isAnimating: boolean;
};

const TIP_OFFSET = chalkTheme.tipOffset;
const FALLBACK_BASELINE_OFFSET = chalkTheme.baselineOffset.fallback;
const ANCHOR_BASELINE_OFFSET = chalkTheme.baselineOffset.anchor;
const FLOW_BASELINE_OFFSET = chalkTheme.baselineOffset.flow;

type FlowAnchor = { x: number; y: number; step: number };

const buildSegmentTypeMap = (blocks: Array<{ segments: Array<{ id: string; type: string }> }>) => {
  const map = new Map<string, string>();
  blocks.forEach((block) => {
    block.segments.forEach((segment) => {
      map.set(segment.id, segment.type);
    });
  });
  return map;
};

const getMaxTextStep = (items: Array<{ type: string; stepIndex?: number }>) =>
  items.reduce((max, item) => {
    if (item.type !== "text") return max;
    const stepIndex = typeof item.stepIndex === "number" ? item.stepIndex : 0;
    return Math.max(max, stepIndex);
  }, -1);

export function AnchorIndicator({ isAnimating }: AnchorIndicatorProps) {
  const {
    anchorMap,
    currentPageId,
    currentStep,
    pages,
    stepBlocks,
  } = useCanvasStore();
  const { isOverviewMode } = useUIStore();
  const { toBoardPoint } = useBoardTransform();

  const segmentTypeById = useMemo(
    () => buildSegmentTypeMap(stepBlocks),
    [stepBlocks]
  );

  const fallbackAnchor = useMemo(() => {
    const padding = getBoardPadding();
    return {
      x: padding,
      y: padding + FALLBACK_BASELINE_OFFSET,
    };
  }, []);

  const anchor = useMemo(() => {
    const positions = anchorMap?.[currentPageId]?.[currentStep];
    if (!positions || positions.length === 0) return null;
    const sorted = [...positions].sort((a, b) => a.orderIndex - b.orderIndex);
    return sorted[0];
  }, [anchorMap, currentPageId, currentStep]);

  const [flowAnchor, setFlowAnchor] = useState<FlowAnchor | null>(null);

  useLayoutEffect(() => {
    const raf = window.requestAnimationFrame(() => {
      const cursorEl = document.querySelector<HTMLElement>(
        `[data-flow-cursor][data-flow-step="${currentStep}"]`
      );
      if (!cursorEl) return;
      const rect = cursorEl.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return;
      const point = toBoardPoint(
        rect.left + rect.width / 2,
        rect.bottom - FLOW_BASELINE_OFFSET
      );
      setFlowAnchor({ ...point, step: currentStep });
    });
    return () => window.cancelAnimationFrame(raf);
  }, [currentPageId, currentStep, toBoardPoint]);

  const maxStep = useMemo(() => {
    if (stepBlocks.length > 0) return stepBlocks.length - 1;
    const items = pages[currentPageId] ?? [];
    return getMaxTextStep(items);
  }, [pages, currentPageId, stepBlocks]);

  const isHidden = isAnimating;
  const hasValidFlowAnchor = flowAnchor?.step === currentStep;
  const currentBlock = stepBlocks[currentStep];
  const isBreakAnchor = Boolean(currentBlock?.kind && currentBlock.kind !== "content");
  const holder = chalkTheme.holder;
  const bodyTop = chalkTheme.tipOffset.y - holder.body.thickness / 2;
  const totalLength = holder.tip.length + holder.body.length;

  if (isOverviewMode) return null;

  if (maxStep >= 0 && currentStep > maxStep) {
    return null;
  }

  const anchorType = anchor ? segmentTypeById.get(anchor.segmentId) : null;
  if (!hasValidFlowAnchor && !anchor && stepBlocks.length > 0) {
    return null;
  }

  const resolvedAnchor =
    (hasValidFlowAnchor ? flowAnchor : null) ??
    (anchor
      ? {
          x: anchor.x,
          y: anchorType === "text" ? anchor.y + ANCHOR_BASELINE_OFFSET : anchor.y,
        }
      : fallbackAnchor);

  return (
    <div
      className={cn(
        "pointer-events-none absolute transition-opacity duration-200",
        isHidden ? "opacity-0" : "opacity-100"
      )}
      style={{
        transform: `translate(${resolvedAnchor.x - TIP_OFFSET.x}px, ${
          resolvedAnchor.y - TIP_OFFSET.y
        }px)`,
        zIndex: "var(--z-indicator)",
      }}
    >
      <style>
        {`
          @keyframes chalkWobble {
            0% { transform: translate(0, 0); }
            50% { transform: translate(2px, -2px); }
            100% { transform: translate(0, 0); }
          }
          /* .chalk-anchor-wobble {
            animation: chalkWobble var(--chalk-wobble-duration) ease-in-out infinite;
          } */
        `}
      </style>
      <div className="chalk-anchor-wobble relative flex items-center">
        <div
          className="relative"
          style={{
            width: holder.frame.size,
            height: holder.frame.size,
            opacity: isBreakAnchor ? 0.8 : 1,
          }}
        >
          <div
            className="absolute"
            style={{
              left: chalkTheme.tipOffset.x,
              top: bodyTop,
              width: totalLength,
              height: holder.body.thickness,
              transform: `rotate(${holder.angleDeg}deg)`,
              transformOrigin: "0 50%",
            }}
          >
            <div
              className="absolute"
              style={{
                left: 0,
                top: (holder.body.thickness - holder.tip.thickness) / 2,
                width: holder.tip.length,
                height: holder.tip.thickness,
                borderRadius: holder.tip.radius,
                background: chalkTheme.colors.tipGradient,
                boxShadow: chalkTheme.colors.tipGlow,
                border: `1px solid ${chalkTheme.colors.tipBorder}`,
              }}
            />
            <div
              className="absolute"
              style={{
                left: holder.tip.length,
                top: 0,
                width: holder.body.length,
                height: holder.body.thickness,
                borderRadius: holder.body.radius,
                border: `1px solid ${chalkTheme.colors.holderBorder}`,
                background: chalkTheme.colors.holderBackground,
                boxShadow: isBreakAnchor
                  ? `${chalkTheme.colors.holderShadow}, 0 0 12px var(--neon-pink)`
                  : chalkTheme.colors.holderShadow,
              }}
            >
              <div
                className="absolute"
                style={{
                  left: holder.body.bandOffset,
                  top: 0,
                  width: holder.body.bandWidth,
                  height: holder.body.thickness,
                  borderRadius: holder.body.radius,
                  background: chalkTheme.colors.holderBand,
                }}
              />
              <div
                className="absolute"
                style={{
                  left: holder.body.highlightOffset,
                  top: (holder.body.thickness - holder.body.highlightThickness) / 2,
                  width: holder.body.highlightLength,
                  height: holder.body.highlightThickness,
                  borderRadius: holder.body.highlightThickness,
                  background: chalkTheme.colors.holderHighlight,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
