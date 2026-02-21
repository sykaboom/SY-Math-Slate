"use client";

import { useEffect, useState } from "react";

import type { PersistedCanvasV2, PersistedSlateDoc } from "@core/foundation/types/canvas";
import type { LiveSessionMeta } from "@core/foundation/types/snapshot";
import {
  createLiveBroadcastTransport,
  type BroadcastEnvelope,
  type LiveBroadcastConnectionState,
} from "@features/sharing/transport/LiveBroadcastTransport";
import { useCanvasStore } from "@features/store/useCanvasStore";
import { useDocStore } from "@features/store/useDocStore";

export type UseViewerLiveSessionOptions = {
  shareId: string | null;
  liveSession?: LiveSessionMeta;
  enabled?: boolean;
};

export type ViewerLiveSessionState = {
  connectionState: LiveBroadcastConnectionState;
  lastMessageAt: number | null;
  ended: boolean;
};

const normalizeStep = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.floor(value));
};

const toPersistedDoc = (canvas: PersistedCanvasV2): PersistedSlateDoc => {
  return {
    version: canvas.version,
    pages: canvas.pages,
    pageOrder: canvas.pageOrder,
    pageColumnCounts: canvas.pageColumnCounts,
    stepBlocks: canvas.stepBlocks,
    anchorMap: canvas.anchorMap,
    audioByStep: canvas.audioByStep,
    animationModInput: canvas.animationModInput,
  };
};

const applyCanvas = (canvas: PersistedCanvasV2) => {
  const persistedDoc = toPersistedDoc(canvas);
  useDocStore.getState().hydrateDoc(persistedDoc);
  useCanvasStore.getState().hydrate(persistedDoc);
  useCanvasStore.setState((canvasState) => ({
    currentStep: normalizeStep(canvas.currentStep),
    currentPageId:
      canvas.currentPageId in canvasState.pages
        ? canvas.currentPageId
        : canvasState.currentPageId,
  }));
};

const applyEnvelope = (envelope: BroadcastEnvelope) => {
  if (envelope.payload.type === "snapshot") {
    applyCanvas(envelope.payload.canvas);
    return;
  }

  if (envelope.payload.type === "step_change") {
    const nextStep = normalizeStep(envelope.payload.step);
    useCanvasStore.setState((state) => ({
      currentStep: nextStep,
      currentPageId: state.currentPageId,
    }));
  }
};

export const useViewerLiveSession = (
  options: UseViewerLiveSessionOptions
): ViewerLiveSessionState => {
  const [connectionState, setConnectionState] =
    useState<LiveBroadcastConnectionState>("idle");
  const [lastMessageAt, setLastMessageAt] = useState<number | null>(null);
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    const shouldEnable =
      options.enabled !== false &&
      Boolean(options.shareId) &&
      Boolean(options.liveSession?.enabled) &&
      Boolean(options.liveSession?.relayUrl);

    if (!shouldEnable || !options.shareId || !options.liveSession?.relayUrl) {
      void Promise.resolve().then(() => {
        setConnectionState("idle");
        setEnded(false);
      });
      return;
    }

    const transport = createLiveBroadcastTransport({
      shareId: options.shareId,
      endpoint: options.liveSession.relayUrl,
    });

    const unsubscribeState = transport.subscribeState((state) => {
      setConnectionState(state);
    });

    const unsubscribeEnvelope = transport.subscribe((envelope) => {
      if (envelope.canvas_id !== options.shareId) return;
      setLastMessageAt(envelope.timestamp);

      if (envelope.payload.type === "session_end") {
        setEnded(true);
        return;
      }

      applyEnvelope(envelope);
    });

    void Promise.resolve().then(() => {
      setEnded(false);
    });
    transport.connect();

    return () => {
      unsubscribeEnvelope();
      unsubscribeState();
      transport.close();
    };
  }, [
    options.enabled,
    options.liveSession?.enabled,
    options.liveSession?.relayUrl,
    options.shareId,
  ]);

  return {
    connectionState,
    lastMessageAt,
    ended,
  };
};
