"use client";

import { useEffect, useMemo, useState } from "react";

import type { PersistedCanvasV2, PersistedSlateDoc } from "@core/types/canvas";
import type { CanvasSnapshot } from "@core/types/snapshot";
import { LocalSnapshotAdapter } from "@features/sharing/adapters/LocalSnapshotAdapter";
import { ServerSnapshotAdapter } from "@features/sharing/adapters/ServerSnapshotAdapter";
import { useCanvasStore } from "@features/store/useCanvasStore";
import { useDocStore } from "@features/store/useDocStore";
import { useUIStore } from "@features/store/useUIStoreBridge";

import { useViewerLiveSession, type ViewerLiveSessionState } from "./useViewerLiveSession";

export type ViewerSessionStatus = "loading" | "ready" | "not_found" | "error";

export type ViewerSessionSource = "server" | "local" | null;

export type ViewerSessionState = {
  status: ViewerSessionStatus;
  snapshot: CanvasSnapshot | null;
  errorMessage: string | null;
  source: ViewerSessionSource;
  liveSession: ViewerLiveSessionState | null;
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

const normalizeStep = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.floor(value));
};

const resolveInitialSession = (shareId: string | null): ViewerSessionState => {
  if (!shareId) {
    return {
      status: "not_found",
      snapshot: null,
      errorMessage: "Missing share id.",
      source: null,
      liveSession: null,
    };
  }

  return {
    status: "loading",
    snapshot: null,
    errorMessage: null,
    source: null,
    liveSession: null,
  };
};

export const useViewerSession = (shareId: string | null): ViewerSessionState => {
  const localAdapter = useMemo(() => new LocalSnapshotAdapter(), []);
  const serverAdapter = useMemo(() => new ServerSnapshotAdapter(), []);

  const [session, setSession] = useState<ViewerSessionState>(() =>
    resolveInitialSession(shareId)
  );

  useEffect(() => {
    if (!shareId) {
      return;
    }

    let cancelled = false;

    const resolve = async () => {
      await Promise.resolve();
      if (cancelled) return;

      setSession({
        status: "loading",
        snapshot: null,
        errorMessage: null,
        source: null,
        liveSession: null,
      });

      const serverResult = await Promise.resolve(
        serverAdapter.loadSnapshot({ shareId })
      );
      if (cancelled) return;

      if (serverResult.ok) {
        setSession({
          status: "ready",
          snapshot: serverResult.snapshot,
          errorMessage: null,
          source: serverResult.source,
          liveSession: null,
        });
        return;
      }

      const localResult = await Promise.resolve(localAdapter.loadSnapshot({ shareId }));
      if (cancelled) return;

      if (localResult.ok) {
        setSession({
          status: "ready",
          snapshot: localResult.snapshot,
          errorMessage: null,
          source: localResult.source,
          liveSession: null,
        });
        return;
      }

      if (serverResult.notFound && localResult.notFound) {
        setSession({
          status: "not_found",
          snapshot: null,
          errorMessage: "Snapshot not found.",
          source: null,
          liveSession: null,
        });
        return;
      }

      setSession({
        status: "error",
        snapshot: null,
        errorMessage: serverResult.error,
        source: null,
        liveSession: null,
      });
    };

    void resolve();

    return () => {
      cancelled = true;
    };
  }, [localAdapter, serverAdapter, shareId]);

  useEffect(() => {
    if (session.status !== "ready" || !session.snapshot) return;

    const snapshot = session.snapshot;
    const persistedDoc = toPersistedDoc(snapshot.canvas);
    useDocStore.getState().hydrateDoc(persistedDoc);
    useCanvasStore.getState().hydrate(persistedDoc);
    useCanvasStore.setState((canvasState) => ({
      currentStep: normalizeStep(snapshot.canvas.currentStep),
      currentPageId:
        snapshot.canvas.currentPageId in canvasState.pages
          ? snapshot.canvas.currentPageId
          : canvasState.currentPageId,
    }));

    const uiState = useUIStore.getState();
    uiState.setViewMode("presentation");
    if (uiState.isOverviewMode) {
      uiState.toggleOverviewMode();
    }
    uiState.resetViewport();
  }, [session.snapshot, session.status]);

  const liveSession = useViewerLiveSession({
    shareId: session.status === "ready" ? session.snapshot?.shareId ?? null : null,
    liveSession: session.status === "ready" ? session.snapshot?.liveSession : undefined,
    enabled: session.status === "ready" && session.source === "server",
  });

  if (!shareId) {
    return {
      status: "not_found",
      snapshot: null,
      errorMessage: "Missing share id.",
      source: null,
      liveSession,
    };
  }

  return {
    ...session,
    liveSession,
  };
};
