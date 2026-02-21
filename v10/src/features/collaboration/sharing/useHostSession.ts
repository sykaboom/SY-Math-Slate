"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { PersistedCanvasV2 } from "@core/foundation/types/canvas";
import type { LiveSessionMeta } from "@core/foundation/types/snapshot";
import { useCanvasStore } from "@features/platform/store/useCanvasStore";

import {
  createLiveBroadcastTransport,
  type BroadcastEnvelope,
  type LiveBroadcastConnectionState,
  type LiveBroadcastTransport,
} from "./transport/LiveBroadcastTransport";

export type UseHostSessionOptions = {
  shareId: string | null;
  hostActorId: string;
  liveSession?: LiveSessionMeta;
  enabled?: boolean;
};

export type HostSessionState = {
  connectionState: LiveBroadcastConnectionState;
  publishSnapshot: () => boolean;
  endSession: () => void;
};

const createOpId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `op-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const normalizeCanvasVersion = (value: unknown): 2 | 2.1 => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value >= 2.1 ? 2.1 : 2;
  }
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) {
      return parsed >= 2.1 ? 2.1 : 2;
    }
  }
  return 2;
};

const normalizeStep = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.floor(value));
};

const toPersistedCanvas = (
  state: ReturnType<typeof useCanvasStore.getState>
): PersistedCanvasV2 => {
  return {
    version: normalizeCanvasVersion(state.version),
    pages: state.pages,
    pageOrder: state.pageOrder,
    currentPageId: state.currentPageId,
    currentStep: normalizeStep(state.currentStep),
    pageColumnCounts: state.pageColumnCounts,
    stepBlocks: state.stepBlocks,
    anchorMap: state.anchorMap,
    audioByStep: state.audioByStep,
    animationModInput: state.animationModInput,
  };
};

const toCanvasSignature = (canvas: PersistedCanvasV2): string => {
  return JSON.stringify(canvas);
};

const createEnvelope = (
  shareId: string,
  actorId: string,
  baseVersion: number,
  payload: BroadcastEnvelope["payload"]
): BroadcastEnvelope => {
  return {
    op_id: createOpId(),
    actor_id: actorId,
    canvas_id: shareId,
    base_version: baseVersion,
    timestamp: Date.now(),
    payload,
  };
};

export const useHostSession = (options: UseHostSessionOptions): HostSessionState => {
  const [connectionState, setConnectionState] =
    useState<LiveBroadcastConnectionState>("idle");
  const transportRef = useRef<LiveBroadcastTransport | null>(null);

  const publishSnapshot = useCallback((): boolean => {
    if (!options.shareId) return false;
    const transport = transportRef.current;
    if (!transport) return false;

    const canvas = toPersistedCanvas(useCanvasStore.getState());
    const envelope = createEnvelope(
      options.shareId,
      options.hostActorId,
      normalizeCanvasVersion(canvas.version),
      {
        type: "snapshot",
        canvas,
      }
    );

    return transport.publish(envelope);
  }, [options.hostActorId, options.shareId]);

  const endSession = useCallback(() => {
    const transport = transportRef.current;
    if (!transport || !options.shareId) return;

    const envelope = createEnvelope(options.shareId, options.hostActorId, 0, {
      type: "session_end",
    });
    transport.publish(envelope);
    transport.close();
    transportRef.current = null;
  }, [options.hostActorId, options.shareId]);

  useEffect(() => {
    const shouldEnable =
      options.enabled !== false &&
      Boolean(options.shareId) &&
      Boolean(options.liveSession?.enabled) &&
      Boolean(options.liveSession?.relayUrl);

    if (!shouldEnable || !options.shareId || !options.liveSession?.relayUrl) {
      transportRef.current?.close();
      transportRef.current = null;
      void Promise.resolve().then(() => {
        setConnectionState("idle");
      });
      return;
    }

    const activeShareId = options.shareId;

    const transport = createLiveBroadcastTransport({
      shareId: activeShareId,
      endpoint: options.liveSession.relayUrl,
    });
    transportRef.current = transport;

    const unsubscribeState = transport.subscribeState((nextState) => {
      setConnectionState(nextState);
    });

    transport.connect();

    const initialCanvas = toPersistedCanvas(useCanvasStore.getState());
    let previousSignature = toCanvasSignature(initialCanvas);
    let previousStep = initialCanvas.currentStep;

    transport.publish(
      createEnvelope(
        activeShareId,
        options.hostActorId,
        normalizeCanvasVersion(initialCanvas.version),
        {
          type: "snapshot",
          canvas: initialCanvas,
        }
      )
    );

    const unsubscribeCanvas = useCanvasStore.subscribe((state) => {
      const canvas = toPersistedCanvas(state);
      const canvasSignature = toCanvasSignature(canvas);

      if (canvasSignature !== previousSignature) {
        previousSignature = canvasSignature;
        transport.publish(
          createEnvelope(
            activeShareId,
            options.hostActorId,
            normalizeCanvasVersion(canvas.version),
            {
              type: "snapshot",
              canvas,
            }
          )
        );
      }

      if (canvas.currentStep !== previousStep) {
        previousStep = canvas.currentStep;
        transport.publish(
          createEnvelope(
            activeShareId,
            options.hostActorId,
            normalizeCanvasVersion(canvas.version),
            {
              type: "step_change",
              step: canvas.currentStep,
            }
          )
        );
      }
    });

    return () => {
      unsubscribeCanvas();
      transport.publish(
        createEnvelope(activeShareId, options.hostActorId, 0, {
          type: "session_end",
        })
      );
      transport.close();
      unsubscribeState();
      if (transportRef.current === transport) {
        transportRef.current = null;
      }
    };
  }, [
    options.enabled,
    options.hostActorId,
    options.liveSession?.enabled,
    options.liveSession?.relayUrl,
    options.shareId,
  ]);

  return {
    connectionState,
    publishSnapshot,
    endSession,
  };
};
