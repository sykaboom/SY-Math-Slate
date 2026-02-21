"use client";

import { useCallback, useMemo, useState } from "react";

import { callLLMThroughApi } from "@features/collaboration/sharing/ai/LLMCallService";
import {
  useSyncStore,
  type PendingAIQueueEntry,
  type QueueEntryStatus,
} from "@features/platform/store/useSyncStore";

export const AI_QUESTION_QUEUE_TYPE = "ai_question" as const;

export type TeacherApprovalState =
  | "awaiting_teacher_approval"
  | "approved_sending_to_llm"
  | "awaiting_teacher_review"
  | "forwarded_to_student"
  | "rejected";

type QuestionPayload = {
  actorId: string;
  question: string;
  modifiedQuestion: string | null;
  llmResponse: string | null;
  modifiedResponse: string | null;
  state: TeacherApprovalState;
  createdAt: number;
  updatedAt: number;
};

export type TeacherApprovalQueueEntry = {
  id: string;
  actorId: string;
  question: string;
  modifiedQuestion: string | null;
  llmResponse: string | null;
  modifiedResponse: string | null;
  state: TeacherApprovalState;
  createdAt: number;
  updatedAt: number;
  status: QueueEntryStatus;
  queueEntry: PendingAIQueueEntry;
};

export type TeacherApprovalCounts = {
  total: number;
  awaitingTeacherApproval: number;
  awaitingTeacherReview: number;
  sendingToLLM: number;
};

type UseTeacherApprovalQueueResult = {
  entries: TeacherApprovalQueueEntry[];
  counts: TeacherApprovalCounts;
  approveQuestion: (
    id: string,
    options?: { modifiedQuestion?: string | null }
  ) => Promise<void>;
  rejectQuestion: (id: string) => void;
  forwardToStudent: (
    id: string,
    options?: { modifiedResponse?: string | null }
  ) => void;
  reAskWithPreset: (id: string, presetInstruction: string | null) => Promise<void>;
  isEntryBusy: (id: string) => boolean;
  getEntryError: (id: string) => string | null;
};

type QueueUpdateInput = {
  state: TeacherApprovalState;
  status?: QueueEntryStatus;
  modifiedQuestion?: string | null;
  llmResponse?: string | null;
  modifiedResponse?: string | null;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asText = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const asTimestamp = (value: unknown, fallback: number): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.max(0, Math.floor(value));
};

const isTeacherState = (value: unknown): value is TeacherApprovalState =>
  value === "awaiting_teacher_approval" ||
  value === "approved_sending_to_llm" ||
  value === "awaiting_teacher_review" ||
  value === "forwarded_to_student" ||
  value === "rejected";

const toPayload = (
  payload: unknown,
  fallbackCreatedAt: number
): QuestionPayload | null => {
  if (!isRecord(payload)) return null;
  const question = asText(payload.question);
  if (!question) return null;
  const llmResponse = asText(payload.llmResponse) ?? asText(payload.response);
  const defaultState: TeacherApprovalState = llmResponse
    ? "awaiting_teacher_review"
    : "awaiting_teacher_approval";
  const state = isTeacherState(payload.state) ? payload.state : defaultState;
  const createdAt = asTimestamp(payload.createdAt, fallbackCreatedAt);
  return {
    actorId: asText(payload.actorId) ?? "student",
    question,
    modifiedQuestion: asText(payload.modifiedQuestion),
    llmResponse,
    modifiedResponse: asText(payload.modifiedResponse),
    state,
    createdAt,
    updatedAt: asTimestamp(payload.updatedAt, createdAt),
  };
};

const isAIQuestionQueueEntry = (entry: PendingAIQueueEntry): boolean => {
  if (!isRecord(entry.meta)) return false;
  return entry.meta.queueType === AI_QUESTION_QUEUE_TYPE;
};

const toEntry = (entry: PendingAIQueueEntry): TeacherApprovalQueueEntry | null => {
  if (!isAIQuestionQueueEntry(entry)) return null;
  const payload = toPayload(entry.payload, entry.createdAt);
  if (!payload) return null;
  return {
    id: entry.id,
    actorId: payload.actorId,
    question: payload.question,
    modifiedQuestion: payload.modifiedQuestion,
    llmResponse: payload.llmResponse,
    modifiedResponse: payload.modifiedResponse,
    state: payload.state,
    createdAt: payload.createdAt,
    updatedAt: payload.updatedAt,
    status: entry.status,
    queueEntry: entry,
  };
};

const sanitizeOptionalText = (value: string | null | undefined): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const updateEntry = (
  queueEntry: PendingAIQueueEntry,
  parsed: TeacherApprovalQueueEntry,
  input: QueueUpdateInput
): PendingAIQueueEntry => {
  const payloadBase = isRecord(queueEntry.payload) ? { ...queueEntry.payload } : {};
  return {
    ...queueEntry,
    status: input.status ?? queueEntry.status,
    payload: {
      ...payloadBase,
      actorId: parsed.actorId,
      question: parsed.question,
      modifiedQuestion:
        input.modifiedQuestion !== undefined
          ? sanitizeOptionalText(input.modifiedQuestion)
          : parsed.modifiedQuestion,
      llmResponse:
        input.llmResponse !== undefined
          ? sanitizeOptionalText(input.llmResponse)
          : parsed.llmResponse,
      modifiedResponse:
        input.modifiedResponse !== undefined
          ? sanitizeOptionalText(input.modifiedResponse)
          : parsed.modifiedResponse,
      state: input.state,
      createdAt: parsed.createdAt,
      updatedAt: Date.now(),
    },
  };
};

const toPrompt = (question: string, instruction: string | null): string => {
  if (!instruction) return question;
  return `${instruction}\n\n${question}`;
};

const buildCounts = (entries: TeacherApprovalQueueEntry[]): TeacherApprovalCounts =>
  entries.reduce<TeacherApprovalCounts>(
    (acc, entry) => {
      acc.total += 1;
      if (entry.state === "awaiting_teacher_approval") acc.awaitingTeacherApproval += 1;
      if (entry.state === "awaiting_teacher_review") acc.awaitingTeacherReview += 1;
      if (entry.state === "approved_sending_to_llm") acc.sendingToLLM += 1;
      return acc;
    },
    {
      total: 0,
      awaitingTeacherApproval: 0,
      awaitingTeacherReview: 0,
      sendingToLLM: 0,
    }
  );

export function useTeacherApprovalQueue(): UseTeacherApprovalQueueResult {
  const queue = useSyncStore((state) => state.pendingAIQueue);
  const getQueueEntry = useSyncStore((state) => state.getQueueEntry);
  const replaceQueueEntry = useSyncStore((state) => state.replaceQueueEntry);
  const markApproved = useSyncStore((state) => state.markApproved);
  const markRejected = useSyncStore((state) => state.markRejected);
  const removeQueueEntry = useSyncStore((state) => state.removeQueueEntry);

  const [busyById, setBusyById] = useState<Record<string, true>>({});
  const [errorById, setErrorById] = useState<Record<string, string>>({});

  const setBusy = useCallback((id: string, value: boolean) => {
    setBusyById((previous) => {
      if (value) {
        if (previous[id]) return previous;
        return { ...previous, [id]: true };
      }
      if (!previous[id]) return previous;
      const next = { ...previous };
      delete next[id];
      return next;
    });
  }, []);

  const setError = useCallback((id: string, message: string) => {
    setErrorById((previous) => ({ ...previous, [id]: message }));
  }, []);

  const clearError = useCallback((id: string) => {
    setErrorById((previous) => {
      if (!previous[id]) return previous;
      const next = { ...previous };
      delete next[id];
      return next;
    });
  }, []);

  const entries = useMemo(
    () =>
      queue
        .map((entry) => toEntry(entry))
        .filter((entry): entry is TeacherApprovalQueueEntry => entry !== null)
        .filter(
          (entry) => entry.state !== "forwarded_to_student" && entry.state !== "rejected"
        )
        .sort((a, b) => b.updatedAt - a.updatedAt),
    [queue]
  );

  const counts = useMemo(() => buildCounts(entries), [entries]);

  const approveQuestion = useCallback(
    async (id: string, options?: { modifiedQuestion?: string | null }) => {
      const queueEntry = getQueueEntry(id);
      const parsed = queueEntry ? toEntry(queueEntry) : null;
      if (!queueEntry || !parsed || parsed.state !== "awaiting_teacher_approval") return;

      const nextQuestion =
        sanitizeOptionalText(options?.modifiedQuestion) ??
        parsed.modifiedQuestion ??
        parsed.question;

      clearError(id);
      setBusy(id, true);

      markApproved(id);
      replaceQueueEntry(
        updateEntry(queueEntry, parsed, {
          state: "approved_sending_to_llm",
          status: "approved",
          modifiedQuestion:
            sanitizeOptionalText(options?.modifiedQuestion) ?? parsed.modifiedQuestion,
        })
      );

      const llmResult = await callLLMThroughApi({
        prompt: toPrompt(nextQuestion, null),
      });

      if (!llmResult.ok) {
        const latest = getQueueEntry(id);
        const latestParsed = latest ? toEntry(latest) : null;
        if (latest && latestParsed) {
          replaceQueueEntry(
            updateEntry(latest, latestParsed, {
              state: "awaiting_teacher_approval",
              status: "pending",
            })
          );
        }
        setError(id, llmResult.message);
        setBusy(id, false);
        return;
      }

      const latest = getQueueEntry(id);
      const latestParsed = latest ? toEntry(latest) : null;
      if (latest && latestParsed) {
        replaceQueueEntry(
          updateEntry(latest, latestParsed, {
            state: "awaiting_teacher_review",
            status: "approved",
            llmResponse: llmResult.text,
            modifiedResponse: null,
          })
        );
      }

      setBusy(id, false);
    },
    [clearError, getQueueEntry, markApproved, replaceQueueEntry, setBusy, setError]
  );

  const reAskWithPreset = useCallback(
    async (id: string, presetInstruction: string | null) => {
      const queueEntry = getQueueEntry(id);
      const parsed = queueEntry ? toEntry(queueEntry) : null;
      if (!queueEntry || !parsed || parsed.state !== "awaiting_teacher_review") return;

      clearError(id);
      setBusy(id, true);

      replaceQueueEntry(
        updateEntry(queueEntry, parsed, {
          state: "approved_sending_to_llm",
          status: "approved",
        })
      );

      const llmResult = await callLLMThroughApi({
        prompt: toPrompt(
          parsed.modifiedQuestion ?? parsed.question,
          sanitizeOptionalText(presetInstruction)
        ),
      });

      if (!llmResult.ok) {
        const latest = getQueueEntry(id);
        const latestParsed = latest ? toEntry(latest) : null;
        if (latest && latestParsed) {
          replaceQueueEntry(
            updateEntry(latest, latestParsed, {
              state: "awaiting_teacher_review",
              status: "approved",
            })
          );
        }
        setError(id, llmResult.message);
        setBusy(id, false);
        return;
      }

      const latest = getQueueEntry(id);
      const latestParsed = latest ? toEntry(latest) : null;
      if (latest && latestParsed) {
        replaceQueueEntry(
          updateEntry(latest, latestParsed, {
            state: "awaiting_teacher_review",
            status: "approved",
            llmResponse: llmResult.text,
            modifiedResponse: null,
          })
        );
      }

      setBusy(id, false);
    },
    [clearError, getQueueEntry, replaceQueueEntry, setBusy, setError]
  );

  const forwardToStudent = useCallback(
    (id: string, options?: { modifiedResponse?: string | null }) => {
      const queueEntry = getQueueEntry(id);
      const parsed = queueEntry ? toEntry(queueEntry) : null;
      if (!queueEntry || !parsed || parsed.state !== "awaiting_teacher_review") return;

      clearError(id);
      replaceQueueEntry(
        updateEntry(queueEntry, parsed, {
          state: "forwarded_to_student",
          status: "approved",
          modifiedResponse: sanitizeOptionalText(options?.modifiedResponse),
        })
      );
      removeQueueEntry(id);
      setBusy(id, false);
    },
    [clearError, getQueueEntry, removeQueueEntry, replaceQueueEntry, setBusy]
  );

  const rejectQuestion = useCallback(
    (id: string) => {
      const queueEntry = getQueueEntry(id);
      const parsed = queueEntry ? toEntry(queueEntry) : null;
      if (!queueEntry || !parsed) return;
      clearError(id);
      markRejected(id);
      replaceQueueEntry(
        updateEntry(queueEntry, parsed, {
          state: "rejected",
          status: "rejected",
        })
      );
      removeQueueEntry(id);
      setBusy(id, false);
    },
    [clearError, getQueueEntry, markRejected, removeQueueEntry, replaceQueueEntry, setBusy]
  );

  const isEntryBusy = useCallback((id: string) => Boolean(busyById[id]), [busyById]);
  const getEntryError = useCallback(
    (id: string): string | null => errorById[id] ?? null,
    [errorById]
  );

  return {
    entries,
    counts,
    approveQuestion,
    rejectQuestion,
    forwardToStudent,
    reAskWithPreset,
    isEntryBusy,
    getEntryError,
  };
}
