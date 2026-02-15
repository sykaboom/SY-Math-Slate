import type { JsonSafeValue } from "@core/contracts";

export const ASYNC_JOB_STATUS_VALUES = [
  "queued",
  "running",
  "succeeded",
  "failed",
  "cancelled",
] as const;

export type AsyncJobStatus = (typeof ASYNC_JOB_STATUS_VALUES)[number];

export type AsyncJobTerminalStatus = Extract<
  AsyncJobStatus,
  "succeeded" | "failed" | "cancelled"
>;

export type AsyncJobTransitionType =
  | "enqueued"
  | "started"
  | "succeeded"
  | "failed"
  | "cancelled";

export type AsyncJobJsonRecord = Record<string, JsonSafeValue>;

export type AsyncJobIdSeed = {
  namespace?: string;
  kind?: string;
  adapterId?: string;
  toolId?: string;
  payload?: unknown;
  meta?: unknown;
  salt?: string;
};

export type AsyncJobEnqueueInput = {
  id?: string;
  kind: string;
  adapterId?: string;
  toolId?: string;
  payload?: unknown;
  meta?: unknown;
  createdAt?: number;
  salt?: string;
};

export type AsyncJobStartInput = {
  startedAt?: number;
  meta?: unknown;
};

export type AsyncJobSucceedInput = {
  completedAt?: number;
  result?: unknown;
  meta?: unknown;
};

export type AsyncJobFailInput = {
  completedAt?: number;
  errorCode: string;
  errorMessage: string;
  errorDetails?: unknown;
  meta?: unknown;
};

export type AsyncJobCancelInput = {
  completedAt?: number;
  reason?: string;
  meta?: unknown;
};

export type AsyncJobErrorInfo = {
  code: string;
  message: string;
  details: JsonSafeValue | null;
};

export type AsyncJobRecord = {
  id: string;
  kind: string;
  adapterId: string | null;
  toolId: string | null;
  status: AsyncJobStatus;
  payload: JsonSafeValue | null;
  meta: AsyncJobJsonRecord;
  result: JsonSafeValue | null;
  error: AsyncJobErrorInfo | null;
  cancelReason: string | null;
  createdAt: number;
  updatedAt: number;
  startedAt: number | null;
  completedAt: number | null;
};

export type AsyncJobHistoryEntry = {
  sequence: number;
  jobId: string;
  transition: AsyncJobTransitionType;
  fromStatus: AsyncJobStatus | null;
  toStatus: AsyncJobStatus;
  at: number;
  detail: AsyncJobJsonRecord;
};

export type AsyncJobSnapshot = AsyncJobRecord;
export type AsyncJobHistorySnapshot = AsyncJobHistoryEntry;

export type AsyncJobListInput = {
  statuses?: AsyncJobStatus | readonly AsyncJobStatus[];
  limit?: number;
  newestFirst?: boolean;
};

export type AsyncJobOrchestratorSnapshot = {
  jobs: AsyncJobSnapshot[];
  history: AsyncJobHistorySnapshot[];
};

export type AsyncJobMutationErrorCode =
  | "job-not-found"
  | "job-already-exists"
  | "invalid-transition";

export type AsyncJobMutationError = {
  ok: false;
  code: AsyncJobMutationErrorCode;
  message: string;
  jobId?: string;
  status?: AsyncJobStatus;
};

export type AsyncJobMutationSuccess = {
  ok: true;
  job: AsyncJobSnapshot;
  historyEntry: AsyncJobHistorySnapshot | null;
};

export type AsyncJobMutationResult =
  | AsyncJobMutationSuccess
  | AsyncJobMutationError;

export type AsyncJobOrchestratorOptions = {
  historyLimit?: number;
  now?: () => number;
};

export type AsyncJobOrchestrator = {
  enqueue: (input: AsyncJobEnqueueInput) => AsyncJobMutationResult;
  start: (jobId: string, input?: AsyncJobStartInput) => AsyncJobMutationResult;
  succeed: (jobId: string, input?: AsyncJobSucceedInput) => AsyncJobMutationResult;
  fail: (jobId: string, input: AsyncJobFailInput) => AsyncJobMutationResult;
  cancel: (jobId: string, input?: AsyncJobCancelInput) => AsyncJobMutationResult;
  get: (jobId: string) => AsyncJobSnapshot | null;
  list: (input?: AsyncJobListInput) => AsyncJobSnapshot[];
  listHistory: (limit?: number) => AsyncJobHistorySnapshot[];
  getSnapshot: () => AsyncJobOrchestratorSnapshot;
};
