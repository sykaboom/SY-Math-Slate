"use client";

import { useMemo, useRef } from "react";

import { ContentLayer } from "@features/canvas/ContentLayer";
import { OverviewInkLayer } from "@features/canvas/OverviewInkLayer";
import { StaticStrokeLayer } from "@features/canvas/StaticStrokeLayer";
import { useCanvasStore } from "@features/store/useCanvasStore";
import { useUIStore } from "@features/store/useUIStoreBridge";
import { cn } from "@core/utils";
import { getBoardSize } from "@core/config/boardSpec";

export function OverviewStage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { pages, pageOrder } = useCanvasStore();
  const { overviewZoom, overviewViewportRatio } = useUIStore();
  const boardSize = getBoardSize(overviewViewportRatio);

  const gridStyle = useMemo(() => {
    return {
      gridAutoFlow: "column" as const,
      gridTemplateRows: `repeat(2, ${boardSize.height}px)`,
      gridAutoColumns: `${boardSize.width}px`,
      rowGap: "48px",
      columnGap: "48px",
    };
  }, [boardSize.height, boardSize.width]);

  const pageStyle = useMemo(() => {
    return { width: boardSize.width, height: boardSize.height };
  }, [boardSize.height, boardSize.width]);

  return (
    <div
      ref={containerRef}
      className="relative flex flex-1 overflow-auto bg-black"
      data-overview-stage
    >
      <div
        className="relative origin-top-left z-10"
        style={{ transform: `scale(${overviewZoom})` }}
      >
        <div className="relative">
          <div className={cn("grid", "relative z-10")} style={gridStyle}>
            {pageOrder.map((pageId) => {
              const items = pages[pageId] ?? [];
              const hasContent = items.length > 0;
              return (
                <div
                  key={pageId}
                  className="relative overflow-hidden"
                  style={pageStyle}
                >
                  {hasContent && <ContentLayer pageId={pageId} readOnly />}
                  <StaticStrokeLayer
                    pageId={pageId}
                    className="pointer-events-none absolute inset-0 z-20"
                  />
                </div>
              );
            })}
          </div>
          <OverviewInkLayer />
        </div>
      </div>
    </div>
  );
}
