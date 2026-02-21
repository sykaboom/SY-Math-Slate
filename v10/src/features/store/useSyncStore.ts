import { create } from "zustand";

import type { ToolResult } from "@core/foundation/schemas";
import { resolveQueueEntryConflict } from "@features/sync/realtime/conflictPolicy";

export type SyncPoint = {
  x: number;
  y: number;
};

export type SharedViewportState = {
  zoomLevel: number;
  panOffset: SyncPoint;
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

export type HostEnvelopeCursor = {
  sourceId: string;
  seq: number;
  sentAt: number;
};

export type RemotePresenceEntry = {
  sourceId: string;
  seq: number;
  sentAt: number;
  laserPosition: SyncPoint | null;
};

export type RemotePresenceInput = {
  sourceId: string;
  seq: number;
  sentAt?: number;
  laserPosition: SyncPoint | null;
};

interface SyncStoreState {
  globalStep: number;
  laserPosition: SyncPoint | null;
  sharedViewport: SharedViewportState;
  lastHostEnvelopeCursor: HostEnvelopeCursor | null;
  remotePresences: RemotePresenceEntry[];
  pendingAIQueue: PendingAIQueueEntry[];
  setGlobalStep: (value: number) => void;
  setLaserPosition: (value: SyncPoint | null) => void;
  setSharedViewport: (value: SharedViewportState) => void;
  setLastHostEnvelopeCursor: (value: HostEnvelopeCursor | null) => void;
  clearLastHostEnvelopeCursor: () => void;
  setRemotePresence: (value: RemotePresenceInput) => void;
  removeRemotePresence: (sourceId: string) => void;
  clearRemotePresence: () => void;
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

const MAX_REMOTE_PRESENCE_ENTRIES = 6;

const normalizeFinite = (value: number, fallback: number): number =>
  Number.isFinite(value) ? value : fallback;

const normalizeTimestamp = (value: number, fallback: number): number =>
  Math.max(0, Math.floor(normalizeFinite(value, fallback)));

const normalizeSourceId = (value: string): string => value.trim();

const normalizeEnvelopeSeq = (value: number): number =>
  Math.max(1, Math.floor(normalizeFinite(value, 1)));

const compareString = (a: string, b: string): number => {
  if (a === b) return 0;
  return a < b ? -1 : 1;
};

const normalizeSyncPoint = (value: SyncPoint): SyncPoint => ({
  x: normalizeFinite(value.x, 0),
  y: normalizeFinite(value.y, 0),
});

const cloneSyncPoint = (value: SyncPoint | null): SyncPoint | null => {
  if (!value) return null;
  return normalizeSyncPoint(value);
};

const cloneViewport = (viewport: SharedViewportState): SharedViewportState => ({
  zoomLevel: normalizeFinite(viewport.zoomLevel, 1),
  panOffset: normalizeSyncPoint(viewport.panOffset),
});

const cloneHostEnvelopeCursor = (
  cursor: HostEnvelopeCursor | null
): HostEnvelopeCursor | null => {
  if (!cursor) return null;
  const sourceId = normalizeSourceId(cursor.sourceId);
  if (sourceId.length === 0) return null;
  return {
    sourceId,
    seq: normalizeEnvelopeSeq(cursor.seq),
    sentAt: normalizeTimestamp(cursor.sentAt, 0),
  };
};

const toRemotePresenceEntry = (
  value: RemotePresenceInput | RemotePresenceEntry
): RemotePresenceEntry | null => {
  const sourceId = normalizeSourceId(value.sourceId);
  if (sourceId.length === 0) return null;
  return {
    sourceId,
    seq: normalizeEnvelopeSeq(value.seq),
    sentAt: normalizeTimestamp(value.sentAt ?? Date.now(), Date.now()),
    laserPosition: cloneSyncPoint(value.laserPosition),
  };
};

const cloneRemotePresence = (entry: RemotePresenceEntry): RemotePresenceEntry => ({
  sourceId: normalizeSourceId(entry.sourceId),
  seq: normalizeEnvelopeSeq(entry.seq),
  sentAt: normalizeTimestamp(entry.sentAt, 0),
  laserPosition: cloneSyncPoint(entry.laserPosition),
});

const comparePresencePriority = (
  a: RemotePresenceEntry,
  b: RemotePresenceEntry
): number => {
  if (a.seq !== b.seq) {
    return b.seq - a.seq;
  }
  if (a.sentAt !== b.sentAt) {
    return b.sentAt - a.sentAt;
  }
  return compareString(a.sourceId, b.sourceId);
};

const upsertRemotePresence = (
  remotePresences: RemotePresenceEntry[],
  incoming: RemotePresenceInput
): RemotePresenceEntry[] => {
  const nextEntry = toRemotePresenceEntry(incoming);
  if (!nextEntry) return remotePresences;

  const merged = remotePresences.filter(
    (entry) => entry.sourceId !== nextEntry.sourceId
  );
  merged.push(nextEntry);

  const bounded = merged
    .map(cloneRemotePresence)
    .sort(comparePresencePriority)
    .slice(0, MAX_REMOTE_PRESENCE_ENTRIES)
    .sort((a, b) => compareString(a.sourceId, b.sourceId));

  return bounded;
};

const removeRemotePresenceBySource = (
  remotePresences: RemotePresenceEntry[],
  sourceId: string
): RemotePresenceEntry[] => {
  const normalizedSourceId = normalizeSourceId(sourceId);
  if (normalizedSourceId.length === 0) return remotePresences;
  return remotePresences.filter((entry) => entry.sourceId !== normalizedSourceId);
};

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
  createdAt: normalizeTimestamp(entry.createdAt, 0),
  status: entry.status,
});

const toPendingEntry = (entry: PendingAIQueueInput): PendingAIQueueEntry => {
  const now = Date.now();
  return {
    id: entry.id,
    toolId: entry.toolId,
    adapterId: entry.adapterId,
    payload: cloneUnknownShallow(entry.payload),
    meta: entry.meta ? { ...entry.meta } : null,
    toolResult: cloneToolResult(entry.toolResult),
    createdAt: normalizeTimestamp(entry.createdAt ?? now, now),
    status: "pending",
  };
};

const replaceQueueEntryById = (
  queue: PendingAIQueueEntry[],
  replacement: PendingAIQueueEntry
): PendingAIQueueEntry[] => {
  let didReplace = false;
  const nextQueue = queue.map((entry) => {
    if (entry.id !== replacement.id) return entry;
    const resolution = resolveQueueEntryConflict({
      current: entry,
      incoming: replacement,
    });
    if (resolution.decision === "keep-current") {
      return entry;
    }
    didReplace = true;
    return clonePendingEntry(replacement);
  });
  return didReplace ? nextQueue : queue;
};

const enqueueOrMergeQueueEntry = (
  queue: PendingAIQueueEntry[],
  incoming: PendingAIQueueInput
): PendingAIQueueEntry[] => {
  const nextEntry = toPendingEntry(incoming);
  const existingIndex = queue.findIndex((entry) => entry.id === nextEntry.id);
  if (existingIndex < 0) {
    return [...queue, nextEntry];
  }

  const resolution = resolveQueueEntryConflict({
    current: queue[existingIndex],
    incoming: nextEntry,
  });
  if (resolution.decision === "keep-current") {
    return queue;
  }

  const nextQueue = [...queue];
  nextQueue[existingIndex] = nextEntry;
  return nextQueue;
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
  lastHostEnvelopeCursor: null,
  remotePresences: [],
  pendingAIQueue: [],
  setGlobalStep: (value) =>
    set(() => ({
      globalStep: normalizeGlobalStep(value),
    })),
  setLaserPosition: (value) =>
    set(() => ({
      laserPosition: cloneSyncPoint(value),
    })),
  setSharedViewport: (value) =>
    set(() => ({
      sharedViewport: cloneViewport(value),
    })),
  setLastHostEnvelopeCursor: (value) =>
    set(() => ({
      lastHostEnvelopeCursor: cloneHostEnvelopeCursor(value),
    })),
  clearLastHostEnvelopeCursor: () =>
    set(() => ({
      lastHostEnvelopeCursor: null,
    })),
  setRemotePresence: (value) =>
    set((state) => ({
      remotePresences: upsertRemotePresence(state.remotePresences, value),
    })),
  removeRemotePresence: (sourceId) =>
    set((state) => ({
      remotePresences: removeRemotePresenceBySource(
        state.remotePresences,
        sourceId
      ),
    })),
  clearRemotePresence: () =>
    set(() => ({
      remotePresences: [],
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
      pendingAIQueue: enqueueOrMergeQueueEntry(state.pendingAIQueue, entry),
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
