"use client";

import { useEffect, useMemo, useState } from "react";

import { getBoardPadding, getBoardSize } from "@core/foundation/policies/boardSpec";
import { cn } from "@core/utils";
import { useUIStore } from "@features/store/useUIStoreBridge";
import { usePageScale } from "@features/canvas/PageViewport";

type PageGuidesProps = {
  columnCount: number;
  showBreakGuides?: boolean;
  showCanvasBorder?: boolean;
  className?: string;
};

const COLUMN_GAP = 48;
const BORDER_RADIUS = 28;

const snapToPixel = (value: number) => Math.round(value - 0.5) + 0.5;

const useRafFrame = (panX: number, panY: number, zoom: number) => {
  const [frame, setFrame] = useState({ panX, panY, zoom });

  useEffect(() => {
    let rafId = 0;
    rafId = window.requestAnimationFrame(() => {
      setFrame((prev) => {
        if (prev.panX === panX && prev.panY === panY && prev.zoom === zoom) {
          return prev;
        }
        return { panX, panY, zoom };
      });
    });
    return () => window.cancelAnimationFrame(rafId);
  }, [panX, panY, zoom]);

  return frame;
};

export function PageGuides({
  columnCount,
  showBreakGuides = true,
  showCanvasBorder = true,
  className,
}: PageGuidesProps) {
  const safeColumns = Math.max(1, Math.min(4, columnCount));
  const ratio = useUIStore((state) => state.overviewViewportRatio);
  const viewport = useUIStore((state) => state.viewport);
  const { panX, panY, zoom } = useRafFrame(
    viewport.panOffset.x,
    viewport.panOffset.y,
    viewport.zoomLevel
  );
  const fitScale = usePageScale();
  const boardSize = useMemo(() => getBoardSize(ratio), [ratio]);

  const guides = useMemo(() => {
    const padding = getBoardPadding();
    const innerWidth = boardSize.width - padding * 2;
    const totalGap = COLUMN_GAP * (safeColumns - 1);
    const columnWidth = Math.max(1, (innerWidth - totalGap) / safeColumns);
    const renderScale = fitScale * zoom;
    const strokeWidth = 1;
    const boardWidthPx = boardSize.width * renderScale;
    const boardHeightPx = boardSize.height * renderScale;
    const baseWidth = boardSize.width * fitScale;
    const baseHeight = boardSize.height * fitScale;

    const columnLines = Array.from(
      { length: Math.max(0, safeColumns - 1) },
      (_, index) => {
        const rawX = padding + columnWidth * (index + 1) + COLUMN_GAP * index;
        return snapToPixel(panX + rawX * renderScale);
      }
    );

    const lineTop = snapToPixel(panY + padding * renderScale);
    const lineBottom = snapToPixel(
      panY + (boardSize.height - padding) * renderScale
    );

    const borderLeft = snapToPixel(panX);
    const borderTop = snapToPixel(panY);
    const borderRight = snapToPixel(panX + boardWidthPx);
    const borderBottom = snapToPixel(panY + boardHeightPx);
    const minX = Math.min(0, panX);
    const minY = Math.min(0, panY);
    const maxX = Math.max(baseWidth, panX + boardWidthPx);
    const maxY = Math.max(baseHeight, panY + boardHeightPx);

    return {
      columnLines,
      lineTop,
      lineBottom,
      strokeWidth,
      borderRect: {
        x: borderLeft,
        y: borderTop,
        width: borderRight - borderLeft,
        height: borderBottom - borderTop,
        radius: BORDER_RADIUS * renderScale,
      },
      viewportRect: {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
      },
    };
  }, [
    boardSize.height,
    boardSize.width,
    fitScale,
    panX,
    panY,
    safeColumns,
    zoom,
  ]);

  return (
    <svg
      className={cn("pointer-events-none absolute z-0", className)}
      aria-hidden
      width={guides.viewportRect.width}
      height={guides.viewportRect.height}
      viewBox={`${guides.viewportRect.x} ${guides.viewportRect.y} ${guides.viewportRect.width} ${guides.viewportRect.height}`}
      style={{
        left: guides.viewportRect.x,
        top: guides.viewportRect.y,
        overflow: "visible",
      }}
      overflow="visible"
    >
      {showCanvasBorder && (
        <>
          <rect
            x={guides.borderRect.x}
            y={guides.borderRect.y}
            width={guides.borderRect.width}
            height={guides.borderRect.height}
            rx={guides.borderRect.radius}
            ry={guides.borderRect.radius}
            fill="rgba(0,0,0,0.1)"
          />
          <rect
            x={guides.borderRect.x}
            y={guides.borderRect.y}
            width={guides.borderRect.width}
            height={guides.borderRect.height}
            rx={guides.borderRect.radius}
            ry={guides.borderRect.radius}
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth={guides.strokeWidth}
            shapeRendering="crispEdges"
          />
        </>
      )}
      {showBreakGuides &&
        guides.columnLines.map((x, index) => (
          <line
            key={`col-${index}`}
            x1={x}
            x2={x}
            y1={guides.lineTop}
            y2={guides.lineBottom}
            stroke="rgba(255,255,255,0.2)"
            strokeWidth={guides.strokeWidth}
            shapeRendering="crispEdges"
            strokeLinecap="square"
          />
        ))}
    </svg>
  );
}
