"use client";

import { useCallback, useEffect, useRef } from "react";

import { getBoardSize } from "@core/config/boardSpec";
import { useUIStore } from "@features/store/useUIStore";

export type BoardTransform = {
  scale: number;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
};

const defaultTransform: BoardTransform = {
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  width: 1,
  height: 1,
};

export function useBoardTransform() {
  const ratio = useUIStore((state) => state.overviewViewportRatio);
  const transformRef = useRef<BoardTransform>(defaultTransform);

  const updateTransform = useCallback(() => {
    const board = document.querySelector<HTMLElement>("[data-board-root]");
    if (!board) return;
    const rect = board.getBoundingClientRect();
    const { width, height } = getBoardSize(ratio);
    if (rect.width === 0 || rect.height === 0) return;
    const scale = rect.width / width;
    transformRef.current = {
      scale,
      offsetX: rect.left,
      offsetY: rect.top,
      width,
      height,
    };
  }, [ratio]);

  useEffect(() => {
    updateTransform();
    const handle = () => updateTransform();
    const observer = new ResizeObserver(updateTransform);
    const board = document.querySelector<HTMLElement>("[data-board-root]");
    if (board) observer.observe(board);

    window.addEventListener("resize", handle);
    window.addEventListener("scroll", handle, true);

    return () => {
      window.removeEventListener("resize", handle);
      window.removeEventListener("scroll", handle, true);
      observer.disconnect();
    };
  }, [updateTransform]);

  const toBoardPoint = useCallback(
    (clientX: number, clientY: number) => {
      updateTransform();
      const { scale, offsetX, offsetY } = transformRef.current;
      if (!Number.isFinite(scale) || scale === 0) {
        return { x: clientX, y: clientY };
      }
      return {
        x: (clientX - offsetX) / scale,
        y: (clientY - offsetY) / scale,
      };
    },
    [updateTransform]
  );

  const getTransform = useCallback(() => transformRef.current, []);

  return { toBoardPoint, getTransform, updateTransform };
}
