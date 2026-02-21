const INPUT_STUDIO_OFFLINE_DRAFT_QUEUE_TYPE = "input-studio-offline-llm-draft";
const INPUT_STUDIO_OFFLINE_DRAFT_QUEUE_VERSION = 1 as const;
const INPUT_STUDIO_OFFLINE_DRAFT_QUEUE_ID_PREFIX = "input-studio-offline-draft";

export const INPUT_STUDIO_OFFLINE_DRAFT_QUEUE_STORAGE_KEY =
  "input-studio.offline-llm-draft.queue.v1";
export const INPUT_STUDIO_OFFLINE_DRAFT_QUEUE_MAX_SIZE = 50;

type JsonSafePrimitive = string | number | boolean | null;
type JsonSafeValue =
  | JsonSafePrimitive
  | JsonSafeValue[]
  | { [key: string]: JsonSafeValue };

export type OfflineDraftQueueJsonRecord = Record<string, JsonSafeValue>;
export type OfflineDraftQueueRole = "host" | "student";

export type OfflineDraftQueueRequest = {
  prompt: string;
  locale: string;
  rawText: string;
  meta?: Record<string, unknown>;
  role: OfflineDraftQueueRole;
};

export type OfflineDraftQueueRequestSnapshot = {
  prompt: string;
  locale: string;
  rawText: string;
  meta: OfflineDraftQueueJsonRecord;
  role: OfflineDraftQueueRole;
};

export type OfflineDraftQueueItem = {
  queueType: typeof INPUT_STUDIO_OFFLINE_DRAFT_QUEUE_TYPE;
  queueVersion: typeof INPUT_STUDIO_OFFLINE_DRAFT_QUEUE_VERSION;
  id: string;
  request: OfflineDraftQueueRequestSnapshot;
  enqueuedAt: number;
};

export type EnqueueOfflineDraftQueueInput = OfflineDraftQueueRequest & {
  enqueuedAt?: number;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const hashFnv1a = (input: string): string => {
  let hash = 0x811c9dc5;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
};

const isJsonSafeValue = (value: unknown): value is JsonSafeValue => {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return true;
  }
  if (typeof value === "number") {
    return Number.isFinite(value);
  }
  if (Array.isArray(value)) {
    return value.every((entry) => isJsonSafeValue(entry));
  }
  if (!isRecord(value)) {
    return false;
  }
  return Object.values(value).every((entry) => isJsonSafeValue(entry));
};

const toJsonSafeValueInternal = (
  value: unknown,
  visited: WeakSet<object>
): JsonSafeValue => {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return value;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "bigint") {
    return value.toString();
  }
  if (value instanceof Date) {
    return Number.isFinite(value.getTime()) ? value.toISOString() : null;
  }
  if (Array.isArray(value)) {
    if (visited.has(value)) return "[Circular]";
    visited.add(value);
    const normalized = value.map((entry) =>
      toJsonSafeValueInternal(entry, visited)
    );
    visited.delete(value);
    return normalized;
  }
  if (isRecord(value)) {
    if (visited.has(value)) return "[Circular]";
    visited.add(value);
    const normalized: Record<string, JsonSafeValue> = {};
    const entries = Object.entries(value)
      .filter(([, entry]) => entry !== undefined)
      .sort(([left], [right]) => left.localeCompare(right));
    for (const [key, entry] of entries) {
      normalized[key] = toJsonSafeValueInternal(entry, visited);
    }
    visited.delete(value);
    return normalized;
  }
  return null;
};

const toJsonSafeValue = (value: unknown): JsonSafeValue =>
  toJsonSafeValueInternal(value, new WeakSet<object>());

const toJsonSafeRecord = (value: unknown): OfflineDraftQueueJsonRecord => {
  const normalized = toJsonSafeValue(value);
  return isRecord(normalized) ? (normalized as OfflineDraftQueueJsonRecord) : {};
};

const toStableString = (value: unknown): string =>
  JSON.stringify(toJsonSafeValue(value));

const toFiniteTimestamp = (value: unknown, fallback: number): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.max(0, Math.floor(value));
};

const toStorage = (): Storage | null => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const parseRole = (value: unknown): OfflineDraftQueueRole | null => {
  if (value === "host" || value === "student") {
    return value;
  }
  return null;
};

const parseRequestSnapshot = (
  value: unknown
): OfflineDraftQueueRequestSnapshot | null => {
  if (!isRecord(value)) return null;
  if (!isNonEmptyString(value.prompt)) return null;
  if (!isNonEmptyString(value.locale)) return null;
  if (typeof value.rawText !== "string") return null;
  const role = parseRole(value.role);
  if (!role) return null;
  if (!isRecord(value.meta) || !isJsonSafeValue(value.meta)) return null;
  return {
    prompt: value.prompt.trim(),
    locale: value.locale.trim(),
    rawText: value.rawText,
    meta: value.meta as OfflineDraftQueueJsonRecord,
    role,
  };
};

const createRequestSnapshot = (
  input: OfflineDraftQueueRequest
): OfflineDraftQueueRequestSnapshot => ({
  prompt: input.prompt.trim(),
  locale: input.locale.trim(),
  rawText: input.rawText,
  meta: toJsonSafeRecord(input.meta),
  role: input.role,
});

export const createOfflineDraftQueueItemId = (
  request: OfflineDraftQueueRequestSnapshot
): string => {
  const seed = {
    queueType: INPUT_STUDIO_OFFLINE_DRAFT_QUEUE_TYPE,
    queueVersion: INPUT_STUDIO_OFFLINE_DRAFT_QUEUE_VERSION,
    prompt: request.prompt,
    locale: request.locale,
    rawText: request.rawText,
    meta: request.meta,
    role: request.role,
  };
  return `${INPUT_STUDIO_OFFLINE_DRAFT_QUEUE_ID_PREFIX}_${hashFnv1a(toStableString(seed))}`;
};

const createQueueItem = (
  input: EnqueueOfflineDraftQueueInput
): OfflineDraftQueueItem => {
  const request = createRequestSnapshot(input);
  return {
    queueType: INPUT_STUDIO_OFFLINE_DRAFT_QUEUE_TYPE,
    queueVersion: INPUT_STUDIO_OFFLINE_DRAFT_QUEUE_VERSION,
    id: createOfflineDraftQueueItemId(request),
    request,
    enqueuedAt: toFiniteTimestamp(input.enqueuedAt, Date.now()),
  };
};

const parseQueueItem = (value: unknown): OfflineDraftQueueItem | null => {
  if (!isRecord(value)) return null;
  if (value.queueType !== INPUT_STUDIO_OFFLINE_DRAFT_QUEUE_TYPE) return null;
  if (value.queueVersion !== INPUT_STUDIO_OFFLINE_DRAFT_QUEUE_VERSION) return null;
  if (!isNonEmptyString(value.id)) return null;

  const request = parseRequestSnapshot(value.request);
  if (!request) return null;

  const deterministicId = createOfflineDraftQueueItemId(request);
  if (value.id !== deterministicId) return null;

  const enqueuedAt = toFiniteTimestamp(value.enqueuedAt, -1);
  if (enqueuedAt < 0) return null;

  return {
    queueType: INPUT_STUDIO_OFFLINE_DRAFT_QUEUE_TYPE,
    queueVersion: INPUT_STUDIO_OFFLINE_DRAFT_QUEUE_VERSION,
    id: deterministicId,
    request,
    enqueuedAt,
  };
};

const writeQueue = (queue: OfflineDraftQueueItem[]): void => {
  const storage = toStorage();
  if (!storage) return;
  try {
    if (queue.length === 0) {
      storage.removeItem(INPUT_STUDIO_OFFLINE_DRAFT_QUEUE_STORAGE_KEY);
      return;
    }
    storage.setItem(
      INPUT_STUDIO_OFFLINE_DRAFT_QUEUE_STORAGE_KEY,
      JSON.stringify(queue)
    );
  } catch {
    // Swallow localStorage failures to keep queue usage side-effect safe.
  }
};

const boundQueue = (queue: OfflineDraftQueueItem[]): OfflineDraftQueueItem[] =>
  queue.length <= INPUT_STUDIO_OFFLINE_DRAFT_QUEUE_MAX_SIZE
    ? queue
    : queue.slice(queue.length - INPUT_STUDIO_OFFLINE_DRAFT_QUEUE_MAX_SIZE);

const dedupeQueueById = (
  queue: OfflineDraftQueueItem[]
): OfflineDraftQueueItem[] => {
  if (queue.length <= 1) return queue;
  const seen = new Set<string>();
  const reversed: OfflineDraftQueueItem[] = [];
  for (let index = queue.length - 1; index >= 0; index -= 1) {
    const item = queue[index];
    if (!item) continue;
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    reversed.push(item);
  }
  return reversed.reverse();
};

const readQueue = (): OfflineDraftQueueItem[] => {
  const storage = toStorage();
  if (!storage) return [];

  const raw = storage.getItem(INPUT_STUDIO_OFFLINE_DRAFT_QUEUE_STORAGE_KEY);
  if (!raw) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    writeQueue([]);
    return [];
  }

  if (!Array.isArray(parsed)) {
    writeQueue([]);
    return [];
  }

  let droppedInvalid = false;
  const hydrated: OfflineDraftQueueItem[] = [];
  for (const candidate of parsed) {
    const item = parseQueueItem(candidate);
    if (!item) {
      droppedInvalid = true;
      continue;
    }
    hydrated.push(item);
  }

  const deduped = dedupeQueueById(hydrated);
  const bounded = boundQueue(deduped);
  const shouldRewrite =
    droppedInvalid ||
    deduped.length !== hydrated.length ||
    bounded.length !== deduped.length;
  if (shouldRewrite) {
    writeQueue(bounded);
  }
  return bounded;
};

const normalizeExtractionLimit = (
  value: number | undefined,
  queueLength: number
): number => {
  if (value === undefined) return queueLength;
  if (!Number.isFinite(value)) return queueLength;
  return Math.max(0, Math.floor(value));
};

export const enqueueOfflineDraftQueueItem = (
  input: EnqueueOfflineDraftQueueInput
): OfflineDraftQueueItem => {
  const item = createQueueItem(input);
  const queue = readQueue();
  const withoutDuplicate = queue.filter((entry) => entry.id !== item.id);
  const nextQueue = boundQueue([...withoutDuplicate, item]);
  writeQueue(nextQueue);
  return item;
};

export const listOfflineDraftQueueItems = (): OfflineDraftQueueItem[] =>
  readQueue();

export const removeOfflineDraftQueueItem = (id: string): boolean => {
  if (!isNonEmptyString(id)) return false;
  const queue = readQueue();
  const normalizedId = id.trim();
  const nextQueue = queue.filter((item) => item.id !== normalizedId);
  if (nextQueue.length === queue.length) return false;
  writeQueue(nextQueue);
  return true;
};

export const clearOfflineDraftQueue = (): void => {
  writeQueue([]);
};

export const extractReplayReadyOfflineDraftQueueItems = (
  limit?: number
): OfflineDraftQueueItem[] => {
  const queue = readQueue();
  if (queue.length === 0) return [];

  const takeCount = normalizeExtractionLimit(limit, queue.length);
  if (takeCount === 0) return [];

  const replayReadyItems = queue.slice(0, takeCount);
  if (replayReadyItems.length === 0) return [];

  writeQueue(queue.slice(replayReadyItems.length));
  return replayReadyItems;
};
