"use client";

import { useCallback, useEffect, useRef } from "react";

import { getBoardSize } from "@core/foundation/policies/boardSpec";
import { useUIStore } from "@features/platform/store/useUIStoreBridge";

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
  const viewport = useUIStore((state) => state.viewport);
  const transformRef = useRef<BoardTransform>(defaultTransform);
  const rafRef = useRef<number | null>(null);
  const boardRef = useRef<HTMLElement | null>(null);

  const resolveBoard = useCallback(() => {
    if (boardRef.current && document.contains(boardRef.current)) {
      return boardRef.current;
    }
    const board = document.querySelector<HTMLElement>("[data-board-root]");
    boardRef.current = board;
    return board;
  }, []);

  const updateTransform = useCallback(() => {
    const board = resolveBoard();
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
  }, [ratio, resolveBoard]);

  const scheduleUpdate = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      updateTransform();
    });
  }, [updateTransform]);

  useEffect(() => {
    scheduleUpdate();
    const handle = () => scheduleUpdate();
    const observer = new ResizeObserver(handle);
    const board = resolveBoard();
    if (board) observer.observe(board);

    window.addEventListener("resize", handle);
    window.addEventListener("scroll", handle, true);

    return () => {
      window.removeEventListener("resize", handle);
      window.removeEventListener("scroll", handle, true);
      observer.disconnect();
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [resolveBoard, scheduleUpdate]);

  useEffect(() => {
    scheduleUpdate();
  }, [scheduleUpdate, viewport.panOffset.x, viewport.panOffset.y, viewport.zoomLevel]);

  const toBoardPoint = useCallback(
    (clientX: number, clientY: number) => {
      let { scale, offsetX, offsetY } = transformRef.current;
      if (!Number.isFinite(scale) || scale === 0) {
        updateTransform();
        ({ scale, offsetX, offsetY } = transformRef.current);
      }
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
