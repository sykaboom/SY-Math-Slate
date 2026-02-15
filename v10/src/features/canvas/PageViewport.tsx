"use client";

import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";

import { cn } from "@core/utils";
import { getBoardSize, type BoardRatio } from "@core/config/boardSpec";
import { useUIStore } from "@features/store/useUIStoreBridge";

const PageScaleContext = createContext(1);

export const usePageScale = () => useContext(PageScaleContext);

type PageViewportProps = {
  ratio: BoardRatio;
  children: ReactNode;
  overlay?: ReactNode;
  className?: string;
  paddingTop?: number | string;
  paddingBottom?: number | string;
};

export function PageViewport({
  ratio,
  children,
  overlay,
  className,
  paddingTop = 24,
  paddingBottom = 24,
}: PageViewportProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  const boardSize = useMemo(() => getBoardSize(ratio), [ratio]);
  const viewport = useUIStore((state) => state.viewport);
  const paddingTopValue =
    typeof paddingTop === "number" ? `${paddingTop}px` : paddingTop;
  const paddingBottomValue =
    typeof paddingBottom === "number" ? `${paddingBottom}px` : paddingBottom;

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let rafId = 0;
    const updateSize = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = container.getBoundingClientRect();
        const style = window.getComputedStyle(container);
        const padX =
          Number.parseFloat(style.paddingLeft) +
          Number.parseFloat(style.paddingRight);
        const padY =
          Number.parseFloat(style.paddingTop) +
          Number.parseFloat(style.paddingBottom);
        const w = Math.max(0, rect.width - padX);
        const h = Math.max(0, rect.height - padY);
        if (w === 0 || h === 0) return;
        const nextScale = Math.min(w / boardSize.width, h / boardSize.height);
        setScale((prev) => {
          if (Math.abs(prev - nextScale) < 0.001) return prev;
          return nextScale;
        });
      });
    };

    const observer = new ResizeObserver(updateSize);
    observer.observe(container);
    updateSize();

    return () => {
      observer.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [
    boardSize.height,
    boardSize.width,
    paddingTopValue,
    paddingBottomValue,
  ]);

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full items-center justify-center px-0"
      style={{
        paddingTop: paddingTopValue,
        paddingBottom: paddingBottomValue,
      }}
    >
      <div
        data-page-viewport
        className="relative"
        style={{
          width: `${boardSize.width * scale}px`,
          height: `${boardSize.height * scale}px`,
        }}
      >
        <PageScaleContext.Provider value={scale}>
          {overlay}
          <div
            data-viewport-transform
            className="absolute left-0 top-0 h-full w-full origin-top-left"
            style={{
              transform: `translate(${viewport.panOffset.x}px, ${viewport.panOffset.y}px) scale(${viewport.zoomLevel})`,
            }}
          >
            <div
              data-board-root
              className={cn("absolute left-0 top-0 origin-top-left", className)}
              style={{
                width: `${boardSize.width}px`,
                height: `${boardSize.height}px`,
                transform: `scale(${scale})`,
              }}
            >
              {children}
            </div>
          </div>
        </PageScaleContext.Provider>
      </div>
    </div>
  );
}
