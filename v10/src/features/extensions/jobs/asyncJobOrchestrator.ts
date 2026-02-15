import type { JsonSafeValue } from "@core/contracts";
import type {
  AsyncJobCancelInput,
  AsyncJobHistoryEntry,
  AsyncJobHistorySnapshot,
  AsyncJobIdSeed,
  AsyncJobJsonRecord,
  AsyncJobListInput,
  AsyncJobMutationError,
  AsyncJobMutationResult,
  AsyncJobOrchestrator,
  AsyncJobOrchestratorOptions,
  AsyncJobOrchestratorSnapshot,
  AsyncJobRecord,
  AsyncJobSnapshot,
  AsyncJobStatus,
  AsyncJobTransitionType,
} from "./types";

const DEFAULT_ASYNC_JOB_HISTORY_LIMIT = 200;
const DEFAULT_JOB_ID_NAMESPACE = "job";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const normalizeFiniteTimestamp = (value: unknown, fallback: number): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.max(0, Math.floor(value));
};

const normalizePositiveInteger = (value: unknown, fallback: number): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }
  const normalized = Math.floor(value);
  if (normalized < 1) {
    return fallback;
  }
  return normalized;
};

const normalizeNonEmptyString = (value: unknown, fallback: string): string => {
  if (typeof value !== "string") {
    return fallback;
  }
  const normalized = value.trim();
  return normalized === "" ? fallback : normalized;
};

const normalizeOptionalString = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized === "" ? null : normalized;
};

const sanitizeIdNamespace = (value: unknown): string => {
  const normalized = normalizeNonEmptyString(value, DEFAULT_JOB_ID_NAMESPACE)
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized === "" ? DEFAULT_JOB_ID_NAMESPACE : normalized;
};

const hashFnv1a = (input: string): string => {
  let hash = 0x811c9dc5;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
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

export const toAsyncJobJsonSafeValue = (value: unknown): JsonSafeValue =>
  toJsonSafeValueInternal(value, new WeakSet<object>());

const toAsyncJobJsonSafeRecord = (value: unknown): AsyncJobJsonRecord => {
  const normalized = toAsyncJobJsonSafeValue(value);
  return isRecord(normalized) ? (normalized as AsyncJobJsonRecord) : {};
};

const toStableString = (value: unknown): string =>
  JSON.stringify(toAsyncJobJsonSafeValue(value));

export const createDeterministicAsyncJobId = (seed: AsyncJobIdSeed): string => {
  const namespace = sanitizeIdNamespace(seed.namespace);
  const canonicalSeed = {
    namespace,
    kind: normalizeNonEmptyString(seed.kind, "job.unknown"),
    adapterId: normalizeOptionalString(seed.adapterId),
    toolId: normalizeOptionalString(seed.toolId),
    payload: toAsyncJobJsonSafeValue(seed.payload),
    meta: toAsyncJobJsonSafeValue(seed.meta),
    salt: normalizeOptionalString(seed.salt),
  };
  return `${namespace}_${hashFnv1a(toStableString(canonicalSeed))}`;
};

const mergeMeta = (
  currentMeta: AsyncJobJsonRecord,
  nextMeta: unknown
): AsyncJobJsonRecord => {
  const patch = toAsyncJobJsonSafeRecord(nextMeta);
  return toAsyncJobJsonSafeRecord({
    ...currentMeta,
    ...patch,
  });
};

const normalizeJobId = (value: unknown): string =>
  normalizeNonEmptyString(value, "");

const normalizeTransitionMessage = (
  action: AsyncJobTransitionType,
  status: AsyncJobStatus
): string => `Cannot ${action} a job from status '${status}'.`;

const transitionError = (
  code: AsyncJobMutationError["code"],
  message: string,
  jobId?: string,
  status?: AsyncJobStatus
): AsyncJobMutationError => ({
  ok: false,
  code,
  message,
  ...(jobId ? { jobId } : {}),
  ...(status ? { status } : {}),
});

const createHistoryEntrySnapshot = (
  entry: AsyncJobHistoryEntry
): AsyncJobHistorySnapshot => ({
  sequence: entry.sequence,
  jobId: entry.jobId,
  transition: entry.transition,
  fromStatus: entry.fromStatus,
  toStatus: entry.toStatus,
  at: entry.at,
  detail: toAsyncJobJsonSafeRecord(entry.detail),
});

export const createAsyncJobSnapshot = (job: AsyncJobRecord): AsyncJobSnapshot => ({
  id: job.id,
  kind: job.kind,
  adapterId: job.adapterId,
  toolId: job.toolId,
  status: job.status,
  payload: toAsyncJobJsonSafeValue(job.payload),
  meta: toAsyncJobJsonSafeRecord(job.meta),
  result: toAsyncJobJsonSafeValue(job.result),
  error: job.error
    ? {
        code: job.error.code,
        message: job.error.message,
        details: toAsyncJobJsonSafeValue(job.error.details),
      }
    : null,
  cancelReason: job.cancelReason,
  createdAt: job.createdAt,
  updatedAt: job.updatedAt,
  startedAt: job.startedAt,
  completedAt: job.completedAt,
});

export const createAsyncJobHistorySnapshot = (
  entry: AsyncJobHistoryEntry
): AsyncJobHistorySnapshot => createHistoryEntrySnapshot(entry);

export const createAsyncJobOrchestratorSnapshot = (
  jobs: readonly AsyncJobRecord[],
  history: readonly AsyncJobHistoryEntry[]
): AsyncJobOrchestratorSnapshot => ({
  jobs: jobs.map((job) => createAsyncJobSnapshot(job)),
  history: history.map((entry) => createHistoryEntrySnapshot(entry)),
});

type MutableOrchestratorState = {
  jobsById: Map<string, AsyncJobRecord>;
  jobOrder: string[];
  history: AsyncJobHistoryEntry[];
  nextSequence: number;
};

type AsyncJobMutationPlan = {
  transition: AsyncJobTransitionType;
  nextStatus: AsyncJobStatus;
  at: number;
  detail: AsyncJobJsonRecord;
  patch?: Partial<AsyncJobRecord>;
};

const isAsyncJobMutationError = (
  value: AsyncJobMutationPlan | AsyncJobMutationError
): value is AsyncJobMutationError => "ok" in value && value.ok === false;

const appendHistoryEntry = (
  state: MutableOrchestratorState,
  historyLimit: number,
  jobId: string,
  transition: AsyncJobTransitionType,
  fromStatus: AsyncJobStatus | null,
  toStatus: AsyncJobStatus,
  at: number,
  detail: AsyncJobJsonRecord
): AsyncJobHistoryEntry => {
  const entry: AsyncJobHistoryEntry = {
    sequence: state.nextSequence,
    jobId,
    transition,
    fromStatus,
    toStatus,
    at,
    detail: toAsyncJobJsonSafeRecord(detail),
  };
  state.nextSequence += 1;
  state.history.push(entry);
  if (state.history.length > historyLimit) {
    const overflow = state.history.length - historyLimit;
    state.history.splice(0, overflow);
  }
  return entry;
};

export const createAsyncJobOrchestrator = (
  options: AsyncJobOrchestratorOptions = {}
): AsyncJobOrchestrator => {
  const now = options.now ?? (() => Date.now());
  const historyLimit = normalizePositiveInteger(
    options.historyLimit,
    DEFAULT_ASYNC_JOB_HISTORY_LIMIT
  );

  const state: MutableOrchestratorState = {
    jobsById: new Map<string, AsyncJobRecord>(),
    jobOrder: [],
    history: [],
    nextSequence: 1,
  };

  const resolveTimestamp = (value: unknown): number =>
    normalizeFiniteTimestamp(value, normalizeFiniteTimestamp(now(), 0));

  const getJob = (jobId: string): AsyncJobRecord | null =>
    state.jobsById.get(jobId) ?? null;

  const mutateJob = (
    jobId: string,
    updater: (
      job: AsyncJobRecord
    ) => AsyncJobMutationPlan | AsyncJobMutationError
  ): AsyncJobMutationResult => {
    const existing = getJob(jobId);
    if (!existing) {
      return transitionError("job-not-found", `Job '${jobId}' does not exist.`, jobId);
    }

    const updateResult = updater(existing);
    if (isAsyncJobMutationError(updateResult)) {
      return updateResult;
    }

    const next: AsyncJobMutationPlan = updateResult;
    const updatedJob: AsyncJobRecord = {
      ...existing,
      ...(next.patch ?? {}),
      status: next.nextStatus,
      updatedAt: next.at,
    };

    if (next.nextStatus === "running") {
      updatedJob.startedAt = updatedJob.startedAt ?? next.at;
      updatedJob.completedAt = null;
      updatedJob.result = null;
      updatedJob.error = null;
      updatedJob.cancelReason = null;
    } else if (
      next.nextStatus === "succeeded" ||
      next.nextStatus === "failed" ||
      next.nextStatus === "cancelled"
    ) {
      updatedJob.completedAt = next.at;
    }

    state.jobsById.set(jobId, updatedJob);
    const historyEntry = appendHistoryEntry(
      state,
      historyLimit,
      updatedJob.id,
      next.transition,
      existing.status,
      updatedJob.status,
      next.at,
      next.detail
    );

    return {
      ok: true,
      job: createAsyncJobSnapshot(updatedJob),
      historyEntry: createHistoryEntrySnapshot(historyEntry),
    };
  };

  return {
    enqueue: (input) => {
      const createdAt = resolveTimestamp(input.createdAt);
      const explicitId = normalizeJobId(input.id);
      const generatedId =
        explicitId ||
        createDeterministicAsyncJobId({
          namespace: DEFAULT_JOB_ID_NAMESPACE,
          kind: input.kind,
          adapterId: input.adapterId,
          toolId: input.toolId,
          payload: input.payload,
          meta: input.meta,
          salt: input.salt,
        });

      if (state.jobsById.has(generatedId)) {
        return transitionError(
          "job-already-exists",
          `Job '${generatedId}' already exists.`,
          generatedId
        );
      }

      const job: AsyncJobRecord = {
        id: generatedId,
        kind: normalizeNonEmptyString(input.kind, "job.unknown"),
        adapterId: normalizeOptionalString(input.adapterId),
        toolId: normalizeOptionalString(input.toolId),
        status: "queued",
        payload: toAsyncJobJsonSafeValue(input.payload),
        meta: toAsyncJobJsonSafeRecord(input.meta),
        result: null,
        error: null,
        cancelReason: null,
        createdAt,
        updatedAt: createdAt,
        startedAt: null,
        completedAt: null,
      };

      state.jobsById.set(job.id, job);
      state.jobOrder.push(job.id);

      const historyEntry = appendHistoryEntry(
        state,
        historyLimit,
        job.id,
        "enqueued",
        null,
        "queued",
        createdAt,
        {
          kind: job.kind,
          adapterId: job.adapterId,
          toolId: job.toolId,
        }
      );

      return {
        ok: true,
        job: createAsyncJobSnapshot(job),
        historyEntry: createHistoryEntrySnapshot(historyEntry),
      };
    },
    start: (jobId, input = {}) =>
      mutateJob(normalizeJobId(jobId), (job) => {
        if (job.status !== "queued") {
          return transitionError(
            "invalid-transition",
            normalizeTransitionMessage("started", job.status),
            job.id,
            job.status
          );
        }
        const startedAt = resolveTimestamp(input.startedAt);
        const meta = mergeMeta(job.meta, input.meta);
        return {
          transition: "started",
          nextStatus: "running",
          at: startedAt,
          detail: {
            startedAt,
          },
          patch: {
            meta,
          },
        };
      }),
    succeed: (jobId, input = {}) =>
      mutateJob(normalizeJobId(jobId), (job) => {
        if (job.status !== "running") {
          return transitionError(
            "invalid-transition",
            normalizeTransitionMessage("succeeded", job.status),
            job.id,
            job.status
          );
        }
        const completedAt = resolveTimestamp(input.completedAt);
        const nextResult = toAsyncJobJsonSafeValue(input.result);
        const nextMeta = mergeMeta(job.meta, input.meta);
        return {
          transition: "succeeded",
          nextStatus: "succeeded",
          at: completedAt,
          detail: {
            completedAt,
          },
          patch: {
            meta: nextMeta,
            result: nextResult,
            error: null,
            cancelReason: null,
          },
        };
      }),
    fail: (jobId, input) =>
      mutateJob(normalizeJobId(jobId), (job) => {
        if (job.status !== "queued" && job.status !== "running") {
          return transitionError(
            "invalid-transition",
            normalizeTransitionMessage("failed", job.status),
            job.id,
            job.status
          );
        }
        const completedAt = resolveTimestamp(input.completedAt);
        const nextMeta = mergeMeta(job.meta, input.meta);
        const nextError = {
          code: normalizeNonEmptyString(input.errorCode, "unknown-error"),
          message: normalizeNonEmptyString(input.errorMessage, "Unknown async job error."),
          details: toAsyncJobJsonSafeValue(input.errorDetails),
        };
        return {
          transition: "failed",
          nextStatus: "failed",
          at: completedAt,
          detail: {
            completedAt,
            errorCode: nextError.code,
          },
          patch: {
            meta: nextMeta,
            result: null,
            error: nextError,
            cancelReason: null,
          },
        };
      }),
    cancel: (jobId, input: AsyncJobCancelInput = {}) =>
      mutateJob(normalizeJobId(jobId), (job) => {
        if (job.status !== "queued" && job.status !== "running") {
          return transitionError(
            "invalid-transition",
            normalizeTransitionMessage("cancelled", job.status),
            job.id,
            job.status
          );
        }
        const completedAt = resolveTimestamp(input.completedAt);
        const reason = normalizeOptionalString(input.reason);
        const nextMeta = mergeMeta(job.meta, input.meta);
        return {
          transition: "cancelled",
          nextStatus: "cancelled",
          at: completedAt,
          detail: {
            completedAt,
            ...(reason ? { reason } : {}),
          },
          patch: {
            meta: nextMeta,
            result: null,
            error: null,
            cancelReason: reason,
          },
        };
      }),
    get: (jobId) => {
      const job = getJob(normalizeJobId(jobId));
      return job ? createAsyncJobSnapshot(job) : null;
    },
    list: (input: AsyncJobListInput = {}) => {
      const statusesArray = Array.isArray(input.statuses)
        ? input.statuses
        : input.statuses
          ? [input.statuses]
          : null;
      const statusFilter = statusesArray
        ? new Set<AsyncJobStatus>(statusesArray)
        : null;
      const limit = normalizePositiveInteger(
        input.limit,
        Number.MAX_SAFE_INTEGER
      );
      const orderedIds = input.newestFirst
        ? [...state.jobOrder].reverse()
        : [...state.jobOrder];
      const snapshots: AsyncJobSnapshot[] = [];
      for (const id of orderedIds) {
        if (snapshots.length >= limit) break;
        const job = state.jobsById.get(id);
        if (!job) continue;
        if (statusFilter && !statusFilter.has(job.status)) continue;
        snapshots.push(createAsyncJobSnapshot(job));
      }
      return snapshots;
    },
    listHistory: (limit) => {
      const normalizedLimit = normalizePositiveInteger(
        limit,
        Number.MAX_SAFE_INTEGER
      );
      const start = Math.max(0, state.history.length - normalizedLimit);
      return state.history
        .slice(start)
        .map((entry) => createHistoryEntrySnapshot(entry));
    },
    getSnapshot: () => {
      const jobs = state.jobOrder
        .map((id) => state.jobsById.get(id))
        .filter((value): value is AsyncJobRecord => value !== undefined);
      return createAsyncJobOrchestratorSnapshot(jobs, state.history);
    },
  };
};
