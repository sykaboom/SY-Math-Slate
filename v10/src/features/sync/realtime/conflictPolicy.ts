export type ConflictEnvelopeCursor = {
  sourceId: string;
  seq: number;
  sentAt: number;
};

export type EnvelopeConflictClassification = "newer" | "stale" | "tie";

export type EnvelopeConflictDecision = "accept" | "ignore";

export type EnvelopeConflictReason =
  | "no-current-cursor"
  | "same-source-higher-seq"
  | "same-source-lower-seq"
  | "same-source-newer-sent-at"
  | "same-source-older-sent-at"
  | "same-source-duplicate"
  | "newer-sent-at"
  | "older-sent-at"
  | "equal-sent-at-higher-seq"
  | "equal-sent-at-lower-seq"
  | "source-id-precedence";

export type EnvelopeConflictResult = {
  classification: EnvelopeConflictClassification;
  decision: EnvelopeConflictDecision;
  reason: EnvelopeConflictReason;
  nextCursor: ConflictEnvelopeCursor;
};

type ResolveEnvelopeConflictInput = {
  current: ConflictEnvelopeCursor | null;
  incoming: ConflictEnvelopeCursor;
};

export type QueueConflictStatus = "pending" | "approved" | "rejected";

export type QueueConflictEntry = {
  id: string;
  createdAt: number;
  status: QueueConflictStatus;
  toolId: string;
  adapterId: string;
};

export type QueueConflictClassification = "newer" | "stale" | "tie";

export type QueueConflictDecision = "take-incoming" | "keep-current";

export type QueueConflictReason =
  | "higher-created-at"
  | "lower-created-at"
  | "status-precedence"
  | "tool-id-precedence"
  | "adapter-id-precedence"
  | "duplicate-entry";

export type QueueConflictResult = {
  classification: QueueConflictClassification;
  decision: QueueConflictDecision;
  reason: QueueConflictReason;
};

type ResolveQueueConflictInput = {
  current: QueueConflictEntry;
  incoming: QueueConflictEntry;
};

const normalizeFinite = (value: number, fallback: number): number =>
  Number.isFinite(value) ? value : fallback;

const normalizeSourceId = (value: string): string => value.trim();

const normalizeSeq = (value: number): number =>
  Math.max(1, Math.floor(normalizeFinite(value, 1)));

const normalizeTimestamp = (value: number): number =>
  Math.max(0, Math.floor(normalizeFinite(value, 0)));

const compareString = (a: string, b: string): number => {
  if (a === b) return 0;
  return a < b ? -1 : 1;
};

const normalizeEnvelopeCursor = (
  cursor: ConflictEnvelopeCursor
): ConflictEnvelopeCursor => ({
  sourceId: normalizeSourceId(cursor.sourceId),
  seq: normalizeSeq(cursor.seq),
  sentAt: normalizeTimestamp(cursor.sentAt),
});

const acceptEnvelope = (
  classification: EnvelopeConflictClassification,
  reason: EnvelopeConflictReason,
  nextCursor: ConflictEnvelopeCursor
): EnvelopeConflictResult => ({
  classification,
  decision: "accept",
  reason,
  nextCursor,
});

const ignoreEnvelope = (
  classification: EnvelopeConflictClassification,
  reason: EnvelopeConflictReason,
  nextCursor: ConflictEnvelopeCursor
): EnvelopeConflictResult => ({
  classification,
  decision: "ignore",
  reason,
  nextCursor,
});

/**
 * Deterministic envelope precedence:
 * 1) Same sourceId: seq first, sentAt second.
 * 2) Different sourceId: sentAt first, seq second.
 * 3) Equal sentAt + seq across sources: lexical sourceId tie-break.
 */
export const resolveEnvelopeConflict = (
  input: ResolveEnvelopeConflictInput
): EnvelopeConflictResult => {
  const incoming = normalizeEnvelopeCursor(input.incoming);
  const current = input.current ? normalizeEnvelopeCursor(input.current) : null;

  if (!current) {
    return acceptEnvelope("newer", "no-current-cursor", incoming);
  }

  if (incoming.sourceId === current.sourceId) {
    if (incoming.seq > current.seq) {
      return acceptEnvelope("newer", "same-source-higher-seq", incoming);
    }
    if (incoming.seq < current.seq) {
      return ignoreEnvelope("stale", "same-source-lower-seq", current);
    }
    if (incoming.sentAt > current.sentAt) {
      return acceptEnvelope("tie", "same-source-newer-sent-at", incoming);
    }
    if (incoming.sentAt < current.sentAt) {
      return ignoreEnvelope("tie", "same-source-older-sent-at", current);
    }
    return ignoreEnvelope("tie", "same-source-duplicate", current);
  }

  if (incoming.sentAt > current.sentAt) {
    return acceptEnvelope("newer", "newer-sent-at", incoming);
  }
  if (incoming.sentAt < current.sentAt) {
    return ignoreEnvelope("stale", "older-sent-at", current);
  }

  if (incoming.seq > current.seq) {
    return acceptEnvelope("newer", "equal-sent-at-higher-seq", incoming);
  }
  if (incoming.seq < current.seq) {
    return ignoreEnvelope("stale", "equal-sent-at-lower-seq", current);
  }

  if (compareString(incoming.sourceId, current.sourceId) > 0) {
    return acceptEnvelope("tie", "source-id-precedence", incoming);
  }
  return ignoreEnvelope("tie", "source-id-precedence", current);
};

const normalizeStatus = (value: QueueConflictStatus): QueueConflictStatus => {
  if (value === "approved" || value === "rejected") return value;
  return "pending";
};

const normalizeQueueEntry = (entry: QueueConflictEntry): QueueConflictEntry => ({
  id: entry.id,
  createdAt: normalizeTimestamp(entry.createdAt),
  status: normalizeStatus(entry.status),
  toolId: entry.toolId,
  adapterId: entry.adapterId,
});

const statusRank = (status: QueueConflictStatus): number => {
  if (status === "rejected") return 2;
  if (status === "approved") return 1;
  return 0;
};

const takeIncoming = (
  classification: QueueConflictClassification,
  reason: QueueConflictReason
): QueueConflictResult => ({
  classification,
  decision: "take-incoming",
  reason,
});

const keepCurrent = (
  classification: QueueConflictClassification,
  reason: QueueConflictReason
): QueueConflictResult => ({
  classification,
  decision: "keep-current",
  reason,
});

export const resolveQueueEntryConflict = (
  input: ResolveQueueConflictInput
): QueueConflictResult => {
  const current = normalizeQueueEntry(input.current);
  const incoming = normalizeQueueEntry(input.incoming);

  if (incoming.createdAt > current.createdAt) {
    return takeIncoming("newer", "higher-created-at");
  }
  if (incoming.createdAt < current.createdAt) {
    return keepCurrent("stale", "lower-created-at");
  }

  const incomingStatusRank = statusRank(incoming.status);
  const currentStatusRank = statusRank(current.status);
  if (incomingStatusRank > currentStatusRank) {
    return takeIncoming("tie", "status-precedence");
  }
  if (incomingStatusRank < currentStatusRank) {
    return keepCurrent("tie", "status-precedence");
  }

  const toolCompare = compareString(incoming.toolId, current.toolId);
  if (toolCompare > 0) {
    return takeIncoming("tie", "tool-id-precedence");
  }
  if (toolCompare < 0) {
    return keepCurrent("tie", "tool-id-precedence");
  }

  const adapterCompare = compareString(incoming.adapterId, current.adapterId);
  if (adapterCompare > 0) {
    return takeIncoming("tie", "adapter-id-precedence");
  }
  if (adapterCompare < 0) {
    return keepCurrent("tie", "adapter-id-precedence");
  }

  return keepCurrent("tie", "duplicate-entry");
};
