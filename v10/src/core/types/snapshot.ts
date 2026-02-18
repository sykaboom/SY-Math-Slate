import type { PersistedCanvasV2 } from "@core/types/canvas";
import type { SessionPolicy } from "@core/types/sessionPolicy";

export type SnapshotScope = "full_canvas" | "selected_layer" | "viewport_only";

export type LiveSessionMeta = {
  enabled: boolean;
  transport: "websocket";
  channelId: string;
  relayUrl: string | null;
};

export type CanvasSnapshot = {
  schemaVersion: "1";
  shareId: string;
  title?: string;
  createdAt: number;
  isPublic: boolean;
  hostActorId: string;
  canvasVersion: number;
  scope: SnapshotScope;
  layerIds?: string[];
  objectIds?: string[];
  /** @deprecated Legacy single-layer selector. Use `layerIds` instead. */
  layerId?: string;
  canvas: PersistedCanvasV2;
  liveSession?: LiveSessionMeta;
  sessionPolicy?: SessionPolicy;
};

export type ShareSessionMeta = {
  shareId: string;
  isPublic: boolean;
  createdAt: number;
  viewerUrl: string;
  liveSession?: LiveSessionMeta;
};
