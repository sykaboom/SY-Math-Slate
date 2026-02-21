"use client";

import { useEffect, useMemo, useRef } from "react";

import { useCanvasStore } from "@features/platform/store/useCanvasStore";
import type { CanvasItem, Point, StrokeItem, PenType } from "@core/foundation/types/canvas";

const isStrokeItem = (item: CanvasItem): item is StrokeItem => item.type === "stroke";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const toRgba = (color: string, alpha: number) => {
  const r = Number.parseInt(color.slice(1, 3), 16);
  const g = Number.parseInt(color.slice(3, 5), 16);
  const b = Number.parseInt(color.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

const getStrokeWidth = (
  baseWidth: number,
  pressure: number,
  penType: PenType | undefined,
  pointerType: string | undefined
) => {
  if (pointerType !== "pen") return baseWidth;
  const p = clamp(pressure ?? 0.5, 0.1, 1.0);
  let minFactor = 0.35;
  let maxFactor = 1.25;
  if (penType === "pencil") {
    minFactor = 0.5;
    maxFactor = 1.1;
  }
  if (penType === "highlighter") {
    minFactor = 0.9;
    maxFactor = 1.05;
  }
  return baseWidth * (minFactor + (maxFactor - minFactor) * p);
};

const drawStoredStroke = (ctx: CanvasRenderingContext2D, stroke: StrokeItem) => {
  const path = stroke.path || [];
  if (path.length < 2) return;

  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  if (stroke.tool === "eraser") {
    ctx.globalCompositeOperation = "destination-out";
    ctx.strokeStyle = "rgba(0,0,0,1)";
    ctx.shadowBlur = 0;
    for (let i = 1; i < path.length; i += 1) {
      const p1 = path[i - 1];
      const p2 = path[i];
      ctx.lineWidth = stroke.width;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
    ctx.globalCompositeOperation = "source-over";
    return;
  }

  const color = stroke.color ?? "#FFFFFF";
  const alpha = stroke.alpha ?? 1;
  const rgba = toRgba(color, alpha);

  ctx.globalCompositeOperation = "source-over";
  ctx.strokeStyle = rgba;
  if (stroke.penType === "pencil") {
    ctx.shadowBlur = 2;
    ctx.shadowColor = rgba;
  } else {
    ctx.shadowBlur = 0;
  }

  for (let i = 1; i < path.length; i += 1) {
    const p1 = path[i - 1];
    const p2 = path[i];
    const pressure = ((p1.p ?? 0.5) + (p2.p ?? 0.5)) / 2;
    ctx.lineWidth = getStrokeWidth(
      stroke.width,
      pressure,
      stroke.penType,
      stroke.pointerType
    );
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }
};

const normalizePath = (path: Point[] | undefined) => path ?? [];

type StaticStrokeLayerProps = {
  pageId: string;
  className?: string;
};

export function StaticStrokeLayer({ pageId, className }: StaticStrokeLayerProps) {
  const { pages } = useCanvasStore();
  const strokes = useMemo(() => {
    const items = pages[pageId] ?? [];
    return items
      .filter(isStrokeItem)
      .map((stroke) => ({ ...stroke, path: normalizePath(stroke.path) }));
  }, [pages, pageId]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const container = canvas.parentElement;
    if (!container) return;

    const render = () => {
      const width = container.offsetWidth;
      const height = container.offsetHeight;
      if (width === 0 || height === 0) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      strokes.forEach((stroke) => drawStoredStroke(ctx, stroke));
      ctx.globalCompositeOperation = "source-over";
    };

    const observer = new ResizeObserver(render);
    observer.observe(container);
    render();

    return () => observer.disconnect();
  }, [strokes]);

  return (
    <div className={className}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
