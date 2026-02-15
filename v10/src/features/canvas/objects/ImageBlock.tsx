"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

import { cn } from "@core/utils";
import { getBoardSize } from "@core/config/boardSpec";
import { useCanvasStore } from "@features/store/useCanvasStore";
import { useUIStore } from "@features/store/useUIStoreBridge";
import type { ImageItem } from "@core/types/canvas";
import { ArrowDown, ArrowUp, SunMoon, Trash2 } from "lucide-react";
import { useBoardTransform } from "@features/hooks/useBoardTransform";
import { useSnap } from "@features/hooks/useSnap";

type ResizeCorner = "nw" | "ne" | "sw" | "se";

const HANDLE_CLASS =
  "absolute h-3 w-3 rounded-full bg-[var(--theme-accent)] border-2 border-[var(--theme-accent-text)] shadow-[0_0_10px_var(--theme-accent-soft)]";

export function ImageBlock({
  item,
  readOnly = false,
}: {
  item: ImageItem;
  readOnly?: boolean;
}) {
  const {
    selectedItemId,
    selectItem,
    updateItem,
    deleteItem,
    bringToFront,
    sendToBack,
    pages,
    currentPageId,
  } = useCanvasStore();
  const { activeTool, overviewViewportRatio, setGuides, clearGuides } = useUIStore();
  const { toBoardPoint } = useBoardTransform();
  const snap = useSnap();
  const isSelected = !readOnly && selectedItemId === item.id;
  const isDrawing = ["pen", "eraser", "laser"].includes(activeTool);
  const isInteractive = !readOnly && !isDrawing;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const resizeState = useRef<{
    startX: number;
    startY: number;
    startW: number;
    startH: number;
    ratio: number;
    corner: ResizeCorner;
  } | null>(null);
  const dragState = useRef<{
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);
  const itemRef = useRef(item);

  const safeW = Math.max(1, item.w);
  const safeH = Math.max(1, item.h);
  const boardSize = useMemo(
    () => getBoardSize(overviewViewportRatio),
    [overviewViewportRatio]
  );
  const otherRects = useMemo(() => {
    const items = pages[currentPageId] ?? [];
    return items
      .filter((other) => other.type === "image")
      .filter((other) => other.id !== item.id)
      .filter((other) => (other as ImageItem).layoutMode === "absolute")
      .map((other) => {
        const image = other as ImageItem;
        return { x: image.x, y: image.y, w: image.w, h: image.h };
      });
  }, [pages, currentPageId, item.id]);
  const style = useMemo(
    () => ({
      width: `${safeW}px`,
      aspectRatio: `${safeW} / ${safeH}`,
      maxWidth: "100%",
      filter: item.isInverted ? "invert(1)" : "none",
    }),
    [safeW, safeH, item.isInverted]
  );

  useEffect(() => {
    itemRef.current = item;
  }, [item]);

  const startResize =
    (corner: ResizeCorner) => (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isInteractive) return;
    event.preventDefault();
    event.stopPropagation();
    selectItem(item.id);
    const start = toBoardPoint(event.clientX, event.clientY);
    resizeState.current = {
      startX: start.x,
      startY: start.y,
      startW: safeW,
      startH: safeH,
      ratio: safeW / safeH || 1,
      corner,
    };

    const handleMove = (moveEvent: PointerEvent) => {
      const state = resizeState.current;
      if (!state) return;
      const current = toBoardPoint(moveEvent.clientX, moveEvent.clientY);
      const dx = current.x - state.startX;
      const dy = current.y - state.startY;
      const signX = state.corner.includes("w") ? -1 : 1;
      const signY = state.corner.includes("n") ? -1 : 1;
      const deltaW = signX * dx;
      const deltaH = signY * dy;
      const scaleX = (state.startW + deltaW) / state.startW;
      const scaleY = (state.startH + deltaH) / state.startH;
      const scale = Math.max(scaleX, scaleY, 0.05);
      const nextW = Math.max(80, state.startW * scale);
      const nextH = Math.max(60, nextW / state.ratio);
      updateItem(item.id, { w: nextW, h: nextH });
    };

    const handleUp = () => {
      resizeState.current = null;
      window.removeEventListener("pointermove", handleMove as EventListener);
      window.removeEventListener("pointerup", handleUp);
    };

    window.addEventListener("pointermove", handleMove as EventListener, { passive: true });
    window.addEventListener("pointerup", handleUp, { passive: true });
  };

  const resolveOrigin = useCallback(() => {
    const current = itemRef.current;
    if (current.layoutMode === "absolute") {
      return { x: current.x, y: current.y };
    }
    const el = rootRef.current;
    if (!el) {
      return { x: current.x, y: current.y };
    }
    const rect = el.getBoundingClientRect();
    const topLeft = toBoardPoint(rect.left, rect.top);
    return { x: topLeft.x, y: topLeft.y };
  }, [toBoardPoint]);

  const handleDragStart = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!isInteractive) return;
      if (event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();
      selectItem(item.id);

      const start = toBoardPoint(event.clientX, event.clientY);
      const origin = resolveOrigin();
      dragState.current = {
        startX: start.x,
        startY: start.y,
        originX: origin.x,
        originY: origin.y,
        moved: false,
      };

      const handleMove = (moveEvent: PointerEvent) => {
        const state = dragState.current;
        if (!state) return;
        const current = toBoardPoint(moveEvent.clientX, moveEvent.clientY);
        const dx = current.x - state.startX;
        const dy = current.y - state.startY;

        if (!state.moved && Math.hypot(dx, dy) < 2) {
          return;
        }

        if (!state.moved && itemRef.current.layoutMode !== "absolute") {
          updateItem(item.id, {
            layoutMode: "absolute",
            x: state.originX,
            y: state.originY,
          });
          state.moved = true;
        }

        const rawX = state.originX + dx;
        const rawY = state.originY + dy;
        const snapped = snap(
          { x: rawX, y: rawY, w: safeW, h: safeH },
          otherRects,
          boardSize
        );
        updateItem(item.id, { x: snapped.x, y: snapped.y, layoutMode: "absolute" });
        setGuides(snapped.guides);
      };

      const handleUp = () => {
        dragState.current = null;
        clearGuides();
        window.removeEventListener("pointermove", handleMove as EventListener);
        window.removeEventListener("pointerup", handleUp);
      };

      window.addEventListener("pointermove", handleMove as EventListener, { passive: true });
      window.addEventListener("pointerup", handleUp, { passive: true });
    },
    [
      boardSize,
      clearGuides,
      isInteractive,
      item.id,
      otherRects,
      resolveOrigin,
      safeH,
      safeW,
      selectItem,
      setGuides,
      snap,
      toBoardPoint,
      updateItem,
    ]
  );

  const handleDelete = () => {
    if (item.src.startsWith("blob:")) {
      URL.revokeObjectURL(item.src);
    }
    deleteItem(item.id);
  };

  useEffect(() => {
    if (!isSelected || !isInteractive) return;

    const handleKey = (event: KeyboardEvent) => {
      if (
        event.key !== "ArrowUp" &&
        event.key !== "ArrowDown" &&
        event.key !== "ArrowLeft" &&
        event.key !== "ArrowRight"
      ) {
        return;
      }
      const active = document.activeElement as HTMLElement | null;
      if (
        active?.isContentEditable ||
        active?.tagName === "INPUT" ||
        active?.tagName === "TEXTAREA"
      ) {
        return;
      }
      event.preventDefault();

      const delta = event.shiftKey ? 10 : 1;
      let dx = 0;
      let dy = 0;
      if (event.key === "ArrowLeft") dx = -delta;
      if (event.key === "ArrowRight") dx = delta;
      if (event.key === "ArrowUp") dy = -delta;
      if (event.key === "ArrowDown") dy = delta;

      const current = itemRef.current;
      let originX = current.x;
      let originY = current.y;
      if (current.layoutMode !== "absolute") {
        const origin = resolveOrigin();
        originX = origin.x;
        originY = origin.y;
        updateItem(current.id, {
          layoutMode: "absolute",
          x: originX,
          y: originY,
        });
      }
      updateItem(current.id, {
        x: originX + dx,
        y: originY + dy,
        layoutMode: "absolute",
      });
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isInteractive, isSelected, resolveOrigin, updateItem]);

  return (
    <div
      data-image-block
      className={cn(
        "relative inline-block select-none",
        isInteractive ? "pointer-events-auto" : "pointer-events-none"
      )}
      ref={rootRef}
      onPointerDown={handleDragStart}
      style={{ width: style.width, aspectRatio: style.aspectRatio, maxWidth: "100%" }}
    >
      {isSelected && (
        <div className="absolute -top-12 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[var(--theme-border)] bg-[var(--theme-surface-overlay)] px-3 py-1 text-xs text-[var(--theme-text-muted)] shadow-lg backdrop-blur">
          <button
            className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10"
            onClick={(event) => {
              event.stopPropagation();
              updateItem(item.id, { isInverted: !item.isInverted });
            }}
            title="Invert"
          >
            <SunMoon className="h-4 w-4" />
          </button>
          <button
            className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10"
            onClick={(event) => {
              event.stopPropagation();
              bringToFront(item.id);
            }}
            title="Layer Up"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
          <button
            className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10"
            onClick={(event) => {
              event.stopPropagation();
              sendToBack(item.id);
            }}
            title="Layer Down"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
          <div className="h-4 w-px bg-white/20" />
          <button
            className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--theme-danger)] hover:bg-[var(--theme-danger-soft)]"
            onClick={(event) => {
              event.stopPropagation();
              handleDelete();
            }}
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Canvas object renderer needs raw img element to preserve pointer behavior. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.src}
        alt="Inserted"
        draggable={false}
        className={cn(
          "block h-full w-full rounded-sm object-contain",
          isSelected && "outline outline-2 outline-cyan-300/80"
        )}
        style={style}
      />

      {isSelected && (
        <>
          <div className={cn(HANDLE_CLASS, "-left-2 -top-2")} onPointerDown={startResize("nw")} />
          <div className={cn(HANDLE_CLASS, "-right-2 -top-2")} onPointerDown={startResize("ne")} />
          <div className={cn(HANDLE_CLASS, "-left-2 -bottom-2")} onPointerDown={startResize("sw")} />
          <div className={cn(HANDLE_CLASS, "-right-2 -bottom-2")} onPointerDown={startResize("se")} />
        </>
      )}
    </div>
  );
}
