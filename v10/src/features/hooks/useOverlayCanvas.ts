"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

import { useUIStore, type LaserType, type PenType } from "@features/store/useUIStore";
import type { Point, StrokeItem } from "@core/types/canvas";

type LaserPoint = { x: number; y: number; t: number };

type InputConfig = {
  smoothing: {
    minAlpha: number;
    maxAlpha: number;
    maxSpeed: number;
    minDistance: number;
  };
  pressure: {
    min: number;
    max: number;
  };
};

const inputConfig: InputConfig = {
  smoothing: {
    minAlpha: 0.35,
    maxAlpha: 0.85,
    maxSpeed: 1.2,
    minDistance: 0.4,
  },
  pressure: {
    min: 0.1,
    max: 1.0,
  },
};

const laserDefaults: Record<
  LaserType,
  { width: number; alpha: number; shadow: number }
> = {
  standard: { width: 10, alpha: 0.9, shadow: 10 },
  highlighter: { width: 32, alpha: 0.35, shadow: 0 },
};

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
  const p = clamp(pressure ?? 0.5, inputConfig.pressure.min, inputConfig.pressure.max);
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

const createStrokeId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `overlay-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export function useOverlayCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const laserCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const laserCtxRef = useRef<CanvasRenderingContext2D | null>(null);

  const isDrawingRef = useRef(false);
  const isLaserRef = useRef(false);
  const pointsRef = useRef<Point[]>([]);
  const laserPointsRef = useRef<LaserPoint[]>([]);
  const activeStrokeRef = useRef<StrokeItem | null>(null);
  const overlayStrokesRef = useRef<StrokeItem[]>([]);
  const lastRawPointRef = useRef<Point | null>(null);
  const lastSmoothPointRef = useRef<Point | null>(null);
  const lastDrawPointRef = useRef<Point | null>(null);
  const laserRafRef = useRef<number | null>(null);
  const laserTypeRef = useRef<LaserType>("standard");
  const laserColorRef = useRef<string>("#FF3B30");
  const laserWidthRef = useRef<number>(10);

  const {
    activeTool,
    penColor,
    penWidth,
    penOpacity,
    penType,
    laserType,
    laserColor,
    laserWidth,
    isViewportInteracting,
  } = useUIStore();

  const getCanvasPoint = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: clientX, y: clientY };
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / (canvas.offsetWidth || rect.width || 1);
    const scaleY = rect.height / (canvas.offsetHeight || rect.height || 1);
    return {
      x: (clientX - rect.left) / scaleX,
      y: (clientY - rect.top) / scaleY,
    };
  }, []);

  const getPointerPressure = useCallback((event: PointerEvent) => {
    if (event.pointerType !== "pen") return 0.5;
    const pressure =
      typeof event.pressure === "number" ? event.pressure : 0.5;
    return clamp(pressure, inputConfig.pressure.min, inputConfig.pressure.max);
  }, []);

  const getCoalescedEvents = useCallback((event: PointerEvent) => {
    if (typeof event.getCoalescedEvents === "function") {
      const events = event.getCoalescedEvents();
      if (events && events.length > 0) return events;
    }
    return [event];
  }, []);

  const makePoint = useCallback(
    (event: PointerEvent) => {
      const point = getCanvasPoint(event.clientX, event.clientY);
      return {
        x: point.x,
        y: point.y,
        p: getPointerPressure(event),
        t: event.timeStamp || performance.now(),
      } satisfies Point;
    },
    [getCanvasPoint, getPointerPressure]
  );

  const smoothPoint = useCallback((rawPoint: Point) => {
    const lastSmooth = lastSmoothPointRef.current;
    const lastRaw = lastRawPointRef.current;
    if (!lastSmooth || !lastRaw) return rawPoint;
    const dt = Math.max(1, (rawPoint.t ?? 0) - (lastRaw.t ?? 0));
    const dx = rawPoint.x - lastRaw.x;
    const dy = rawPoint.y - lastRaw.y;
    const dist = Math.hypot(dx, dy);
    const speed = dist / dt;
    const t = Math.min(speed / inputConfig.smoothing.maxSpeed, 1);
    const alpha =
      inputConfig.smoothing.minAlpha +
      (inputConfig.smoothing.maxAlpha - inputConfig.smoothing.minAlpha) * t;
    return {
      x: lastSmooth.x + (rawPoint.x - lastSmooth.x) * alpha,
      y: lastSmooth.y + (rawPoint.y - lastSmooth.y) * alpha,
      p: rawPoint.p,
      t: rawPoint.t,
    } satisfies Point;
  }, []);

  const drawStoredStroke = useCallback(
    (ctx: CanvasRenderingContext2D, stroke: StrokeItem) => {
      const path = stroke.path || [];
      if (path.length < 2) return;

      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      const color = stroke.color ?? penColor;
      const alpha = stroke.alpha ?? penOpacity / 100;
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
          stroke.penType ?? penType,
          stroke.pointerType
        );
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    },
    [penColor, penOpacity, penType]
  );

  const renderAll = useCallback(
    (nextStrokes?: StrokeItem[]) => {
      const ctx = ctxRef.current;
      const canvas = canvasRef.current;
      if (!ctx || !canvas) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const dpr = window.devicePixelRatio || 1;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const list = nextStrokes ?? overlayStrokesRef.current;
      list.forEach((stroke) => drawStoredStroke(ctx, stroke));
      ctx.globalCompositeOperation = "source-over";
    },
    [drawStoredStroke]
  );

  const clearLaserCanvas = useCallback(() => {
    const ctx = laserCtxRef.current;
    const canvas = laserCanvasRef.current;
    if (!ctx || !canvas) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, []);

  const cancelActiveStroke = useCallback(() => {
    if (isLaserRef.current) {
      isLaserRef.current = false;
      laserPointsRef.current = [];
      clearLaserCanvas();
    }
    if (isDrawingRef.current || activeStrokeRef.current) {
      isDrawingRef.current = false;
      activeStrokeRef.current = null;
      pointsRef.current = [];
      lastRawPointRef.current = null;
      lastSmoothPointRef.current = null;
      lastDrawPointRef.current = null;
      renderAll(overlayStrokesRef.current);
    }
  }, [clearLaserCanvas, renderAll]);

  const scheduleLaserFrame = useCallback(() => {
    if (laserRafRef.current !== null) return;

    const loop = () => {
      const ctx = laserCtxRef.current;
      const canvas = laserCanvasRef.current;
      if (!ctx || !canvas) {
        laserRafRef.current = null;
        return;
      }

      const now = performance.now();
      const maxLife = 1200;
      laserPointsRef.current = laserPointsRef.current.filter(
        (point) => now - point.t < maxLife
      );

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const dpr = window.devicePixelRatio || 1;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (laserPointsRef.current.length > 1) {
        const type = laserTypeRef.current;
        const color = laserColorRef.current;
        const width = laserWidthRef.current;
        const settings = laserDefaults[type];
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.strokeStyle = color;
        ctx.lineWidth = width || settings.width;

        if (type === "standard") {
          ctx.shadowBlur = settings.shadow;
          ctx.shadowColor = color;
          for (let i = 1; i < laserPointsRef.current.length; i += 1) {
            const p1 = laserPointsRef.current[i - 1];
            const p2 = laserPointsRef.current[i];
            const age = now - p2.t;
            const opacity = Math.max(0, 1 - age / maxLife) * settings.alpha;
            ctx.globalAlpha = opacity;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
          ctx.globalAlpha = 1;
          ctx.shadowBlur = 0;
        } else {
          ctx.globalAlpha = settings.alpha;
          ctx.beginPath();
          ctx.moveTo(laserPointsRef.current[0].x, laserPointsRef.current[0].y);
          for (let i = 1; i < laserPointsRef.current.length; i += 1) {
            const point = laserPointsRef.current[i];
            ctx.lineTo(point.x, point.y);
          }
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }

      if (laserPointsRef.current.length > 0) {
        laserRafRef.current = requestAnimationFrame(loop);
      } else {
        laserRafRef.current = null;
      }
    };

    laserRafRef.current = requestAnimationFrame(loop);
  }, []);

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const nativeEvent = event.nativeEvent as PointerEvent;
      if (isViewportInteracting) return;
      if (activeTool !== "pen" && activeTool !== "laser") return;

      if (activeTool === "laser") {
        isLaserRef.current = true;
        event.currentTarget.setPointerCapture(event.pointerId);
        const point = getCanvasPoint(nativeEvent.clientX, nativeEvent.clientY);
        laserPointsRef.current = [
          { x: point.x, y: point.y, t: performance.now() },
        ];
        scheduleLaserFrame();
        return;
      }

      isDrawingRef.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);

      const point = makePoint(nativeEvent);
      pointsRef.current = [point];
      lastRawPointRef.current = point;
      lastSmoothPointRef.current = point;
      lastDrawPointRef.current = point;

      const newStroke: StrokeItem = {
        id: createStrokeId(),
        type: "stroke",
        tool: "pen",
        penType: penType,
        color: penColor,
        width: penWidth,
        alpha: penOpacity / 100,
        pointerType: nativeEvent.pointerType,
        path: [point],
        x: 0,
        y: 0,
        zIndex: overlayStrokesRef.current.length,
      };
      activeStrokeRef.current = newStroke;
      renderAll();
    },
    [
      activeTool,
      getCanvasPoint,
      isViewportInteracting,
      makePoint,
      penColor,
      penOpacity,
      penType,
      penWidth,
      renderAll,
      scheduleLaserFrame,
    ]
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const nativeEvent = event.nativeEvent as PointerEvent;
      if (isViewportInteracting) return;

      if (activeTool === "laser" && isLaserRef.current) {
        const events = getCoalescedEvents(nativeEvent);
        for (const ev of events) {
          const point = getCanvasPoint(ev.clientX, ev.clientY);
          laserPointsRef.current.push({
            x: point.x,
            y: point.y,
            t: performance.now(),
          });
        }
        scheduleLaserFrame();
        return;
      }

      if (!isDrawingRef.current || !activeStrokeRef.current) return;
      const ctx = ctxRef.current;
      if (!ctx) return;

      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      const events = getCoalescedEvents(nativeEvent);
      for (const ev of events) {
        const rawPoint = makePoint(ev);
        const smooth = smoothPoint(rawPoint);
        const lastDrawPoint = lastDrawPointRef.current;

        if (lastDrawPoint) {
          const dist = Math.hypot(
            smooth.x - lastDrawPoint.x,
            smooth.y - lastDrawPoint.y
          );
          if (dist < inputConfig.smoothing.minDistance) {
            lastRawPointRef.current = rawPoint;
            continue;
          }

          const rgba = toRgba(
            activeStrokeRef.current.color ?? penColor,
            activeStrokeRef.current.alpha ?? penOpacity / 100
          );
          ctx.globalCompositeOperation = "source-over";
          ctx.strokeStyle = rgba;
          const pressure =
            ((lastDrawPoint.p ?? 0.5) + (smooth.p ?? 0.5)) / 2;
          ctx.lineWidth = getStrokeWidth(
            activeStrokeRef.current.width,
            pressure,
            activeStrokeRef.current.penType,
            activeStrokeRef.current.pointerType
          );
          if (activeStrokeRef.current.penType === "pencil") {
            ctx.shadowBlur = 2;
            ctx.shadowColor = rgba;
          } else {
            ctx.shadowBlur = 0;
          }

          ctx.beginPath();
          ctx.moveTo(lastDrawPoint.x, lastDrawPoint.y);
          ctx.lineTo(smooth.x, smooth.y);
          ctx.stroke();
        }

        activeStrokeRef.current.path.push(smooth);
        pointsRef.current.push(smooth);
        lastRawPointRef.current = rawPoint;
        lastSmoothPointRef.current = smooth;
        lastDrawPointRef.current = smooth;
      }

      ctx.globalCompositeOperation = "source-over";
    },
    [
      activeTool,
      getCanvasPoint,
      getCoalescedEvents,
      isViewportInteracting,
      makePoint,
      penColor,
      penOpacity,
      scheduleLaserFrame,
      smoothPoint,
    ]
  );

  const handlePointerUp = useCallback(() => {
    if (isViewportInteracting) {
      cancelActiveStroke();
      return;
    }
    if (isLaserRef.current) {
      isLaserRef.current = false;
      return;
    }

    if (!isDrawingRef.current || !activeStrokeRef.current) return;
    isDrawingRef.current = false;
    const finishedStroke = {
      ...activeStrokeRef.current,
      path: [...activeStrokeRef.current.path],
    };
    overlayStrokesRef.current = [...overlayStrokesRef.current, finishedStroke];
    renderAll(overlayStrokesRef.current);
    activeStrokeRef.current = null;
    pointsRef.current = [];
    lastRawPointRef.current = null;
    lastSmoothPointRef.current = null;
    lastDrawPointRef.current = null;
  }, [cancelActiveStroke, isViewportInteracting, renderAll]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      ctxRef.current = canvas.getContext("2d");
    }
    const laserCanvas = laserCanvasRef.current;
    if (laserCanvas) {
      laserCtxRef.current = laserCanvas.getContext("2d");
    }
  }, []);

  useEffect(() => {
    laserTypeRef.current = laserType;
  }, [laserType]);

  useEffect(() => {
    laserColorRef.current = laserColor;
  }, [laserColor]);

  useEffect(() => {
    laserWidthRef.current = laserWidth;
  }, [laserWidth]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const laserCanvas = laserCanvasRef.current;
    if (!canvas) return;
    const container = canvas.parentElement;
    if (!container) return;

    const resize = () => {
      const width = container.offsetWidth;
      const height = container.offsetHeight;
      if (width === 0 || height === 0) return;
      const dpr = window.devicePixelRatio || 1;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctxRef.current?.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (laserCanvas) {
        laserCanvas.width = Math.floor(width * dpr);
        laserCanvas.height = Math.floor(height * dpr);
        laserCanvas.style.width = `${width}px`;
        laserCanvas.style.height = `${height}px`;
        laserCtxRef.current?.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      renderAll();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();

    return () => observer.disconnect();
  }, [renderAll]);

  useEffect(() => {
    if (activeTool !== "laser") {
      laserPointsRef.current = [];
      clearLaserCanvas();
    }
  }, [activeTool, clearLaserCanvas]);

  useEffect(() => {
    if (isViewportInteracting) {
      cancelActiveStroke();
    }
  }, [cancelActiveStroke, isViewportInteracting]);

  useEffect(() => {
    return () => {
      if (laserRafRef.current !== null) {
        cancelAnimationFrame(laserRafRef.current);
      }
    };
  }, []);

  const bind = useMemo(
    () => ({
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerUp,
      onPointerLeave: handlePointerUp,
    }),
    [handlePointerDown, handlePointerMove, handlePointerUp]
  );

  const clear = useCallback(() => {
    overlayStrokesRef.current = [];
    renderAll([]);
    clearLaserCanvas();
  }, [renderAll, clearLaserCanvas]);

  return {
    canvasRef,
    laserCanvasRef,
    bind,
    clear,
  };
}
