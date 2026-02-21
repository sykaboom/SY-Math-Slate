"use client";

import { useCallback, useMemo } from "react";

import { getBoardSize } from "@core/foundation/policies/boardSpec";
import type { PersistedCanvasV2 } from "@core/foundation/types/canvas";
import type {
  CanvasSnapshot,
  LiveSessionMeta,
  ShareSessionMeta,
  SnapshotScope,
} from "@core/foundation/types/snapshot";
import { useCanvasStore } from "@features/platform/store/useCanvasStore";
import { useDocStore } from "@features/platform/store/useDocStore";
import { useUIStore } from "@features/platform/store/useUIStoreBridge";

import { LocalSnapshotAdapter } from "./adapters/LocalSnapshotAdapter";
import { ServerSnapshotAdapter } from "./adapters/ServerSnapshotAdapter";
import {
  SNAPSHOT_SCHEMA_VERSION,
  applySnapshotScopeToCanvas,
  type SnapshotViewportBounds,
} from "./snapshotSerializer";

export type CreateSnapshotShareOptions = {
  isPublic: boolean;
  title?: string;
  scope?: SnapshotScope;
  layerIds?: string[];
  objectIds?: string[];
};

export type CreateSnapshotShareResult =
  | {
      ok: true;
      snapshot: CanvasSnapshot;
      meta: ShareSessionMeta;
      serverSaved: boolean;
    }
  | {
      ok: false;
      error: string;
    };

const createRandomId = (prefix: string): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const buildViewerPath = (shareId: string): string => `/view/${shareId}`;

const normalizeCanvasVersion = (version: unknown): number => {
  if (typeof version === "number" && Number.isFinite(version)) {
    return version;
  }
  if (typeof version === "string") {
    const parsed = Number.parseFloat(version);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 1;
};

const normalizeRelayUrl = (value: string | undefined): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const toLiveSessionMeta = (shareId: string): LiveSessionMeta | undefined => {
  const relayUrl = normalizeRelayUrl(process.env.NEXT_PUBLIC_SHARE_LIVE_WS_URL);
  if (!relayUrl) return undefined;

  return {
    enabled: true,
    transport: "websocket",
    channelId: shareId,
    relayUrl,
  };
};

const buildPersistedCanvasSnapshot = (): PersistedCanvasV2 => {
  const canvasState = useCanvasStore.getState();
  const docStore = useDocStore.getState();
  docStore.syncFromCanvas(canvasState);
  const docSnapshot = docStore.getDocSnapshot();

  return {
    ...docSnapshot,
    currentPageId: canvasState.currentPageId,
    currentStep: canvasState.currentStep,
  };
};

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

const normalizeStringList = (value: string[] | undefined): string[] => {
  if (!Array.isArray(value)) return [];
  const next: string[] = [];
  const seen = new Set<string>();
  for (const entry of value) {
    const trimmed = entry.trim();
    if (trimmed.length === 0 || seen.has(trimmed)) continue;
    seen.add(trimmed);
    next.push(trimmed);
  }
  return next;
};

const resolveViewportBounds = (): SnapshotViewportBounds | null => {
  if (typeof document === "undefined") return null;

  const viewportNode = document.querySelector<HTMLElement>("[data-page-viewport]");
  const boardNode = document.querySelector<HTMLElement>("[data-board-root]");
  if (!viewportNode || !boardNode) return null;

  const viewportRect = viewportNode.getBoundingClientRect();
  const boardRect = boardNode.getBoundingClientRect();
  if (
    viewportRect.width <= 0 ||
    viewportRect.height <= 0 ||
    boardRect.width <= 0 ||
    boardRect.height <= 0
  ) {
    return null;
  }

  const overlapLeft = Math.max(viewportRect.left, boardRect.left);
  const overlapTop = Math.max(viewportRect.top, boardRect.top);
  const overlapRight = Math.min(viewportRect.right, boardRect.right);
  const overlapBottom = Math.min(viewportRect.bottom, boardRect.bottom);
  if (overlapRight <= overlapLeft || overlapBottom <= overlapTop) {
    return null;
  }

  const ratio = useUIStore.getState().overviewViewportRatio;
  const boardSize = getBoardSize(ratio);
  const scaleX = boardSize.width / boardRect.width;
  const scaleY = boardSize.height / boardRect.height;

  return {
    left: clamp((overlapLeft - boardRect.left) * scaleX, 0, boardSize.width),
    top: clamp((overlapTop - boardRect.top) * scaleY, 0, boardSize.height),
    right: clamp((overlapRight - boardRect.left) * scaleX, 0, boardSize.width),
    bottom: clamp(
      (overlapBottom - boardRect.top) * scaleY,
      0,
      boardSize.height
    ),
  };
};

const resolveSnapshotScope = (
  requestedScope: SnapshotScope | undefined,
  layerIds: string[],
  viewportBounds: SnapshotViewportBounds | null
): SnapshotScope => {
  const scope = requestedScope ?? "full_canvas";

  if (scope === "selected_layer" && layerIds.length === 0) {
    return "full_canvas";
  }

  if (scope === "viewport_only" && !viewportBounds) {
    return "full_canvas";
  }

  return scope;
};

export const useSnapshotShare = () => {
  const localAdapter = useMemo(() => new LocalSnapshotAdapter(), []);
  const serverAdapter = useMemo(() => new ServerSnapshotAdapter(), []);

  const createSnapshotShare = useCallback(
    async (
      options: CreateSnapshotShareOptions
    ): Promise<CreateSnapshotShareResult> => {
      if (typeof window === "undefined") {
        return {
          ok: false,
          error: "Snapshot sharing is only available in the browser.",
        };
      }

      const createdAt = Date.now();
      const shareId = createRandomId("share");
      const viewerUrl = buildViewerPath(shareId);
      const liveSession = toLiveSessionMeta(shareId);

      const canvas = buildPersistedCanvasSnapshot();
      const layerIds = normalizeStringList(options.layerIds);
      const objectIds = normalizeStringList(options.objectIds);
      const viewportBounds =
        options.scope === "viewport_only" ? resolveViewportBounds() : null;
      const scope = resolveSnapshotScope(options.scope, layerIds, viewportBounds);
      const scopedCanvas = applySnapshotScopeToCanvas(canvas, {
        scope,
        layerIds,
        layerId: layerIds[0],
        viewportBounds,
      });
      const snapshot: CanvasSnapshot = {
        schemaVersion: SNAPSHOT_SCHEMA_VERSION,
        shareId,
        title: options.title,
        createdAt,
        isPublic: options.isPublic,
        hostActorId: createRandomId("actor"),
        canvasVersion: normalizeCanvasVersion(scopedCanvas.version),
        scope,
        layerIds: layerIds.length > 0 ? layerIds : undefined,
        objectIds: objectIds.length > 0 ? objectIds : undefined,
        layerId: layerIds[0],
        canvas: scopedCanvas,
        ...(liveSession ? { liveSession } : {}),
      };

      const meta: ShareSessionMeta = {
        shareId,
        isPublic: options.isPublic,
        createdAt,
        viewerUrl,
        ...(liveSession ? { liveSession } : {}),
      };

      const localResult = localAdapter.saveSnapshot({
        snapshot,
        meta,
      });

      if (!localResult.ok) {
        return {
          ok: false,
          error: localResult.error,
        };
      }

      const serverResult = await Promise.resolve(
        serverAdapter.saveSnapshot({
          snapshot,
          meta,
        })
      ).catch(() => {
        return {
          ok: false as const,
          error: "Failed to persist snapshot on server.",
        };
      });

      return {
        ok: true,
        snapshot: localResult.snapshot,
        meta: localResult.meta,
        serverSaved: serverResult.ok,
      };
    },
    [localAdapter, serverAdapter]
  );

  return {
    createSnapshotShare,
  };
};
