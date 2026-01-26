"use client";

import { useEffect, useRef } from "react";
import type { DragEvent, ReactNode } from "react";

import { CanvasLayer } from "@features/canvas/CanvasLayer";
import { ContentLayer } from "@features/canvas/ContentLayer";
import { PageViewport } from "@features/canvas/PageViewport";
import { OverviewStage } from "@features/layout/OverviewStage";
import { PageGuides } from "@features/canvas/PageGuides";
import { CanvasGuides } from "@features/canvas/CanvasGuides";
import { ActorLayer } from "@features/canvas/actors/ActorLayer";
import { AnchorIndicator } from "@features/canvas/AnchorIndicator";
import { useCanvasStore } from "@features/store/useCanvasStore";
import { useUIStore } from "@features/store/useUIStore";
import { useImageInsert } from "@features/hooks/useImageInsert";
import { useSequence } from "@features/hooks/useSequence";

export function CanvasStage({ children }: { children?: ReactNode }) {
  const { isOverviewMode, overviewViewportRatio } = useUIStore();

  if (isOverviewMode) {
    return <OverviewStage />;
  }

  return (
    <NormalCanvasStage ratio={overviewViewportRatio}>
      {children}
    </NormalCanvasStage>
  );
}

function NormalCanvasStage({
  children,
  ratio,
}: {
  children?: ReactNode;
  ratio: "16:9" | "4:3";
}) {
  const dropRef = useRef<HTMLDivElement | null>(null);
  const { selectItem, pageColumnCounts, currentPageId } = useCanvasStore();
  const {
    isPasteHelperOpen,
    isOverviewMode,
    viewMode,
  } = useUIStore();
  const { insertImageFile } = useImageInsert();
  const columnCount = pageColumnCounts?.[currentPageId] ?? 2;
  const animationState = useSequence({
    enabled: !isOverviewMode,
  });

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "copy";
    }
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (!file) return;
    await insertImageFile(file);
  };

  const handleBackgroundPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement | null;
    if (!target) return;
    if (target.closest("[data-image-block]")) return;
    if (target.closest("[data-text-item]") || target.closest("[data-text-editor]")) {
      return;
    }
    selectItem(null);
  };

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      if (isPasteHelperOpen) return;
      const active = document.activeElement as HTMLElement | null;
      if (active?.isContentEditable || active?.tagName === "INPUT" || active?.tagName === "TEXTAREA") {
        return;
      }
      const items = event.clipboardData?.items;
      if (!items) return;
      let handled = false;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            insertImageFile(file);
            handled = true;
          }
        }
      }
      if (handled) event.preventDefault();
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [insertImageFile, isPasteHelperOpen]);

  const paddingTop =
    viewMode === "presentation"
      ? "calc(24px + env(safe-area-inset-top))"
      : 24;
  const paddingBottom =
    viewMode === "presentation"
      ? "calc(24px + env(safe-area-inset-bottom))"
      : 24;

  return (
    <div
      ref={dropRef}
      data-canvas-stage
      className="relative flex h-full w-full min-h-0 flex-1 overflow-hidden"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onPointerDown={handleBackgroundPointer}
    >
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_top,_rgba(0,255,255,0.08),_transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_bottom,_rgba(255,16,240,0.08),_transparent_40%)]" />
      <PageViewport
        ratio={ratio}
        className="overflow-hidden"
        paddingTop={paddingTop}
        paddingBottom={paddingBottom}
      >
        <PageGuides columnCount={columnCount} />
        <ContentLayer
          animationState={animationState}
          readOnly={viewMode === "presentation"}
        />
        <CanvasGuides />
        <AnchorIndicator isAnimating={animationState.isAnimating} />
        <ActorLayer actor={animationState.actor} />
        <CanvasLayer />
        {children && (
          <div className="relative z-30 w-full text-center text-white/70">
            {children}
          </div>
        )}
      </PageViewport>
    </div>
  );
}
