"use client";

import { useCallback } from "react";

export type AlignmentGuide = {
  type: "vertical" | "horizontal";
  pos: number;
  kind: "center" | "edge";
};

export type SnapBounds = {
  x: number;
  y: number;
  w: number;
  h: number;
};

type SnapResult = {
  x: number;
  y: number;
  guides: AlignmentGuide[];
};

const DEFAULT_THRESHOLD = 6;

export function useSnap() {
  return useCallback(
    (
      bounds: SnapBounds,
      others: SnapBounds[],
      boardSize: { width: number; height: number },
      threshold = DEFAULT_THRESHOLD
    ): SnapResult => {
      let nextX = bounds.x;
      let nextY = bounds.y;
      let guideX: AlignmentGuide | null = null;
      let guideY: AlignmentGuide | null = null;
      let bestXDist = threshold + 1;
      let bestYDist = threshold + 1;

      const trySnapX = (candidateX: number, guidePos: number, kind: "center" | "edge") => {
        const dist = Math.abs(bounds.x - candidateX);
        if (dist <= threshold && dist < bestXDist) {
          bestXDist = dist;
          nextX = candidateX;
          guideX = { type: "vertical", pos: guidePos, kind };
        }
      };

      const trySnapY = (candidateY: number, guidePos: number, kind: "center" | "edge") => {
        const dist = Math.abs(bounds.y - candidateY);
        if (dist <= threshold && dist < bestYDist) {
          bestYDist = dist;
          nextY = candidateY;
          guideY = { type: "horizontal", pos: guidePos, kind };
        }
      };

      const centerX = boardSize.width / 2;
      const centerY = boardSize.height / 2;
      trySnapX(centerX - bounds.w / 2, centerX, "center");
      trySnapY(centerY - bounds.h / 2, centerY, "center");

      others.forEach((other) => {
        const otherLeft = other.x;
        const otherRight = other.x + other.w;
        const otherTop = other.y;
        const otherBottom = other.y + other.h;
        const otherCenterX = other.x + other.w / 2;
        const otherCenterY = other.y + other.h / 2;

        trySnapX(otherLeft, otherLeft, "edge");
        trySnapX(otherRight - bounds.w, otherRight, "edge");
        trySnapX(otherCenterX - bounds.w / 2, otherCenterX, "edge");

        trySnapY(otherTop, otherTop, "edge");
        trySnapY(otherBottom - bounds.h, otherBottom, "edge");
        trySnapY(otherCenterY - bounds.h / 2, otherCenterY, "edge");
      });

      const guides = [guideX, guideY].filter(
        (guide): guide is AlignmentGuide => Boolean(guide)
      );

      return { x: nextX, y: nextY, guides };
    },
    []
  );
}
