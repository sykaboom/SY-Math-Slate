"use client";

import { useMemo, useRef, type CSSProperties, type PointerEvent, type ReactNode } from "react";

import { cn } from "@core/utils";
import ErrorBoundary from "@ui/components/ErrorBoundary";
import { useWindowRuntime } from "./useWindowRuntime";
import type {
  WindowRuntimeDelta,
  WindowRuntimeDisplayMode,
  WindowRuntimePanelContract,
  WindowRuntimePanelState,
  WindowRuntimePersistedState,
  WindowRuntimePoint,
  WindowRuntimeRect,
} from "./windowRuntime.types";

export type WindowHostPanelRenderContext = {
  panel: WindowRuntimePanelState;
  focus: () => void;
  reset: () => void;
  setOpen: (isOpen: boolean) => void;
  setDisplayMode: (displayMode: WindowRuntimeDisplayMode) => void;
  moveTo: (position: WindowRuntimePoint) => void;
  moveBy: (delta: WindowRuntimeDelta) => void;
};

export type WindowHostPanelModule = WindowRuntimePanelContract & {
  className?: string;
  render: (context: WindowHostPanelRenderContext) => ReactNode;
};

type DragSession = {
  panelId: string;
  pointerId: number;
  startPointer: WindowRuntimePoint;
  startPanelPosition: WindowRuntimePoint;
};

export type WindowHostProps = {
  panels: readonly WindowHostPanelModule[];
  clampBounds: WindowRuntimeRect;
  persistedState?: WindowRuntimePersistedState;
  onPersistedStateChange?: (nextState: WindowRuntimePersistedState) => void;
  className?: string;
  dockedContainerClassName?: string;
  windowLayerClassName?: string;
};

const shouldIgnorePointerEvent = (
  event: PointerEvent<HTMLDivElement>
): boolean => event.pointerType === "mouse" && event.button !== 0;

const WINDOW_HOST_DRAG_HANDLE_ATTRIBUTE = "data-window-host-drag-handle";
const PANEL_ERROR_FALLBACK_CLASSNAME =
  "h-full w-full rounded border border-[var(--theme-border-strong)] bg-[var(--theme-danger-soft)] px-2 py-1 text-xs text-[var(--theme-text)]";

const panelHasExplicitDragHandle = (panelNode: HTMLDivElement): boolean =>
  panelNode.querySelector(`[${WINDOW_HOST_DRAG_HANDLE_ATTRIBUTE}]`) !== null;

const isPointerEventOnDragHandle = (target: EventTarget | null): boolean => {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest(`[${WINDOW_HOST_DRAG_HANDLE_ATTRIBUTE}]`));
};

export function WindowHost({
  panels,
  clampBounds,
  persistedState,
  onPersistedStateChange,
  className,
  dockedContainerClassName,
  windowLayerClassName,
}: WindowHostProps) {
  const runtime = useWindowRuntime({
    panels,
    clampBounds,
    persistedState,
    onPersistedStateChange,
  });

  const panelModuleById = useMemo(() => {
    const map = new Map<string, WindowHostPanelModule>();
    for (const panel of panels) {
      if (!map.has(panel.panelId)) {
        map.set(panel.panelId, panel);
      }
    }
    return map;
  }, [panels]);

  const dragSessionRef = useRef<DragSession | null>(null);

  const endDragSession = (event: PointerEvent<HTMLDivElement>) => {
    const dragSession = dragSessionRef.current;
    if (!dragSession || dragSession.pointerId !== event.pointerId) return;
    dragSessionRef.current = null;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const renderContextFor = (
    panel: WindowRuntimePanelState
  ): WindowHostPanelRenderContext => ({
    panel,
    focus: () => runtime.focusPanel(panel.panelId),
    reset: () => runtime.resetPanel(panel.panelId),
    setOpen: (isOpen) => runtime.setPanelOpen(panel.panelId, isOpen),
    setDisplayMode: (displayMode) =>
      runtime.setPanelDisplayMode(panel.panelId, displayMode),
    moveTo: (position) => runtime.movePanelTo(panel.panelId, position),
    moveBy: (delta) => runtime.movePanelBy(panel.panelId, delta),
  });

  const dockedPanels = runtime.dockedPanels.filter((panel) => panel.isOpen);
  const windowedPanels = runtime.windowedPanels.filter((panel) => panel.isOpen);

  return (
    <section className={cn("relative h-full w-full", className)} data-window-host-root>
      {dockedPanels.length > 0 ? (
        <div
          className={cn("relative z-10 flex w-full flex-col gap-2", dockedContainerClassName)}
          data-window-host-layer="docked"
        >
          {dockedPanels.map((panel) => {
            const panelModule = panelModuleById.get(panel.panelId);
            if (!panelModule) return null;
            return (
              <div
                key={panel.panelId}
                className={cn("relative", panelModule.className)}
                data-window-host-panel-id={panel.panelId}
                data-window-host-display-mode={panel.displayMode}
                onPointerDown={() => runtime.focusPanel(panel.panelId)}
              >
                <ErrorBoundary
                  fallback={
                    <section role="alert" className={PANEL_ERROR_FALLBACK_CLASSNAME}>
                      Panel failed to render.
                    </section>
                  }
                >
                  {panelModule.render(renderContextFor(panel))}
                </ErrorBoundary>
              </div>
            );
          })}
        </div>
      ) : null}

      <div
        className={cn("pointer-events-none absolute inset-0 z-20", windowLayerClassName)}
        data-window-host-layer="windowed"
      >
        {windowedPanels.map((panel) => {
          const panelModule = panelModuleById.get(panel.panelId);
          if (!panelModule) return null;

          const panelStyle: CSSProperties = {
            position: "absolute",
            left: panel.position.x,
            top: panel.position.y,
            width: panel.size.width,
            height: panel.size.height,
            zIndex: panel.zIndex,
          };

          return (
            <div
              key={panel.panelId}
              className={cn("pointer-events-auto", panelModule.className)}
              style={panelStyle}
              data-window-host-panel-id={panel.panelId}
              data-window-host-display-mode={panel.displayMode}
              data-window-host-movable={panel.movable ? "true" : "false"}
              onPointerDown={(event) => {
                if (shouldIgnorePointerEvent(event)) return;

                runtime.focusPanel(panel.panelId);
                if (!panel.movable) return;
                if (
                  panelHasExplicitDragHandle(event.currentTarget) &&
                  !isPointerEventOnDragHandle(event.target)
                ) {
                  return;
                }

                dragSessionRef.current = {
                  panelId: panel.panelId,
                  pointerId: event.pointerId,
                  startPointer: { x: event.clientX, y: event.clientY },
                  startPanelPosition: {
                    x: panel.position.x,
                    y: panel.position.y,
                  },
                };
                event.currentTarget.setPointerCapture(event.pointerId);
              }}
              onPointerMove={(event) => {
                const dragSession = dragSessionRef.current;
                if (!dragSession) return;
                if (
                  dragSession.pointerId !== event.pointerId ||
                  dragSession.panelId !== panel.panelId
                ) {
                  return;
                }

                runtime.movePanelTo(panel.panelId, {
                  x:
                    dragSession.startPanelPosition.x +
                    (event.clientX - dragSession.startPointer.x),
                  y:
                    dragSession.startPanelPosition.y +
                    (event.clientY - dragSession.startPointer.y),
                });
              }}
              onPointerUp={endDragSession}
              onPointerCancel={endDragSession}
              onLostPointerCapture={endDragSession}
            >
              <ErrorBoundary
                fallback={
                  <section role="alert" className={PANEL_ERROR_FALLBACK_CLASSNAME}>
                    Panel failed to render.
                  </section>
                }
              >
                {panelModule.render(renderContextFor(panel))}
              </ErrorBoundary>
            </div>
          );
        })}
      </div>
    </section>
  );
}
