"use client";

import { useMemo } from "react";

import { getBoardSize } from "@core/foundation/policies/boardSpec";
import { useUIStore } from "@features/platform/store/useUIStoreBridge";

export function CanvasGuides() {
  const { guides, overviewViewportRatio, viewMode } = useUIStore();
  const boardSize = useMemo(
    () => getBoardSize(overviewViewportRatio),
    [overviewViewportRatio]
  );

  if (viewMode === "presentation" || !guides.length) return null;

  return (
    <svg
      className="pointer-events-none absolute inset-0"
      width="100%"
      height="100%"
      style={{ zIndex: "var(--z-guide)" }}
      viewBox={`0 0 ${boardSize.width} ${boardSize.height}`}
    >
      {guides.map((guide, index) => {
        const isCenter = guide.kind === "center";
        const stroke = isCenter ? "#f87171" : "#38bdf8";
        const strokeDasharray = isCenter ? undefined : "6 6";
        if (guide.type === "vertical") {
          return (
            <line
              key={`${guide.type}-${guide.pos}-${index}`}
              x1={guide.pos}
              x2={guide.pos}
              y1={0}
              y2={boardSize.height}
              stroke={stroke}
              strokeWidth={1}
              strokeDasharray={strokeDasharray}
            />
          );
        }
        return (
          <line
            key={`${guide.type}-${guide.pos}-${index}`}
            x1={0}
            x2={boardSize.width}
            y1={guide.pos}
            y2={guide.pos}
            stroke={stroke}
            strokeWidth={1}
            strokeDasharray={strokeDasharray}
          />
        );
      })}
    </svg>
  );
}
