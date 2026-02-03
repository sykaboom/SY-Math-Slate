"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import type {
  PointerEvent as ReactPointerEvent,
  RefObject,
  WheelEvent as ReactWheelEvent,
} from "react";

import { useUIStore } from "@features/store/useUIStore";

type Point = { x: number; y: number };

type PanState = {
  active: boolean;
  pointerId: number | null;
  startX: number;
  startY: number;
  originPan: Point;
};

type PinchState = {
  active: boolean;
  startDistance: number;
  startCenter: Point;
  startZoom: number;
  startPan: Point;
};

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const isEditableElement = (element: Element | null) => {
  if (!element) return false;
  if (element instanceof HTMLInputElement) return true;
  if (element instanceof HTMLTextAreaElement) return true;
  if (element instanceof HTMLSelectElement) return true;
  if (element instanceof HTMLElement && element.isContentEditable) return true;
  return false;
};

const getViewportRect = (container: HTMLElement | null) => {
  if (!container) return null;
  const viewport = container.querySelector<HTMLElement>("[data-page-viewport]");
  if (!viewport) return null;
  return viewport.getBoundingClientRect();
};

const getViewportPoint = (
  container: HTMLElement | null,
  clientX: number,
  clientY: number
): Point => {
  const rect = getViewportRect(container);
  if (!rect) return { x: clientX, y: clientY };
  const x = clamp(clientX - rect.left, 0, rect.width);
  const y = clamp(clientY - rect.top, 0, rect.height);
  return { x, y };
};

const getTouchDistance = (touches: TouchList) => {
  if (touches.length < 2) return 0;
  const a = touches[0];
  const b = touches[1];
  return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
};

const getTouchCenter = (touches: TouchList, container: HTMLElement | null) => {
  const a = touches[0];
  const b = touches[1];
  const x = (a.clientX + b.clientX) / 2;
  const y = (a.clientY + b.clientY) / 2;
  return getViewportPoint(container, x, y);
};

export function useViewportInteraction(
  containerRef: RefObject<HTMLDivElement | null>
) {
  const spacePressedRef = useRef(false);
  const panStateRef = useRef<PanState>({
    active: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    originPan: { x: 0, y: 0 },
  });
  const pinchStateRef = useRef<PinchState>({
    active: false,
    startDistance: 0,
    startCenter: { x: 0, y: 0 },
    startZoom: 1,
    startPan: { x: 0, y: 0 },
  });

  const setViewportZoom = useUIStore((state) => state.setViewportZoom);
  const setViewportPan = useUIStore((state) => state.setViewportPan);
  const setViewportInteracting = useUIStore(
    (state) => state.setViewportInteracting
  );

  const cancelPointerPan = useCallback(() => {
    const panState = panStateRef.current;
    if (!panState.active) return;
    const container = containerRef.current;
    if (
      container &&
      panState.pointerId !== null &&
      container.hasPointerCapture?.(panState.pointerId)
    ) {
      container.releasePointerCapture(panState.pointerId);
    }
    panStateRef.current = {
      active: false,
      pointerId: null,
      startX: 0,
      startY: 0,
      originPan: { x: 0, y: 0 },
    };
    if (!pinchStateRef.current.active) {
      setViewportInteracting(false);
    }
  }, [containerRef, setViewportInteracting]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Space") return;
      if (isEditableElement(document.activeElement)) return;
      spacePressedRef.current = true;
      event.preventDefault();
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code !== "Space") return;
      spacePressedRef.current = false;
    };

    const handleBlur = () => {
      spacePressedRef.current = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length < 2) return;
      const distance = getTouchDistance(event.touches);
      if (distance <= 0) return;
      const { viewport } = useUIStore.getState();
      pinchStateRef.current = {
        active: true,
        startDistance: distance,
        startCenter: getTouchCenter(event.touches, container),
        startZoom: viewport.zoomLevel,
        startPan: { ...viewport.panOffset },
      };
      setViewportInteracting(true);
      cancelPointerPan();
      event.preventDefault();
      event.stopPropagation();
    };

    const handleTouchMove = (event: TouchEvent) => {
      const pinchState = pinchStateRef.current;
      if (!pinchState.active || event.touches.length < 2) return;
      const distance = getTouchDistance(event.touches);
      if (distance <= 0) return;
      const nextZoom = clamp(
        pinchState.startZoom * (distance / pinchState.startDistance),
        MIN_ZOOM,
        MAX_ZOOM
      );
      const scaleRatio = nextZoom / pinchState.startZoom;
      const center = getTouchCenter(event.touches, container);
      const nextPan = {
        x:
          center.x -
          scaleRatio * (pinchState.startCenter.x - pinchState.startPan.x),
        y:
          center.y -
          scaleRatio * (pinchState.startCenter.y - pinchState.startPan.y),
      };
      setViewportZoom(nextZoom);
      setViewportPan(nextPan.x, nextPan.y);
      event.preventDefault();
      event.stopPropagation();
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (!pinchStateRef.current.active) return;
      if (event.touches.length >= 2) return;
      pinchStateRef.current.active = false;
      if (!panStateRef.current.active) {
        setViewportInteracting(false);
      }
    };

    container.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd);
    container.addEventListener("touchcancel", handleTouchEnd);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [
    cancelPointerPan,
    containerRef,
    setViewportInteracting,
    setViewportPan,
    setViewportZoom,
  ]);

  const handlePointerDownCapture = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const state = useUIStore.getState();
      const isMiddleButton = event.button === 1;
      const isSpacePan =
        spacePressedRef.current && !isEditableElement(document.activeElement);
      const isHandPan = state.activeTool === "hand";
      if (!isMiddleButton && !isSpacePan && !isHandPan) return;
      if (pinchStateRef.current.active) return;
      if (event.pointerType === "mouse" && !isMiddleButton && event.button !== 0) {
        return;
      }

      panStateRef.current = {
        active: true,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        originPan: { ...state.viewport.panOffset },
      };
      setViewportInteracting(true);
      event.currentTarget.setPointerCapture(event.pointerId);
      event.preventDefault();
      event.stopPropagation();
    },
    [setViewportInteracting]
  );

  const handlePointerMoveCapture = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const panState = panStateRef.current;
      if (!panState.active || panState.pointerId !== event.pointerId) return;
      const dx = event.clientX - panState.startX;
      const dy = event.clientY - panState.startY;
      setViewportPan(panState.originPan.x + dx, panState.originPan.y + dy);
      event.preventDefault();
      event.stopPropagation();
    },
    [setViewportPan]
  );

  const handlePointerUpCapture = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const panState = panStateRef.current;
      if (!panState.active || panState.pointerId !== event.pointerId) return;
      panStateRef.current = {
        active: false,
        pointerId: null,
        startX: 0,
        startY: 0,
        originPan: { x: 0, y: 0 },
      };
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      if (!pinchStateRef.current.active) {
        setViewportInteracting(false);
      }
      event.preventDefault();
      event.stopPropagation();
    },
    [setViewportInteracting]
  );

  const handleWheel = useCallback(
    (event: ReactWheelEvent<HTMLDivElement>) => {
      const container = containerRef.current;
      if (!container || event.deltaY === 0) return;
      event.preventDefault();

      const { viewport } = useUIStore.getState();
      const intensity = event.ctrlKey ? 0.008 : 0.002;
      const zoomFactor = Math.exp(-event.deltaY * intensity);
      const nextZoom = clamp(
        viewport.zoomLevel * zoomFactor,
        MIN_ZOOM,
        MAX_ZOOM
      );
      if (Math.abs(nextZoom - viewport.zoomLevel) < 0.0001) return;

      const anchor = getViewportPoint(container, event.clientX, event.clientY);
      const scaleRatio = nextZoom / viewport.zoomLevel;
      const nextPan = {
        x: anchor.x - scaleRatio * (anchor.x - viewport.panOffset.x),
        y: anchor.y - scaleRatio * (anchor.y - viewport.panOffset.y),
      };

      setViewportZoom(nextZoom);
      setViewportPan(nextPan.x, nextPan.y);
    },
    [containerRef, setViewportPan, setViewportZoom]
  );

  return useMemo(
    () => ({
      onWheel: handleWheel,
      onPointerDownCapture: handlePointerDownCapture,
      onPointerMoveCapture: handlePointerMoveCapture,
      onPointerUpCapture: handlePointerUpCapture,
      onPointerCancelCapture: handlePointerUpCapture,
      onPointerLeaveCapture: handlePointerUpCapture,
    }),
    [
      handlePointerDownCapture,
      handlePointerMoveCapture,
      handlePointerUpCapture,
      handleWheel,
    ]
  );
}
