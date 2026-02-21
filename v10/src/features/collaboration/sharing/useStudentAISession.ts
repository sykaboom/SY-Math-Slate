"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { SessionPolicy } from "@core/foundation/types/sessionPolicy";

import type { UseParticipantSessionState } from "./useParticipantSession";

export type StudentAIRequestStatus =
  | "pending_teacher_approval"
  | "forwarded_to_student"
  | "rejected";

export type StudentAIRequestEntry = {
  proposalId: string;
  question: string;
  status: StudentAIRequestStatus;
  response: string | null;
  reason: string | null;
  createdAt: number;
  updatedAt: number;
};

export type UseStudentAISessionOptions = {
  participantSession: UseParticipantSessionState;
  sessionPolicy: SessionPolicy;
};

export type UseStudentAISessionState = {
  canUseAI: boolean;
  draft: string;
  isSubmitting: boolean;
  connectionState: UseParticipantSessionState["connectionState"];
  entries: StudentAIRequestEntry[];
  latestEntry: StudentAIRequestEntry | null;
  error: string | null;
  setDraft: (value: string) => void;
  submitQuestion: (question?: string) => Promise<boolean>;
  clearError: () => void;
};

const normalizeText = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const toTimestamp = (value: number): number => {
  if (!Number.isFinite(value)) return Date.now();
  return Math.max(0, Math.floor(value));
};

const upsertEntry = (
  entries: StudentAIRequestEntry[],
  nextEntry: StudentAIRequestEntry
): StudentAIRequestEntry[] => {
  const index = entries.findIndex((entry) => entry.proposalId === nextEntry.proposalId);
  if (index < 0) {
    return [nextEntry, ...entries].sort((a, b) => b.updatedAt - a.updatedAt);
  }

  const next = [...entries];
  next[index] = nextEntry;
  return next.sort((a, b) => b.updatedAt - a.updatedAt);
};

export const useStudentAISession = (
  options: UseStudentAISessionOptions
): UseStudentAISessionState => {
  const [draft, setDraft] = useState("");
  const [entries, setEntries] = useState<StudentAIRequestEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canUseAI = options.sessionPolicy.proposalRules.ai_question !== "denied";

  useEffect(() => {
    const aiProposals = options.participantSession.proposals.filter(
      (proposal) => proposal.proposalType === "ai_question"
    );
    if (aiProposals.length === 0) return;

    setEntries((previous) => {
      let next = previous;
      aiProposals.forEach((proposal) => {
        const current =
          next.find((entry) => entry.proposalId === proposal.proposalId) ?? null;
        if (!current) return;

        const status: StudentAIRequestStatus =
          proposal.status === "approved" ? "forwarded_to_student" : "rejected";
        const response =
          proposal.status === "approved" ? normalizeText(proposal.reason) : null;

        next = upsertEntry(next, {
          ...current,
          status,
          response,
          reason: normalizeText(proposal.reason),
          updatedAt: toTimestamp(proposal.updatedAt),
        });
      });
      return next;
    });
  }, [options.participantSession.proposals]);

  const submitQuestion = useCallback(
    async (questionOverride?: string): Promise<boolean> => {
      if (!canUseAI) {
        setError("AI question is disabled in this session policy.");
        return false;
      }

      const question = normalizeText(questionOverride ?? draft);
      if (!question) {
        setError("질문을 입력해 주세요.");
        return false;
      }

      setIsSubmitting(true);
      setError(null);

      try {
        const proposalId = options.participantSession.submitProposal({
          proposalType: "ai_question",
          payload: {
            question,
            createdAt: Date.now(),
          },
        });

        if (!proposalId) {
          setError("질문 전송에 실패했습니다. 연결 상태를 확인해 주세요.");
          return false;
        }

        const now = Date.now();
        setEntries((previous) =>
          upsertEntry(previous, {
            proposalId,
            question,
            status: "pending_teacher_approval",
            response: null,
            reason: null,
            createdAt: now,
            updatedAt: now,
          })
        );
        if (!questionOverride) {
          setDraft("");
        }
        return true;
      } finally {
        setIsSubmitting(false);
      }
    },
    [canUseAI, draft, options.participantSession]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const latestEntry = useMemo(() => entries[0] ?? null, [entries]);

  return {
    canUseAI,
    draft,
    isSubmitting,
    connectionState: options.participantSession.connectionState,
    entries,
    latestEntry,
    error,
    setDraft,
    submitQuestion,
    clearError,
  };
};
