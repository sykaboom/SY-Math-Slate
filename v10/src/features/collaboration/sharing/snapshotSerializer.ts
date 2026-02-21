import type { AnchorPosition, CanvasItem, PersistedCanvasV2 } from "@core/foundation/types/canvas";
import type {
  CanvasSnapshot,
  ShareSessionMeta,
  SnapshotScope,
} from "@core/foundation/types/snapshot";

export const SNAPSHOT_SCHEMA_VERSION = "1";
export const SHARE_STORAGE_PREFIX = "sy_share:";
export const SHARE_INDEX_KEY = "sy_share_index";

export type SnapshotViewportBounds = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

export type ApplySnapshotScopeOptions = {
  scope: SnapshotScope;
  layerIds?: string[];
  layerId?: string;
  viewportBounds?: SnapshotViewportBounds | null;
};

type ItemBounds = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

const DEFAULT_TEXT_BOUNDS = { width: 360, height: 180 };
const DEFAULT_POINT_RADIUS = 32;

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const isFiniteNumber = (value: unknown): value is number => {
  return typeof value === "number" && Number.isFinite(value);
};

const isStringArray = (value: unknown): value is string[] => {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string");
};

const isSnapshotScope = (value: unknown): value is SnapshotScope => {
  return (
    value === "full_canvas" ||
    value === "selected_layer" ||
    value === "viewport_only"
  );
};

const hasCanvasCoreShape = (value: unknown): value is PersistedCanvasV2 => {
  if (!isRecord(value)) return false;
  if (!isFiniteNumber(value.version)) return false;
  if (!isRecord(value.pages)) return false;
  if (!Array.isArray(value.pageOrder)) return false;
  if (!value.pageOrder.every((entry) => typeof entry === "string")) return false;
  if (typeof value.currentPageId !== "string" || value.currentPageId.length === 0) {
    return false;
  }
  if (!isFiniteNumber(value.currentStep)) return false;
  return true;
};

const normalizeStringList = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  const next: string[] = [];
  const seen = new Set<string>();
  for (const entry of value) {
    if (typeof entry !== "string") continue;
    const trimmed = entry.trim();
    if (trimmed.length === 0) continue;
    if (seen.has(trimmed)) continue;
    seen.add(trimmed);
    next.push(trimmed);
  }
  return next;
};

const normalizeLegacyLayerId = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const normalizeSnapshotScope = (value: SnapshotScope): SnapshotScope => {
  if (value === "selected_layer" || value === "viewport_only") return value;
  return "full_canvas";
};

const buildBounds = (
  left: number,
  top: number,
  right: number,
  bottom: number
): ItemBounds | null => {
  if (
    !Number.isFinite(left) ||
    !Number.isFinite(top) ||
    !Number.isFinite(right) ||
    !Number.isFinite(bottom)
  ) {
    return null;
  }
  if (right <= left || bottom <= top) return null;
  return { left, top, right, bottom };
};

const normalizeBounds = (
  bounds: SnapshotViewportBounds | null | undefined
): ItemBounds | null => {
  if (!bounds) return null;
  return buildBounds(bounds.left, bounds.top, bounds.right, bounds.bottom);
};

const boundsIntersect = (a: ItemBounds, b: ItemBounds): boolean => {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
};

const getFlowStepIndex = (item: CanvasItem): number | null => {
  if (item.type !== "text" && item.type !== "image") return null;
  const mode = item.layoutMode ?? "flow";
  if (mode !== "flow") return null;
  const raw = typeof item.stepIndex === "number" ? item.stepIndex : 0;
  if (!Number.isFinite(raw)) return 0;
  return Math.max(0, Math.floor(raw));
};

const getMaxStep = (
  pages: Record<string, CanvasItem[]>,
  stepBlocks: PersistedCanvasV2["stepBlocks"]
): number => {
  if (Array.isArray(stepBlocks) && stepBlocks.length > 0) {
    return stepBlocks.length - 1;
  }

  return Object.values(pages).reduce((outerMax, items) => {
    return items.reduce((innerMax, item) => {
      const stepIndex = getFlowStepIndex(item);
      if (stepIndex === null) return innerMax;
      return Math.max(innerMax, stepIndex);
    }, outerMax);
  }, -1);
};

const normalizeStep = (
  currentStep: number,
  pages: Record<string, CanvasItem[]>,
  stepBlocks: PersistedCanvasV2["stepBlocks"]
): number => {
  const maxStep = getMaxStep(pages, stepBlocks);
  const limit = Math.max(0, maxStep + 1);
  if (!Number.isFinite(currentStep)) return 0;
  return Math.max(0, Math.min(Math.floor(currentStep), limit));
};

const resolveScopedPageOrder = (
  canvas: PersistedCanvasV2,
  requestedLayerIds: string[]
): string[] => {
  if (requestedLayerIds.length === 0) return [];
  const available = new Set(Object.keys(canvas.pages));
  const requested = requestedLayerIds.filter((layerId) => available.has(layerId));
  if (requested.length === 0) return [];

  const requestedSet = new Set(requested);
  const ordered = canvas.pageOrder.filter((pageId) => requestedSet.has(pageId));
  if (ordered.length > 0) return ordered;
  return requested;
};

const clonePageColumnCounts = (
  canvas: PersistedCanvasV2,
  pageOrder: string[]
): PersistedCanvasV2["pageColumnCounts"] => {
  const source = canvas.pageColumnCounts;
  if (!source) return undefined;

  const next: Record<string, number> = {};
  for (const pageId of pageOrder) {
    const value = source[pageId];
    if (typeof value === "number" && Number.isFinite(value)) {
      next[pageId] = value;
    }
  }
  return next;
};

const cloneAnchorMapForPages = (
  canvas: PersistedCanvasV2,
  pageOrder: string[]
): PersistedCanvasV2["anchorMap"] => {
  const source = canvas.anchorMap;
  if (source === null) return null;
  if (!source) return undefined;

  const next: NonNullable<PersistedCanvasV2["anchorMap"]> = {};
  for (const pageId of pageOrder) {
    const pageAnchors = source[pageId];
    if (!pageAnchors) continue;
    next[pageId] = pageAnchors;
  }
  return next;
};

const resolveSnapshotCurrentPageId = (
  canvas: PersistedCanvasV2,
  pageOrder: string[]
): string => {
  if (pageOrder.length === 0) return canvas.currentPageId;
  if (pageOrder.includes(canvas.currentPageId)) return canvas.currentPageId;
  return pageOrder[0];
};

const collectSegmentBoundsByPage = (
  anchorMap: PersistedCanvasV2["anchorMap"],
  pageId: string
): Map<string, ItemBounds> => {
  const next = new Map<string, ItemBounds>();
  if (!anchorMap || !anchorMap[pageId]) return next;

  const pageAnchors = anchorMap[pageId];
  for (const anchors of Object.values(pageAnchors)) {
    for (const anchor of anchors) {
      const bounds = buildBounds(
        anchor.x,
        anchor.y,
        anchor.x + anchor.width,
        anchor.y + anchor.height
      );
      if (!bounds) continue;

      const existing = next.get(anchor.segmentId);
      if (!existing) {
        next.set(anchor.segmentId, bounds);
        continue;
      }

      next.set(anchor.segmentId, {
        left: Math.min(existing.left, bounds.left),
        top: Math.min(existing.top, bounds.top),
        right: Math.max(existing.right, bounds.right),
        bottom: Math.max(existing.bottom, bounds.bottom),
      });
    }
  }

  return next;
};

const getStrokeBounds = (item: CanvasItem): ItemBounds | null => {
  if (item.type !== "stroke") return null;
  const path = item.path ?? [];
  if (path.length === 0) {
    const radius = Math.max(DEFAULT_POINT_RADIUS, item.width || 0);
    return buildBounds(item.x - radius, item.y - radius, item.x + radius, item.y + radius);
  }

  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  for (const point of path) {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  }

  const padding = Math.max(2, (typeof item.width === "number" ? item.width : 0) / 2);
  return buildBounds(minX - padding, minY - padding, maxX + padding, maxY + padding);
};

const getTextBounds = (
  item: CanvasItem,
  segmentBoundsByPage: Map<string, ItemBounds>
): ItemBounds | null => {
  if (item.type !== "text") return null;

  const mode = item.layoutMode ?? "flow";
  if (mode !== "absolute") {
    if (item.segmentId && segmentBoundsByPage.has(item.segmentId)) {
      return segmentBoundsByPage.get(item.segmentId) ?? null;
    }
    return null;
  }

  const width = DEFAULT_TEXT_BOUNDS.width;
  const height = DEFAULT_TEXT_BOUNDS.height;
  return buildBounds(item.x, item.y, item.x + width, item.y + height);
};

const getImageBounds = (
  item: CanvasItem,
  segmentBoundsByPage: Map<string, ItemBounds>
): ItemBounds | null => {
  if (item.type !== "image") return null;

  const mode = item.layoutMode ?? "flow";
  if (mode !== "absolute") {
    if (item.segmentId && segmentBoundsByPage.has(item.segmentId)) {
      return segmentBoundsByPage.get(item.segmentId) ?? null;
    }
  }

  if (Number.isFinite(item.w) && Number.isFinite(item.h)) {
    return buildBounds(item.x, item.y, item.x + item.w, item.y + item.h);
  }

  return buildBounds(
    item.x - DEFAULT_POINT_RADIUS,
    item.y - DEFAULT_POINT_RADIUS,
    item.x + DEFAULT_POINT_RADIUS,
    item.y + DEFAULT_POINT_RADIUS
  );
};

const getDefaultPointBounds = (item: CanvasItem): ItemBounds => {
  return {
    left: item.x - DEFAULT_POINT_RADIUS,
    top: item.y - DEFAULT_POINT_RADIUS,
    right: item.x + DEFAULT_POINT_RADIUS,
    bottom: item.y + DEFAULT_POINT_RADIUS,
  };
};

const getItemBounds = (
  item: CanvasItem,
  segmentBoundsByPage: Map<string, ItemBounds>
): ItemBounds | null => {
  const strokeBounds = getStrokeBounds(item);
  if (strokeBounds) return strokeBounds;

  const textBounds = getTextBounds(item, segmentBoundsByPage);
  if (textBounds) return textBounds;

  const imageBounds = getImageBounds(item, segmentBoundsByPage);
  if (imageBounds) return imageBounds;

  if (
    item.type === "math" ||
    item.type === "unknown" ||
    (item.type === "text" && (item.layoutMode ?? "flow") === "absolute")
  ) {
    return getDefaultPointBounds(item);
  }

  return null;
};

const collectKeptSegmentIds = (items: CanvasItem[]): Set<string> => {
  const next = new Set<string>();
  for (const item of items) {
    if (!("segmentId" in item)) continue;
    const segmentId = item.segmentId;
    if (typeof segmentId !== "string" || segmentId.length === 0) continue;
    next.add(segmentId);
  }
  return next;
};

const filterAnchorMapForViewportPage = (
  anchorMap: PersistedCanvasV2["anchorMap"],
  pageId: string,
  keptSegmentIds: Set<string>
): PersistedCanvasV2["anchorMap"] => {
  if (anchorMap === null) return null;
  if (!anchorMap) return undefined;

  const pageAnchors = anchorMap[pageId];
  if (!pageAnchors) return {};

  const nextPageAnchors: Record<number, AnchorPosition[]> = {};
  for (const [stepKey, anchors] of Object.entries(pageAnchors)) {
    const stepIndex = Number.parseInt(stepKey, 10);
    if (!Number.isFinite(stepIndex)) continue;
    const filteredAnchors = anchors.filter((anchor) => {
      if (keptSegmentIds.size === 0) return false;
      return keptSegmentIds.has(anchor.segmentId);
    });
    if (filteredAnchors.length > 0) {
      nextPageAnchors[stepIndex] = filteredAnchors;
    }
  }

  if (Object.keys(nextPageAnchors).length === 0) {
    return {};
  }

  return {
    [pageId]: nextPageAnchors,
  };
};

const filterCanvasBySelectedLayers = (
  canvas: PersistedCanvasV2,
  layerIds: string[]
): PersistedCanvasV2 => {
  const pageOrder = resolveScopedPageOrder(canvas, layerIds);
  if (pageOrder.length === 0) return canvas;

  const pages: Record<string, CanvasItem[]> = {};
  for (const pageId of pageOrder) {
    pages[pageId] = canvas.pages[pageId] ?? [];
  }

  const currentPageId = resolveSnapshotCurrentPageId(canvas, pageOrder);

  return {
    ...canvas,
    pages,
    pageOrder,
    currentPageId,
    currentStep: normalizeStep(canvas.currentStep, pages, canvas.stepBlocks),
    pageColumnCounts: clonePageColumnCounts(canvas, pageOrder),
    anchorMap: cloneAnchorMapForPages(canvas, pageOrder),
  };
};

const filterCanvasByViewport = (
  canvas: PersistedCanvasV2,
  viewportBounds: SnapshotViewportBounds | null | undefined
): PersistedCanvasV2 => {
  const scopedBounds = normalizeBounds(viewportBounds);
  if (!scopedBounds) return canvas;

  const pageId =
    canvas.currentPageId in canvas.pages
      ? canvas.currentPageId
      : canvas.pageOrder[0] ?? Object.keys(canvas.pages)[0];
  if (!pageId) return canvas;

  const segmentBoundsByPage = collectSegmentBoundsByPage(canvas.anchorMap, pageId);
  const sourceItems = canvas.pages[pageId] ?? [];
  const items = sourceItems.filter((item) => {
    const bounds = getItemBounds(item, segmentBoundsByPage);
    if (!bounds) return true;
    return boundsIntersect(bounds, scopedBounds);
  });

  const pages = {
    [pageId]: items,
  };
  const pageOrder = [pageId];
  const keptSegmentIds = collectKeptSegmentIds(items);

  return {
    ...canvas,
    pages,
    pageOrder,
    currentPageId: pageId,
    currentStep: normalizeStep(canvas.currentStep, pages, canvas.stepBlocks),
    pageColumnCounts: clonePageColumnCounts(canvas, pageOrder),
    anchorMap: filterAnchorMapForViewportPage(canvas.anchorMap, pageId, keptSegmentIds),
  };
};

export const resolveSnapshotLayerIds = (value: {
  layerIds?: unknown;
  layerId?: unknown;
}): string[] => {
  const fromLayerIds = normalizeStringList(value.layerIds);
  if (fromLayerIds.length > 0) return fromLayerIds;
  const legacyLayerId = normalizeLegacyLayerId(value.layerId);
  return legacyLayerId ? [legacyLayerId] : [];
};

export const applySnapshotScopeToCanvas = (
  canvas: PersistedCanvasV2,
  options: ApplySnapshotScopeOptions
): PersistedCanvasV2 => {
  const normalizedScope = normalizeSnapshotScope(options.scope);
  if (normalizedScope === "full_canvas") return canvas;

  if (normalizedScope === "selected_layer") {
    const layerIds = resolveSnapshotLayerIds(options);
    if (layerIds.length === 0) return canvas;
    return filterCanvasBySelectedLayers(canvas, layerIds);
  }

  if (normalizedScope === "viewport_only") {
    return filterCanvasByViewport(canvas, options.viewportBounds);
  }

  return canvas;
};

const toSnapshot = (value: unknown): CanvasSnapshot | null => {
  if (!isRecord(value)) return null;

  if (value.schemaVersion !== SNAPSHOT_SCHEMA_VERSION) return null;
  if (typeof value.shareId !== "string" || value.shareId.length === 0) return null;
  if (!isFiniteNumber(value.createdAt)) return null;
  if (typeof value.isPublic !== "boolean") return null;
  if (typeof value.hostActorId !== "string" || value.hostActorId.length === 0) {
    return null;
  }
  if (!isFiniteNumber(value.canvasVersion)) return null;
  if (!isSnapshotScope(value.scope)) return null;
  if (!hasCanvasCoreShape(value.canvas)) return null;
  if (value.title !== undefined && typeof value.title !== "string") return null;

  const layerIds = resolveSnapshotLayerIds(value);
  if (value.layerIds !== undefined && !isStringArray(value.layerIds)) return null;
  if (value.objectIds !== undefined && !isStringArray(value.objectIds)) return null;

  const objectIds = normalizeStringList(value.objectIds);
  const legacyLayerId = normalizeLegacyLayerId(value.layerId);

  return {
    schemaVersion: SNAPSHOT_SCHEMA_VERSION,
    shareId: value.shareId,
    title: value.title,
    createdAt: value.createdAt,
    isPublic: value.isPublic,
    hostActorId: value.hostActorId,
    canvasVersion: value.canvasVersion,
    scope: value.scope,
    layerIds: layerIds.length > 0 ? layerIds : undefined,
    objectIds: objectIds.length > 0 ? objectIds : undefined,
    layerId: legacyLayerId ?? layerIds[0],
    canvas: value.canvas,
  };
};

const toShareSessionMeta = (value: unknown): ShareSessionMeta | null => {
  if (!isRecord(value)) return null;
  if (typeof value.shareId !== "string" || value.shareId.length === 0) return null;
  if (typeof value.isPublic !== "boolean") return null;
  if (!isFiniteNumber(value.createdAt)) return null;
  if (typeof value.viewerUrl !== "string" || value.viewerUrl.length === 0) return null;

  return {
    shareId: value.shareId,
    isPublic: value.isPublic,
    createdAt: value.createdAt,
    viewerUrl: value.viewerUrl,
  };
};

export const toShareStorageKey = (shareId: string): string => {
  return `${SHARE_STORAGE_PREFIX}${shareId}`;
};

export const serializeSnapshot = (snapshot: CanvasSnapshot): string => {
  return JSON.stringify(snapshot);
};

export const deserializeSnapshot = (raw: string): CanvasSnapshot | null => {
  try {
    return toSnapshot(JSON.parse(raw));
  } catch {
    return null;
  }
};

export const serializeShareIndex = (index: ShareSessionMeta[]): string => {
  return JSON.stringify(index);
};

export const deserializeShareIndex = (raw: string | null): ShareSessionMeta[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((entry) => toShareSessionMeta(entry))
      .filter((entry): entry is ShareSessionMeta => entry !== null);
  } catch {
    return [];
  }
};

export const upsertShareIndex = (
  index: ShareSessionMeta[],
  entry: ShareSessionMeta
): ShareSessionMeta[] => {
  const next = [entry, ...index.filter((current) => current.shareId !== entry.shareId)];
  next.sort((a, b) => b.createdAt - a.createdAt);
  return next;
};
