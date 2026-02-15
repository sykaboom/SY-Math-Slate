import { useCallback, useEffect, useMemo, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

import { useUIStore, type LaserType, type PenType } from "@features/store/useUIStoreBridge";
import { useCanvasStore } from "@features/store/useCanvasStore";
import { useLocalStore } from "@features/store/useLocalStore";
import { useSyncStore } from "@features/store/useSyncStore";
import type { CanvasItem, Point, StrokeItem } from "@core/types/canvas";
import { getBoardSize } from "@core/config/boardSpec";
import { getRenderPerfProfile } from "@core/config/perfProfile";
import { useBoardTransform } from "@features/hooks/useBoardTransform";

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
    minDistance: 0.55,
  },
  pressure: {
    min: 0.1,
    max: 1.0,
  },
};

const TOUCH_PALM_REJECTION_MS = 560;
const TOUCH_PALM_CONTACT_THRESHOLD_PX = 24;
const TOUCH_ACTIVE_PEN_CONTACT_THRESHOLD_PX = 18;
const TOUCH_DISTANCE_FACTOR = 1.25;
const CANVAS_GESTURE_LOCK_OWNER = "canvas.draw";
const LASER_SYNC_INTERVAL_MS = 33;
const LASER_SYNC_PRECISION_FACTOR = 10;

const laserDefaults: Record<
  LaserType,
  { width: number; alpha: number; shadow: number }
> = {
  standard: { width: 10, alpha: 0.9, shadow: 10 },
  highlighter: { width: 32, alpha: 0.35, shadow: 0 },
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const getPointerTimestamp = (event: PointerEvent) =>
  event.timeStamp || performance.now();

const samplePointerEvents = (events: PointerEvent[], maxEvents: number) => {
  if (!Number.isFinite(maxEvents)) return events;
  const targetSize = Math.max(1, Math.floor(maxEvents));
  if (events.length <= targetSize) return events;
  if (targetSize === 1) {
    return [events[events.length - 1]];
  }

  const sampled: PointerEvent[] = [];
  const stride = (events.length - 1) / (targetSize - 1);
  for (let index = 0; index < targetSize; index += 1) {
    const sampleIndex = Math.round(index * stride);
    sampled.push(events[Math.min(sampleIndex, events.length - 1)]);
  }
  return sampled;
};

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
  return `stroke-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const isStrokeItem = (item: CanvasItem): item is StrokeItem =>
  item.type === "stroke";

const ERASER_WIDTH = 40;
const ERASER_RADIUS = ERASER_WIDTH / 2;

const distanceToSegment = (point: Point, a: Point, b: Point) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (dx === 0 && dy === 0) {
    return Math.hypot(point.x - a.x, point.y - a.y);
  }
  const t = ((point.x - a.x) * dx + (point.y - a.y) * dy) / (dx * dx + dy * dy);
  const clamped = Math.max(0, Math.min(1, t));
  const px = a.x + clamped * dx;
  const py = a.y + clamped * dy;
  return Math.hypot(point.x - px, point.y - py);
};

const segmentDistance = (a1: Point, a2: Point, b1: Point, b2: Point) => {
  return Math.min(
    distanceToSegment(a1, b1, b2),
    distanceToSegment(a2, b1, b2),
    distanceToSegment(b1, a1, a2),
    distanceToSegment(b2, a1, a2)
  );
};

const strokeIntersectsSegment = (
  stroke: StrokeItem,
  from: Point,
  to: Point,
  radius: number
) => {
  const path = stroke.path ?? [];
  if (path.length === 0) return false;
  const threshold = radius + (stroke.width ?? 0) / 2;
  if (path.length === 1) {
    return distanceToSegment(path[0], from, to) <= threshold;
  }
  for (let i = 1; i < path.length; i += 1) {
    if (segmentDistance(from, to, path[i - 1], path[i]) <= threshold) {
      return true;
    }
  }
  return false;
};

const getMinDistanceForPointer = (pointerType: string | undefined) => {
  if (pointerType === "touch") {
    return inputConfig.smoothing.minDistance * TOUCH_DISTANCE_FACTOR;
  }
  return inputConfig.smoothing.minDistance;
};

export function useCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const laserCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const laserCtxRef = useRef<CanvasRenderingContext2D | null>(null);

  const isDrawingRef = useRef(false);
  const isErasingRef = useRef(false);
  const isLaserRef = useRef(false);
  const pointsRef = useRef<Point[]>([]);
  const laserPointsRef = useRef<LaserPoint[]>([]);
  const activeStrokeRef = useRef<StrokeItem | null>(null);
  const erasedStrokeIdsRef = useRef<Set<string>>(new Set());
  const lastRawPointRef = useRef<Point | null>(null);
  const lastSmoothPointRef = useRef<Point | null>(null);
  const lastDrawPointRef = useRef<Point | null>(null);
  const laserRafRef = useRef<number | null>(null);
  const laserTypeRef = useRef<LaserType>("standard");
  const laserColorRef = useRef<string>("#FF3B30");
  const laserWidthRef = useRef<number>(10);
  const lastLaserSyncAtRef = useRef<number>(0);
  const lastLaserSyncedPointRef = useRef<{ x: number; y: number } | null>(null);
  const lastPenInputAtRef = useRef<number>(0);
  const activePenPointerIdRef = useRef<number | null>(null);
  const suppressedTouchPointerIdsRef = useRef<Set<number>>(new Set());
  const hasGestureLockRef = useRef(false);

  const {
    activeTool,
    penColor,
    penWidth,
    penOpacity,
    penType,
    laserType,
    laserColor,
    laserWidth,
    overviewViewportRatio,
    isViewportInteracting,
    releaseGestureLock,
  } = useUIStore();
  const role = useLocalStore((state) => state.role);
  const trustedRoleClaim = useLocalStore((state) => state.trustedRoleClaim);
  const setSyncedLaserPosition = useSyncStore((state) => state.setLaserPosition);
  const { pages, currentPageId, addStroke, setCurrentStroke, deleteItem } =
    useCanvasStore();
  const { toBoardPoint } = useBoardTransform();
  const boardSize = useMemo(
    () => getBoardSize(overviewViewportRatio),
    [overviewViewportRatio]
  );
  const items = useMemo(
    () => pages[currentPageId] ?? [],
    [pages, currentPageId]
  );
  const strokes = useMemo(
    () => items.filter(isStrokeItem),
    [items]
  );
  const perfProfile = useMemo(() => getRenderPerfProfile(), []);
  const laserTrailMaxLifeMs = perfProfile.laserTrailMaxLifeMs;
  const laserShadowMultiplier = perfProfile.laserShadowMultiplier;
  const maxCoalescedEvents = perfProfile.maxCoalescedEvents;

  const canPublishSyncedLaser = trustedRoleClaim === "host";

  const getCanvasPoint = useCallback(
    (clientX: number, clientY: number) => toBoardPoint(clientX, clientY),
    [toBoardPoint]
  );

  const normalizeLaserSyncPoint = useCallback(
    (point: { x: number; y: number }) => ({
      x:
        Math.round(
          clamp(point.x, 0, boardSize.width) * LASER_SYNC_PRECISION_FACTOR
        ) / LASER_SYNC_PRECISION_FACTOR,
      y:
        Math.round(
          clamp(point.y, 0, boardSize.height) * LASER_SYNC_PRECISION_FACTOR
        ) / LASER_SYNC_PRECISION_FACTOR,
    }),
    [boardSize.height, boardSize.width]
  );

  const syncLaserPosition = useCallback(
    (point: { x: number; y: number } | null, options?: { force?: boolean }) => {
      if (point === null) {
        if (lastLaserSyncedPointRef.current === null) return;
        lastLaserSyncedPointRef.current = null;
        lastLaserSyncAtRef.current = 0;
        setSyncedLaserPosition(null);
        return;
      }

      if (!canPublishSyncedLaser) return;

      const normalized = normalizeLaserSyncPoint(point);
      const lastPoint = lastLaserSyncedPointRef.current;
      if (
        lastPoint &&
        lastPoint.x === normalized.x &&
        lastPoint.y === normalized.y
      ) {
        return;
      }

      const now = performance.now();
      if (
        !options?.force &&
        now - lastLaserSyncAtRef.current < LASER_SYNC_INTERVAL_MS
      ) {
        return;
      }

      lastLaserSyncAtRef.current = now;
      lastLaserSyncedPointRef.current = normalized;
      setSyncedLaserPosition(normalized);
    },
    [canPublishSyncedLaser, normalizeLaserSyncPoint, setSyncedLaserPosition]
  );

  const getPointerPressure = useCallback((event: PointerEvent) => {
    if (event.pointerType !== "pen") return 0.5;
    const pressure =
      typeof event.pressure === "number" ? event.pressure : 0.5;
    return clamp(pressure, inputConfig.pressure.min, inputConfig.pressure.max);
  }, []);

  const getCoalescedEvents = useCallback((event: PointerEvent) => {
    let events: PointerEvent[] = [event];
    if (typeof event.getCoalescedEvents === "function") {
      const coalesced = event.getCoalescedEvents();
      if (coalesced && coalesced.length > 0) {
        events = coalesced;
      }
    }
    return samplePointerEvents(events, maxCoalescedEvents);
  }, [maxCoalescedEvents]);

  const makePoint = useCallback(
    (event: PointerEvent) => {
      const point = getCanvasPoint(event.clientX, event.clientY);
      return {
        x: point.x,
        y: point.y,
        p: getPointerPressure(event),
        t: getPointerTimestamp(event),
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

  const releaseDrawGestureLock = useCallback(() => {
    if (!hasGestureLockRef.current) return;
    releaseGestureLock(CANVAS_GESTURE_LOCK_OWNER);
    hasGestureLockRef.current = false;
  }, [releaseGestureLock]);

  const tryAcquireDrawGestureLock = useCallback(() => {
    if (hasGestureLockRef.current) return true;
    const state = useUIStore.getState();
    if (state.isGestureLocked) return false;
    state.acquireGestureLock(CANVAS_GESTURE_LOCK_OWNER);
    hasGestureLockRef.current = true;
    return true;
  }, []);

  const markPenActivity = useCallback((event: PointerEvent) => {
    if (event.pointerType !== "pen") return;
    const hasPenContact =
      event.type === "pointerdown" ||
      event.type === "pointerup" ||
      event.type === "pointercancel" ||
      event.buttons !== 0 ||
      event.pressure > 0;
    if (!hasPenContact) return;

    lastPenInputAtRef.current = getPointerTimestamp(event);
    if (event.type === "pointerdown") {
      activePenPointerIdRef.current = event.pointerId;
      return;
    }

    if (
      (event.type === "pointerup" ||
        event.type === "pointercancel" ||
        event.type === "pointerleave") &&
      activePenPointerIdRef.current === event.pointerId
    ) {
      activePenPointerIdRef.current = null;
    }
  }, []);

  const shouldSuppressTouch = useCallback((event: PointerEvent) => {
    if (event.pointerType !== "touch") return false;

    if (
      event.type === "pointerup" ||
      event.type === "pointercancel" ||
      event.type === "pointerleave"
    ) {
      const wasSuppressed = suppressedTouchPointerIdsRef.current.delete(
        event.pointerId
      );
      return wasSuppressed;
    }

    if (suppressedTouchPointerIdsRef.current.has(event.pointerId)) {
      return true;
    }

    const now = getPointerTimestamp(event);
    const recentPenActivity =
      now - lastPenInputAtRef.current <= TOUCH_PALM_REJECTION_MS;
    const contactSize = Math.max(event.width || 0, event.height || 0);
    const coarsePalmContact = contactSize >= TOUCH_PALM_CONTACT_THRESHOLD_PX;
    const activePenContact =
      contactSize >= TOUCH_ACTIVE_PEN_CONTACT_THRESHOLD_PX;
    const hasActivePen = activePenPointerIdRef.current !== null;
    const likelyPalm =
      (recentPenActivity && coarsePalmContact) ||
      (hasActivePen && (activePenContact || event.isPrimary === false));

    if (likelyPalm) {
      suppressedTouchPointerIdsRef.current.add(event.pointerId);
    }
    return likelyPalm;
  }, []);

  const drawStoredStroke = useCallback((ctx: CanvasRenderingContext2D, stroke: StrokeItem) => {
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
      return;
    }

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
  }, [penColor, penOpacity, penType]);

  const renderAll = useCallback((nextStrokes?: StrokeItem[]) => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const list = nextStrokes ?? strokes;
    list.forEach((stroke) => drawStoredStroke(ctx, stroke));
    ctx.globalCompositeOperation = "source-over";
  }, [drawStoredStroke, strokes]);

  const eraseStrokesAtSegment = useCallback(
    (from: Point, to: Point) => {
      const erased = erasedStrokeIdsRef.current;
      let didErase = false;
      const remaining: StrokeItem[] = [];

      strokes.forEach((stroke) => {
        if (erased.has(stroke.id)) return;
        if (strokeIntersectsSegment(stroke, from, to, ERASER_RADIUS)) {
          erased.add(stroke.id);
          deleteItem(stroke.id);
          didErase = true;
          return;
        }
        remaining.push(stroke);
      });

      if (didErase) {
        renderAll(remaining);
      }
    },
    [deleteItem, renderAll, strokes]
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
      syncLaserPosition(null, { force: true });
    }
    if (isDrawingRef.current || activeStrokeRef.current || isErasingRef.current) {
      isDrawingRef.current = false;
      isErasingRef.current = false;
      activeStrokeRef.current = null;
      erasedStrokeIdsRef.current.clear();
      pointsRef.current = [];
      lastRawPointRef.current = null;
      lastSmoothPointRef.current = null;
      lastDrawPointRef.current = null;
      setCurrentStroke(null);
      renderAll();
    }
    activePenPointerIdRef.current = null;
    suppressedTouchPointerIdsRef.current.clear();
    releaseDrawGestureLock();
  }, [
    clearLaserCanvas,
    releaseDrawGestureLock,
    renderAll,
    setCurrentStroke,
    syncLaserPosition,
  ]);

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
      const maxLife = laserTrailMaxLifeMs;
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
          ctx.shadowBlur = settings.shadow * laserShadowMultiplier;
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
  }, [laserShadowMultiplier, laserTrailMaxLifeMs]);

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const nativeEvent = event.nativeEvent as PointerEvent;
      markPenActivity(nativeEvent);
      if (shouldSuppressTouch(nativeEvent)) return;
      if (isViewportInteracting) return;
      if (activeTool !== "pen" && activeTool !== "eraser" && activeTool !== "laser") {
        return;
      }
      if (!tryAcquireDrawGestureLock()) return;

      if (activeTool === "laser") {
        isLaserRef.current = true;
        event.currentTarget.setPointerCapture(event.pointerId);
        const point = getCanvasPoint(nativeEvent.clientX, nativeEvent.clientY);
        laserPointsRef.current = [
          { x: point.x, y: point.y, t: performance.now() },
        ];
        syncLaserPosition(point, { force: true });
        scheduleLaserFrame();
        return;
      }

      if (activeTool === "eraser") {
        isDrawingRef.current = true;
        isErasingRef.current = true;
        erasedStrokeIdsRef.current.clear();
        event.currentTarget.setPointerCapture(event.pointerId);

        const point = makePoint(nativeEvent);
        pointsRef.current = [point];
        lastRawPointRef.current = point;
        lastSmoothPointRef.current = point;
        lastDrawPointRef.current = point;
        eraseStrokesAtSegment(point, point);
        return;
      }

      isDrawingRef.current = true;
      isErasingRef.current = false;
      event.currentTarget.setPointerCapture(event.pointerId);

      const point = makePoint(nativeEvent);
      pointsRef.current = [point];
      lastRawPointRef.current = point;
      lastSmoothPointRef.current = point;
      lastDrawPointRef.current = point;

      const zIndex = items.length;
      const newStroke: StrokeItem = {
        id: createStrokeId(),
        type: "stroke",
        tool: "pen",
        penType,
        color: penColor,
        width: penWidth,
        alpha: penOpacity / 100,
        pointerType: nativeEvent.pointerType,
        path: [point],
        x: 0,
        y: 0,
        zIndex,
      };
      activeStrokeRef.current = newStroke;
      setCurrentStroke(newStroke);
      renderAll();
    },
    [
      activeTool,
      eraseStrokesAtSegment,
      getCanvasPoint,
      isViewportInteracting,
      items,
      markPenActivity,
      makePoint,
      penColor,
      penOpacity,
      penType,
      penWidth,
      renderAll,
      scheduleLaserFrame,
      setCurrentStroke,
      shouldSuppressTouch,
      syncLaserPosition,
      tryAcquireDrawGestureLock,
    ]
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const nativeEvent = event.nativeEvent as PointerEvent;
      markPenActivity(nativeEvent);
      if (shouldSuppressTouch(nativeEvent)) return;
      if (isViewportInteracting) return;
      if (activeTool === "laser" && isLaserRef.current) {
        const events = getCoalescedEvents(nativeEvent);
        let latestPoint: { x: number; y: number } | null = null;
        for (const ev of events) {
          const point = getCanvasPoint(ev.clientX, ev.clientY);
          latestPoint = point;
          laserPointsRef.current.push({
            x: point.x,
            y: point.y,
            t: performance.now(),
          });
        }
        if (latestPoint) {
          syncLaserPosition(latestPoint);
        }
        scheduleLaserFrame();
        return;
      }

      if (!isDrawingRef.current) return;

      if (isErasingRef.current) {
        const minDistance = getMinDistanceForPointer(nativeEvent.pointerType);
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
            if (dist >= minDistance) {
              eraseStrokesAtSegment(lastDrawPoint, smooth);
              lastDrawPointRef.current = smooth;
            }
          } else {
            lastDrawPointRef.current = smooth;
          }
          lastRawPointRef.current = rawPoint;
          lastSmoothPointRef.current = smooth;
        }
        return;
      }

      if (!activeStrokeRef.current) return;
      const ctx = ctxRef.current;
      if (!ctx) return;

      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      const minDistance = getMinDistanceForPointer(nativeEvent.pointerType);
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
          if (dist < minDistance) {
            lastRawPointRef.current = rawPoint;
            continue;
          }

          if (activeStrokeRef.current.tool === "pen") {
            ctx.globalCompositeOperation = "source-over";
            const rgba = toRgba(
              activeStrokeRef.current.color ?? penColor,
              activeStrokeRef.current.alpha ?? penOpacity / 100
            );
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
          } else {
            ctx.globalCompositeOperation = "destination-out";
            ctx.strokeStyle = "rgba(0,0,0,1)";
            ctx.lineWidth = activeStrokeRef.current.width;
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
      eraseStrokesAtSegment,
      getCanvasPoint,
      getCoalescedEvents,
      isViewportInteracting,
      markPenActivity,
      makePoint,
      penColor,
      penOpacity,
      scheduleLaserFrame,
      smoothPoint,
      shouldSuppressTouch,
      syncLaserPosition,
    ]
  );

  const handlePointerUp = useCallback(
    (event?: ReactPointerEvent<HTMLDivElement>) => {
      const nativeEvent = event?.nativeEvent as PointerEvent | undefined;
      if (nativeEvent) {
        markPenActivity(nativeEvent);
        if (shouldSuppressTouch(nativeEvent)) return;
      }
      if (isViewportInteracting) {
        cancelActiveStroke();
        return;
      }
      if (isLaserRef.current) {
        isLaserRef.current = false;
        syncLaserPosition(null, { force: true });
        releaseDrawGestureLock();
        return;
      }

      if (!isDrawingRef.current) {
        releaseDrawGestureLock();
        return;
      }

      if (isErasingRef.current) {
        isDrawingRef.current = false;
        isErasingRef.current = false;
        erasedStrokeIdsRef.current.clear();
        pointsRef.current = [];
        lastRawPointRef.current = null;
        lastSmoothPointRef.current = null;
        lastDrawPointRef.current = null;
        releaseDrawGestureLock();
        return;
      }

      if (!activeStrokeRef.current) {
        releaseDrawGestureLock();
        return;
      }
      isDrawingRef.current = false;
      const finishedStroke = {
        ...activeStrokeRef.current,
        path: [...activeStrokeRef.current.path],
      };
      renderAll([...strokes, finishedStroke]);
      addStroke(finishedStroke);
      activeStrokeRef.current = null;
      pointsRef.current = [];
      lastRawPointRef.current = null;
      lastSmoothPointRef.current = null;
      lastDrawPointRef.current = null;
      releaseDrawGestureLock();
    },
    [
      addStroke,
      cancelActiveStroke,
      isViewportInteracting,
      markPenActivity,
      releaseDrawGestureLock,
      renderAll,
      shouldSuppressTouch,
      syncLaserPosition,
      strokes,
    ]
  );

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
      const { width, height } = getBoardSize(overviewViewportRatio);
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
  }, [overviewViewportRatio, renderAll]);

  useEffect(() => {
    renderAll();
  }, [renderAll]);

  useEffect(() => {
    if (isViewportInteracting) {
      cancelActiveStroke();
    }
  }, [cancelActiveStroke, isViewportInteracting]);

  useEffect(() => {
    if (activeTool !== "laser") {
      laserPointsRef.current = [];
      clearLaserCanvas();
      syncLaserPosition(null, { force: true });
    }
  }, [activeTool, clearLaserCanvas, syncLaserPosition]);

  useEffect(() => {
    if (!canPublishSyncedLaser || role !== "host") {
      syncLaserPosition(null, { force: true });
    }
  }, [canPublishSyncedLaser, role, syncLaserPosition]);

  useEffect(() => {
    const suppressedTouchPointerIds = suppressedTouchPointerIdsRef.current;
    return () => {
      if (laserRafRef.current !== null) {
        cancelAnimationFrame(laserRafRef.current);
      }
      syncLaserPosition(null, { force: true });
      releaseDrawGestureLock();
      suppressedTouchPointerIds.clear();
      activePenPointerIdRef.current = null;
    };
  }, [releaseDrawGestureLock, syncLaserPosition]);

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

  return {
    canvasRef,
    laserCanvasRef,
    bind,
    renderAll,
  };
}
