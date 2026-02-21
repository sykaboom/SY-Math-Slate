"use client";

import { useEffect, useRef } from "react";
import type { DragEvent, ReactNode } from "react";

import { extractImageFilesFromClipboard } from "@features/editor/canvas/paste/pasteNormalization";
import { CanvasLayer } from "@features/editor/canvas/CanvasLayer";
import { ContentLayer } from "@features/editor/canvas/ContentLayer";
import { PageViewport } from "@features/editor/canvas/PageViewport";
import { OverviewStage } from "@features/chrome/layout/OverviewStage";
import { PageGuides } from "@features/editor/canvas/PageGuides";
import { CanvasGuides } from "@features/editor/canvas/CanvasGuides";
import { ActorLayer } from "@features/editor/canvas/actors/ActorLayer";
import { AnchorIndicator } from "@features/editor/canvas/AnchorIndicator";
import { PresenceOverlay } from "@features/editor/canvas/PresenceOverlay";
import { useViewportInteraction } from "@features/editor/canvas/viewport/useViewportInteraction";
import { useCanvasStore } from "@features/platform/store/useCanvasStore";
import { useUIStore } from "@features/platform/store/useUIStoreBridge";
import { useImageInsert } from "@features/platform/hooks/useImageInsert";
import { useSequence } from "@features/platform/hooks/useSequence";

export function CanvasStage({ children }: { children?: ReactNode }) {
  const {
    isOverviewMode,
    overviewViewportRatio,
    showBreakGuides,
    showCanvasBorder,
  } = useUIStore();

  if (isOverviewMode) {
    return <OverviewStage />;
  }

  return (
    <NormalCanvasStage
      ratio={overviewViewportRatio}
      showBreakGuides={showBreakGuides}
      showCanvasBorder={showCanvasBorder}
    >
      {children}
    </NormalCanvasStage>
  );
}

function NormalCanvasStage({
  children,
  ratio,
  showBreakGuides,
  showCanvasBorder,
}: {
  children?: ReactNode;
  ratio: "16:9" | "4:3";
  showBreakGuides: boolean;
  showCanvasBorder: boolean;
}) {
  const dropRef = useRef<HTMLDivElement | null>(null);
  const actorRef = useRef<HTMLDivElement | null>(null);
  const { selectItem, pageColumnCounts, currentPageId } = useCanvasStore();
  const {
    isPasteHelperOpen,
    isOverviewMode,
    viewMode,
    showCursors,
  } = useUIStore();
  const viewportBind = useViewportInteraction(dropRef);
  const { insertImageFile } = useImageInsert();
  const columnCount = pageColumnCounts?.[currentPageId] ?? 2;
  const animationState = useSequence({
    enabled: !isOverviewMode,
    actorRef,
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
      const imageFiles = extractImageFilesFromClipboard(event);
      if (imageFiles.length === 0) return;
      for (const imageFile of imageFiles) {
        insertImageFile(imageFile);
      }
      event.preventDefault();
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
      data-mod-keyboard-boundary="canvas-stage"
      tabIndex={-1}
      className="relative flex h-full w-full min-h-0 flex-1 overflow-hidden"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onPointerDown={handleBackgroundPointer}
      {...viewportBind}
    >
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_top,_rgba(var(--swatch-cyan-rgb,0,255,255),0.04),_transparent_75%)]" />
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_bottom,_rgba(var(--swatch-pink-rgb),0.025),_transparent_75%)]" />
      <PageViewport
        ratio={ratio}
        className="overflow-hidden"
        paddingTop={paddingTop}
        paddingBottom={paddingBottom}
        overlay={
          <PageGuides
            columnCount={columnCount}
            showBreakGuides={showBreakGuides}
            showCanvasBorder={showCanvasBorder}
          />
        }
      >
        <ContentLayer
          animationState={animationState}
          readOnly={viewMode === "presentation"}
        />
        <CanvasGuides />
        {showCursors && (
          <AnchorIndicator isAnimating={animationState.isAnimating} />
        )}
        {showCursors && (
          <ActorLayer actor={animationState.actor} actorRef={actorRef} />
        )}
        <CanvasLayer />
        {showCursors && <PresenceOverlay />}
        {children && (
          <div className="relative z-30 w-full text-center text-theme-text/70">
            {children}
          </div>
        )}
      </PageViewport>
    </div>
  );
}
