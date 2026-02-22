"use client";

import { useCallback, useEffect, useState, type RefCallback } from "react";

import type { WindowRuntimeRect } from "@features/chrome/layout/windowing/windowRuntime.types";

const WINDOW_HOST_CLAMP_INSET_PX = 16;

const createDefaultWindowHostClampBounds = (): WindowRuntimeRect => ({
  x: WINDOW_HOST_CLAMP_INSET_PX,
  y: WINDOW_HOST_CLAMP_INSET_PX,
  width: 960,
  height: 640,
});

type UseWindowHostClampBoundsOptions = {
  enabled: boolean;
};

export const useWindowHostClampBounds = ({
  enabled,
}: UseWindowHostClampBoundsOptions): {
  windowHostClampBounds: WindowRuntimeRect;
  windowHostViewportRef: RefCallback<HTMLDivElement>;
} => {
  const [windowHostClampBounds, setWindowHostClampBounds] =
    useState<WindowRuntimeRect>(createDefaultWindowHostClampBounds);
  const [viewportNode, setViewportNode] = useState<HTMLDivElement | null>(null);

  const windowHostViewportRef = useCallback<RefCallback<HTMLDivElement>>((node) => {
    setViewportNode(node);
  }, []);

  useEffect(() => {
    if (!enabled || !viewportNode) return;

    const updateClampBounds = () => {
      const rect = viewportNode.getBoundingClientRect();
      const nextWidth = Math.max(
        320,
        Math.round(rect.width) - WINDOW_HOST_CLAMP_INSET_PX * 2
      );
      const nextHeight = Math.max(
        240,
        Math.round(rect.height) - WINDOW_HOST_CLAMP_INSET_PX * 2
      );

      setWindowHostClampBounds((previous) => {
        if (
          previous.x === WINDOW_HOST_CLAMP_INSET_PX &&
          previous.y === WINDOW_HOST_CLAMP_INSET_PX &&
          previous.width === nextWidth &&
          previous.height === nextHeight
        ) {
          return previous;
        }

        return {
          x: WINDOW_HOST_CLAMP_INSET_PX,
          y: WINDOW_HOST_CLAMP_INSET_PX,
          width: nextWidth,
          height: nextHeight,
        };
      });
    };

    updateClampBounds();

    if (typeof ResizeObserver === "function") {
      const observer = new ResizeObserver(() => {
        updateClampBounds();
      });
      observer.observe(viewportNode);
      return () => observer.disconnect();
    }

    if (typeof window === "undefined") return;
    window.addEventListener("resize", updateClampBounds);
    return () => window.removeEventListener("resize", updateClampBounds);
  }, [enabled, viewportNode]);

  return {
    windowHostClampBounds,
    windowHostViewportRef,
  };
};
