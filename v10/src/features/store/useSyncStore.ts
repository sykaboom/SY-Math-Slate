import { create } from "zustand";

import type { ToolResult } from "@core/contracts";

export type SharedViewportState = {
  zoomLevel: number;
  panOffset: { x: number; y: number };
};

export type QueueEntryStatus = "pending" | "approved" | "rejected";

export type PendingAIQueueEntry = {
  id: string;
  toolId: string;
  adapterId: string;
  payload: unknown;
  meta: Record<string, unknown> | null;
  toolResult: ToolResult<unknown> | null;
  createdAt: number;
  status: QueueEntryStatus;
};

export type PendingAIQueueInput = Omit<
  PendingAIQueueEntry,
  "createdAt" | "status"
> & {
  createdAt?: number;
};

interface SyncStoreState {
  globalStep: number;
  laserPosition: { x: number; y: number } | null;
  sharedViewport: SharedViewportState;
  pendingAIQueue: PendingAIQueueEntry[];
  setGlobalStep: (value: number) => void;
  setLaserPosition: (value: { x: number; y: number } | null) => void;
  setSharedViewport: (value: SharedViewportState) => void;
  getQueueEntry: (id: string) => PendingAIQueueEntry | null;
  replaceQueueEntry: (entry: PendingAIQueueEntry) => void;
  enqueuePendingAI: (entry: PendingAIQueueInput) => void;
  markApproved: (id: string) => void;
  markRejected: (id: string) => void;
  removeQueueEntry: (id: string) => void;
  clearQueue: () => void;
}

const INITIAL_VIEWPORT: SharedViewportState = {
  zoomLevel: 1,
  panOffset: { x: 0, y: 0 },
};

const normalizeFinite = (value: number, fallback: number): number =>
  Number.isFinite(value) ? value : fallback;

const cloneViewport = (viewport: SharedViewportState): SharedViewportState => ({
  zoomLevel: normalizeFinite(viewport.zoomLevel, 1),
  panOffset: {
    x: normalizeFinite(viewport.panOffset.x, 0),
    y: normalizeFinite(viewport.panOffset.y, 0),
  },
});

const cloneUnknownShallow = (value: unknown): unknown => {
  if (Array.isArray(value)) return [...value];
  if (typeof value === "object" && value !== null) {
    return { ...(value as Record<string, unknown>) };
  }
  return value;
};

const cloneToolResult = (
  toolResult: ToolResult<unknown> | null
): ToolResult<unknown> | null => {
  if (!toolResult) return null;
  return {
    ...toolResult,
    diagnostics: { ...toolResult.diagnostics },
  };
};

const clonePendingEntry = (entry: PendingAIQueueEntry): PendingAIQueueEntry => ({
  id: entry.id,
  toolId: entry.toolId,
  adapterId: entry.adapterId,
  payload: cloneUnknownShallow(entry.payload),
  meta: entry.meta ? { ...entry.meta } : null,
  toolResult: cloneToolResult(entry.toolResult),
  createdAt: normalizeFinite(entry.createdAt, 0),
  status: entry.status,
});

const toPendingEntry = (entry: PendingAIQueueInput): PendingAIQueueEntry => ({
  id: entry.id,
  toolId: entry.toolId,
  adapterId: entry.adapterId,
  payload: cloneUnknownShallow(entry.payload),
  meta: entry.meta ? { ...entry.meta } : null,
  toolResult: cloneToolResult(entry.toolResult),
  createdAt: normalizeFinite(entry.createdAt ?? Date.now(), Date.now()),
  status: "pending",
});

const replaceQueueEntryById = (
  queue: PendingAIQueueEntry[],
  replacement: PendingAIQueueEntry
): PendingAIQueueEntry[] => {
  let didReplace = false;
  const nextQueue = queue.map((entry) => {
    if (entry.id !== replacement.id) return entry;
    didReplace = true;
    return clonePendingEntry(replacement);
  });
  return didReplace ? nextQueue : queue;
};

const transitionQueueStatus = (
  queue: PendingAIQueueEntry[],
  id: string,
  status: QueueEntryStatus
): PendingAIQueueEntry[] => {
  let changed = false;
  const nextQueue = queue.map((entry) => {
    if (entry.id !== id || entry.status === status) return entry;
    changed = true;
    return { ...entry, status };
  });
  return changed ? nextQueue : queue;
};

const normalizeGlobalStep = (value: number): number =>
  Math.max(0, Math.floor(normalizeFinite(value, 0)));

export const useSyncStore = create<SyncStoreState>((set, get) => ({
  globalStep: 0,
  laserPosition: null,
  sharedViewport: INITIAL_VIEWPORT,
  pendingAIQueue: [],
  setGlobalStep: (value) =>
    set(() => ({
      globalStep: normalizeGlobalStep(value),
    })),
  setLaserPosition: (value) =>
    set(() => ({
      laserPosition: value
        ? {
            x: normalizeFinite(value.x, 0),
            y: normalizeFinite(value.y, 0),
          }
        : null,
    })),
  setSharedViewport: (value) =>
    set(() => ({
      sharedViewport: cloneViewport(value),
    })),
  getQueueEntry: (id) => {
    const entry = get().pendingAIQueue.find((queueEntry) => queueEntry.id === id);
    return entry ? clonePendingEntry(entry) : null;
  },
  replaceQueueEntry: (entry) =>
    set((state) => ({
      pendingAIQueue: replaceQueueEntryById(state.pendingAIQueue, entry),
    })),
  enqueuePendingAI: (entry) =>
    set((state) => ({
      pendingAIQueue: [...state.pendingAIQueue, toPendingEntry(entry)],
    })),
  markApproved: (id) =>
    set((state) => ({
      pendingAIQueue: transitionQueueStatus(
        state.pendingAIQueue,
        id,
        "approved"
      ),
    })),
  markRejected: (id) =>
    set((state) => ({
      pendingAIQueue: transitionQueueStatus(
        state.pendingAIQueue,
        id,
        "rejected"
      ),
    })),
  removeQueueEntry: (id) =>
    set((state) => ({
      pendingAIQueue: state.pendingAIQueue.filter((entry) => entry.id !== id),
    })),
  clearQueue: () =>
    set(() => ({
      pendingAIQueue: [],
    })),
}));
