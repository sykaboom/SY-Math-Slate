import type { PersistedCanvasV2 } from "@core/types/canvas";
import type {
  CanvasSnapshot,
  LiveSessionMeta,
  ShareSessionMeta,
} from "@core/types/snapshot";

export type SnapshotSource = "local" | "server";

export type MaybePromise<T> = T | Promise<T>;

export type SaveSnapshotInput = {
  snapshot: CanvasSnapshot;
  meta: ShareSessionMeta;
  ttlSeconds?: number;
};

export type SaveSnapshotResult =
  | {
      ok: true;
      snapshot: CanvasSnapshot;
      meta: ShareSessionMeta;
      source: SnapshotSource;
    }
  | {
      ok: false;
      error: string;
    };

export type LoadSnapshotInput = {
  shareId: string;
};

export type LoadSnapshotResult =
  | {
      ok: true;
      snapshot: CanvasSnapshot;
      source: SnapshotSource;
    }
  | {
      ok: false;
      error: string;
      notFound?: boolean;
    };

export interface SnapshotAdapterInterface {
  saveSnapshot(input: SaveSnapshotInput): MaybePromise<SaveSnapshotResult>;
  loadSnapshot(input: LoadSnapshotInput): MaybePromise<LoadSnapshotResult>;
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const isFiniteNumber = (value: unknown): value is number => {
  return typeof value === "number" && Number.isFinite(value);
};

const isSnapshotScope = (
  value: unknown
): value is CanvasSnapshot["scope"] => {
  return (
    value === "full_canvas" ||
    value === "selected_layer" ||
    value === "viewport_only"
  );
};

const isPersistedCanvas = (value: unknown): value is PersistedCanvasV2 => {
  if (!isRecord(value)) return false;
  if (!isFiniteNumber(value.version)) return false;
  if (!isRecord(value.pages)) return false;
  if (!Array.isArray(value.pageOrder)) return false;
  if (!value.pageOrder.every((entry) => typeof entry === "string")) return false;
  if (typeof value.currentPageId !== "string" || value.currentPageId.length === 0) {
    return false;
  }
  if (!isFiniteNumber(value.currentStep)) return false;
  if (!isRecord(value.pageColumnCounts)) return false;
  if (!Array.isArray(value.stepBlocks)) return false;
  if (!(value.anchorMap === null || isRecord(value.anchorMap))) return false;
  if (!isRecord(value.audioByStep)) return false;
  if (!(value.animationModInput === null || isRecord(value.animationModInput))) {
    return false;
  }
  return true;
};

export const toLiveSessionMeta = (value: unknown): LiveSessionMeta | undefined => {
  if (!isRecord(value)) return undefined;
  if (typeof value.enabled !== "boolean") return undefined;
  if (value.transport !== "websocket") return undefined;
  if (typeof value.channelId !== "string" || value.channelId.length === 0) {
    return undefined;
  }
  if (!(typeof value.relayUrl === "string" || value.relayUrl === null)) {
    return undefined;
  }

  return {
    enabled: value.enabled,
    transport: value.transport,
    channelId: value.channelId,
    relayUrl: value.relayUrl,
  };
};

export const toCanvasSnapshot = (value: unknown): CanvasSnapshot | null => {
  if (!isRecord(value)) return null;
  if (value.schemaVersion !== "1") return null;
  if (typeof value.shareId !== "string" || value.shareId.length === 0) return null;
  if (!isFiniteNumber(value.createdAt)) return null;
  if (typeof value.isPublic !== "boolean") return null;
  if (typeof value.hostActorId !== "string" || value.hostActorId.length === 0) {
    return null;
  }
  if (!isFiniteNumber(value.canvasVersion)) return null;
  if (!isSnapshotScope(value.scope)) return null;
  if (!isPersistedCanvas(value.canvas)) return null;
  if (value.title !== undefined && typeof value.title !== "string") return null;
  if (value.layerId !== undefined && typeof value.layerId !== "string") return null;

  const liveSession = toLiveSessionMeta(value.liveSession);
  const snapshot: CanvasSnapshot = {
    schemaVersion: "1",
    shareId: value.shareId,
    title: value.title,
    createdAt: value.createdAt,
    isPublic: value.isPublic,
    hostActorId: value.hostActorId,
    canvasVersion: value.canvasVersion,
    scope: value.scope,
    layerId: value.layerId,
    canvas: value.canvas,
    ...(liveSession ? { liveSession } : {}),
  };

  return snapshot;
};

export const toShareSessionMeta = (value: unknown): ShareSessionMeta | null => {
  if (!isRecord(value)) return null;
  if (typeof value.shareId !== "string" || value.shareId.length === 0) return null;
  if (typeof value.isPublic !== "boolean") return null;
  if (!isFiniteNumber(value.createdAt)) return null;
  if (typeof value.viewerUrl !== "string" || value.viewerUrl.length === 0) return null;

  const liveSession = toLiveSessionMeta(value.liveSession);

  return {
    shareId: value.shareId,
    isPublic: value.isPublic,
    createdAt: value.createdAt,
    viewerUrl: value.viewerUrl,
    ...(liveSession ? { liveSession } : {}),
  };
};

export const isRecordValue = isRecord;
