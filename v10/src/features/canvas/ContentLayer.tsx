"use client";
import { useMemo } from "react";
import type { CSSProperties } from "react";

import { useCanvasStore } from "@features/store/useCanvasStore";
import { useUIStore } from "@features/store/useUIStore";
import type { CanvasItem, ImageItem, TextItem } from "@core/types/canvas";
import { getBoardPadding } from "@core/config/boardSpec";
import { sanitizeRichTextHtml } from "@core/sanitize/richTextSanitizer";
import { cn } from "@core/utils";
import { MathTextBlock } from "@features/canvas/MathTextBlock";
import { ImageBlock } from "@features/canvas/objects/ImageBlock";
import { RichTextAnimator } from "@features/canvas/animation/RichTextAnimator";
import type { AnimationState } from "@features/hooks/useSequence";
import { PlayCircle } from "lucide-react";

const isTextItem = (item: CanvasItem): item is TextItem => item.type === "text";
const isImageItem = (item: CanvasItem): item is ImageItem => item.type === "image";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const getStepIndex = (item: CanvasItem) => {
  if ("stepIndex" in item && typeof item.stepIndex === "number") {
    return item.stepIndex;
  }
  return 0;
};

const getMaxStep = (items: CanvasItem[]) =>
  items.reduce((max, item) => {
    if (!isTextItem(item) && !isImageItem(item)) return max;
    const mode = item.layoutMode ?? "flow";
    if (mode !== "flow") return max;
    return Math.max(max, getStepIndex(item));
  }, -1);

const getGlobalMaxStep = (pages: Record<string, CanvasItem[]>) =>
  Object.values(pages).reduce((max, items) => Math.max(max, getMaxStep(items)), -1);

const findTextItemByStep = (items: CanvasItem[], step: number) =>
  items.find((item) => isTextItem(item) && getStepIndex(item) === step) as
    | TextItem
    | undefined;

const sanitizeHtml = (value: string) => sanitizeRichTextHtml(value);

type ContentLayerProps = {
  pageId?: string;
  readOnly?: boolean;
  animationState?: AnimationState | null;
};

export function ContentLayer({
  pageId,
  readOnly = false,
  animationState,
}: ContentLayerProps) {
  const { pages, currentPageId, currentStep, pageColumnCounts, animationModInput } =
    useCanvasStore();
  const { isOverviewMode, isDataInputOpen } = useUIStore();
  const resolvedPageId = pageId ?? currentPageId;
  const columnCount = pageColumnCounts?.[resolvedPageId] ?? 2;

  const items = useMemo(
    () => pages[resolvedPageId] ?? [],
    [pages, resolvedPageId]
  );

  const { flowItems, absoluteTextItems, absoluteImageItems } = useMemo(() => {
    const indexed = items.map((item, index) => ({ item, index }));
    const flow = indexed
      .filter(({ item }) => {
        if (isImageItem(item)) {
          return item.layoutMode !== "absolute";
        }
        if (!isTextItem(item)) return false;
        const mode = item.layoutMode ?? "flow";
        return mode === "flow";
      })
      .sort((a, b) => {
        const az = typeof a.item.zIndex === "number" ? a.item.zIndex : a.index;
        const bz = typeof b.item.zIndex === "number" ? b.item.zIndex : b.index;
        if (az !== bz) return az - bz;
        return a.index - b.index;
      })
      .map(({ item }) => item);
    const absoluteText = items.filter(
      (item): item is TextItem =>
        isTextItem(item) && (item.layoutMode ?? "flow") === "absolute"
    );
    const absoluteImages = items
      .filter(
        (item): item is ImageItem =>
          isImageItem(item) && item.layoutMode === "absolute"
      )
      .sort((a, b) => {
        const az = typeof a.zIndex === "number" ? a.zIndex : 0;
        const bz = typeof b.zIndex === "number" ? b.zIndex : 0;
        return az - bz;
      });
    return {
      flowItems: flow,
      absoluteTextItems: absoluteText,
      absoluteImageItems: absoluteImages,
    };
  }, [items]);

  const shouldShowText = (item: TextItem) => getStepIndex(item) < currentStep;
  const shouldShowMedia = (stepIndex?: number) => {
    const resolved = typeof stepIndex === "number" ? stepIndex : 0;
    if (resolved < currentStep) return true;
    return resolved === currentStep && isAnimating;
  };
  const activeItemId = animationState?.activeItemId ?? null;
  const isAnimating = Boolean(animationState?.isAnimating);
  const canEdit = !readOnly && !isOverviewMode;

  const visibleFlowItems = useMemo(() => {
    return flowItems.filter((item) => {
      const stepIndex = getStepIndex(item);
      if (isTextItem(item)) {
        if (stepIndex < currentStep) return true;
        return isAnimating && item.id === activeItemId;
      }
      if (isImageItem(item)) {
        if (stepIndex < currentStep) return true;
        return isAnimating && stepIndex === currentStep;
      }
      return false;
    });
  }, [flowItems, currentStep, isAnimating, activeItemId]);

  const maxStep = useMemo(() => {
    return getGlobalMaxStep(pages);
  }, [pages]);

  const isAfterLastStep = maxStep >= 0 && currentStep > maxStep;

  const cursorProbe = useMemo(() => {
    if (maxStep < 0 || isAfterLastStep) return null;

    const probeStep = currentStep;
    const flowItem = findTextItemByStep(flowItems, probeStep);
    if (flowItem) {
      return { item: flowItem, mode: "flow" as const };
    }

    const absoluteItem = findTextItemByStep(absoluteTextItems, probeStep);
    if (absoluteItem) {
      return { item: absoluteItem, mode: "absolute" as const };
    }

    return null;
  }, [absoluteTextItems, flowItems, currentStep, isAfterLastStep, maxStep]);

  const cursorProbePayload = useMemo(() => {
    if (!cursorProbe) return null;
    const sanitized = sanitizeHtml(cursorProbe.item.content);
    const marker = `<span data-flow-cursor="1" data-flow-step="${currentStep}">&nbsp;</span>`;
    return { html: `${marker}${sanitized}` };
  }, [cursorProbe, currentStep]);

  return (
    <>
      <div
        className={cn(
          "absolute inset-0 z-10 text-layer",
          isDataInputOpen && "editing-breaks",
          readOnly && "pointer-events-none"
        )}
        style={{
          columnCount,
          columnGap: "3rem",
          padding: `${getBoardPadding()}px`,
        }}
      >
        {visibleFlowItems.map((item) => {
          if (isTextItem(item)) {
            const sanitized = sanitizeHtml(item.content);
            const style = isRecord(item.style)
              ? (item.style as CSSProperties)
              : undefined;
            if (isAnimating && item.id === activeItemId && !isOverviewMode) {
              return (
                <RichTextAnimator
                  key={item.id}
                  className={cn(
                    "text-item mb-8 break-inside-avoid pointer-events-none"
                  )}
                  style={style}
                  html={sanitized}
                  isActive
                  speed={animationState?.speed ?? 1}
                  isPaused={animationState?.isPaused ?? false}
                  skipSignal={animationState?.skipSignal ?? 0}
                  stopSignal={animationState?.stopSignal ?? 0}
                  onMove={animationState?.onMove ?? (() => {})}
                  onDone={animationState?.onDone ?? (() => {})}
                  modInput={animationModInput}
                />
              );
            }
            if (!shouldShowText(item)) return null;
            return (
              <div
                key={item.id}
                className={cn("text-item mb-8 break-inside-avoid pointer-events-none")}
                data-text-item
              >
                <MathTextBlock
                  className="pointer-events-none"
                  style={style}
                  html={sanitized}
                />
              </div>
            );
          }
          if (isImageItem(item)) {
            if (!shouldShowMedia(item.stepIndex)) return null;
            if (item.layoutMode === "absolute") {
              return (
                <div
                  key={item.id}
                  className="mb-8 break-inside-avoid"
                  style={{ width: `${item.w}px`, height: `${item.h}px` }}
                />
              );
            }
            if (item.mediaType === "video") {
              return (
                <div
                  key={item.id}
                  className="mb-8 break-inside-avoid rounded-xl border border-white/20 bg-white/5 p-4 text-white/60"
                  style={{ width: `${item.w}px`, height: `${item.h}px` }}
                >
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2">
                    <PlayCircle className="h-6 w-6" />
                    <span className="text-[11px] tracking-widest">VIDEO</span>
                  </div>
                </div>
              );
            }
            return (
              <div key={item.id} className="mb-8 break-inside-avoid">
                <ImageBlock item={item} readOnly={readOnly} />
              </div>
            );
          }
          return null;
        })}
        {!isAnimating && !isOverviewMode && cursorProbe?.mode === "flow" && cursorProbePayload && (
          <div
            className="text-item mb-8 break-inside-avoid pointer-events-none"
            style={{ visibility: "hidden" }}
            data-flow-step={currentStep}
          >
            <MathTextBlock className="pointer-events-none" html={cursorProbePayload.html} />
          </div>
        )}
      </div>
      <div className="pointer-events-none absolute inset-0 z-10">
        {absoluteTextItems.map((item) => {
          if (!shouldShowText(item) && item.id !== activeItemId) return null;
          const sanitized = sanitizeHtml(item.content);
          const style = isRecord(item.style)
            ? (item.style as CSSProperties)
            : undefined;
          if (isAnimating && item.id === activeItemId && !isOverviewMode) {
            return (
              <RichTextAnimator
                key={item.id}
                className="text-item absolute"
                style={{
                  transform: `translate(${item.x}px, ${item.y}px)`,
                  ...style,
                }}
                html={sanitized}
                isActive
                speed={animationState?.speed ?? 1}
                isPaused={animationState?.isPaused ?? false}
                skipSignal={animationState?.skipSignal ?? 0}
                stopSignal={animationState?.stopSignal ?? 0}
                  onMove={animationState?.onMove ?? (() => {})}
                  onDone={animationState?.onDone ?? (() => {})}
                  modInput={animationModInput}
                />
              );
            }
          return (
            <div
              key={item.id}
              className="text-item absolute pointer-events-none"
              style={{
                transform: `translate(${item.x}px, ${item.y}px)`,
                ...style,
              }}
              data-text-item
            >
              <MathTextBlock className="pointer-events-none" html={sanitized} />
            </div>
          );
        })}
        {!isAnimating && !isOverviewMode && cursorProbe?.mode === "absolute" && cursorProbePayload && (
          <div
            className="text-item absolute pointer-events-none"
            style={{
              transform: `translate(${cursorProbe.item.x}px, ${cursorProbe.item.y}px)`,
              visibility: "hidden",
            }}
            data-flow-step={currentStep}
          >
            <MathTextBlock className="pointer-events-none" html={cursorProbePayload.html} />
          </div>
        )}
      </div>
      <div
        className={cn(
          "absolute inset-0",
          !canEdit && "pointer-events-none"
        )}
        style={{ zIndex: "var(--z-content)" }}
      >
        {absoluteImageItems.map((item) => {
          if (!shouldShowMedia(item.stepIndex)) return null;
          if (item.mediaType === "video") {
            return (
              <div
                key={item.id}
                className="absolute rounded-xl border border-white/20 bg-white/5 p-4 text-white/60"
                style={{
                  transform: `translate(${item.x}px, ${item.y}px)`,
                  width: `${item.w}px`,
                  height: `${item.h}px`,
                }}
              >
                <div className="flex h-full w-full flex-col items-center justify-center gap-2">
                  <PlayCircle className="h-6 w-6" />
                  <span className="text-[11px] tracking-widest">VIDEO</span>
                </div>
              </div>
            );
          }
          return (
            <div
              key={item.id}
              className="absolute"
              style={{ transform: `translate(${item.x}px, ${item.y}px)` }}
            >
              <ImageBlock item={item} readOnly={readOnly} />
            </div>
          );
        })}
      </div>
    </>
  );
}
