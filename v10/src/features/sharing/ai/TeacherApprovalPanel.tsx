"use client";

import { useMemo, useState } from "react";

import type { QuestionState } from "@core/types/aiApproval";
import { useTeacherApprovalQueue } from "@features/sharing/useTeacherApprovalQueue";

import { ReAskPresetBar } from "./ReAskPresetBar";

const formatTime = (value: number): string => {
  if (!Number.isFinite(value)) return "unknown";
  try {
    return new Date(value).toLocaleTimeString();
  } catch {
    return "unknown";
  }
};

const STATE_LABEL: Record<QuestionState, string> = {
  awaiting_teacher_approval: "Awaiting Approval",
  approved_sending_to_llm: "Calling LLM",
  awaiting_teacher_review: "Awaiting Review",
  forwarded_to_student: "Forwarded",
  rejected: "Rejected",
};

const normalizeText = (value: string): string => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : "";
};

export function TeacherApprovalPanel() {
  const {
    entries,
    counts,
    approveQuestion,
    forwardToStudent,
    rejectQuestion,
    reAskWithPreset,
    isEntryBusy,
    getEntryError,
  } = useTeacherApprovalQueue();
  const [questionDraftById, setQuestionDraftById] = useState<Record<string, string>>({});
  const [responseDraftById, setResponseDraftById] = useState<Record<string, string>>({});

  const panelHint = useMemo(() => {
    if (entries.length === 0) return "No pending AI question approvals.";
    return `${counts.awaitingTeacherApproval} waiting approval · ${counts.awaitingTeacherReview} waiting review`;
  }, [counts.awaitingTeacherApproval, counts.awaitingTeacherReview, entries.length]);

  return (
    <section className="rounded-xl border border-toolbar-border/10 bg-toolbar-chip/5 p-2.5">
      <header className="mb-2 flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-toolbar-muted/65">
            Teacher AI Queue
          </p>
          <p className="text-[11px] text-toolbar-muted/70">{panelHint}</p>
        </div>
      </header>

      {entries.length === 0 ? (
        <p className="rounded-md border border-toolbar-border/10 bg-toolbar-chip/5 px-2 py-2 text-[11px] text-toolbar-muted/70">
          No pending AI question approvals.
        </p>
      ) : (
        <ul className="grid max-h-[420px] gap-2 overflow-y-auto pr-1">
          {entries.map((entry) => {
            const queueId = entry.id;
            const loading = isEntryBusy(queueId);
            const errorText = getEntryError(queueId);
            const questionDraft =
              questionDraftById[queueId] ??
              entry.modifiedQuestion ??
              entry.question;
            const responseDraft =
              responseDraftById[queueId] ??
              entry.modifiedResponse ??
              entry.llmResponse ??
              "";

            return (
              <li
                key={queueId}
                className="rounded-lg border border-toolbar-border/10 bg-toolbar-surface/30 p-2"
              >
                <div className="mb-1 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-medium text-toolbar-text/90">
                      Student {entry.actorId.slice(0, 8)}
                    </p>
                    <p className="text-[10px] text-toolbar-muted/60">
                      {formatTime(entry.createdAt)}
                    </p>
                  </div>
                  <span className="rounded-full border border-toolbar-border/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-toolbar-muted/75">
                    {STATE_LABEL[entry.state]}
                  </span>
                </div>

                <label className="mb-1.5 block text-[10px] uppercase tracking-wide text-toolbar-muted/60">
                  Question
                </label>
                <textarea
                  className="min-h-16 w-full resize-y rounded-md border border-toolbar-border/15 bg-toolbar-surface/40 px-2 py-1.5 text-[12px] text-toolbar-text outline-none ring-0 focus:border-toolbar-border/40"
                  value={questionDraft}
                  onChange={(event) =>
                    setQuestionDraftById((previous) => ({
                      ...previous,
                      [queueId]: event.target.value,
                    }))
                  }
                  disabled={loading || entry.state !== "awaiting_teacher_approval"}
                />

                {entry.state === "awaiting_teacher_review" ||
                entry.state === "approved_sending_to_llm" ? (
                  <>
                    <label className="mb-1 mt-2 block text-[10px] uppercase tracking-wide text-toolbar-muted/60">
                      AI Response
                    </label>
                    <textarea
                      className="min-h-16 w-full resize-y rounded-md border border-toolbar-border/15 bg-toolbar-surface/40 px-2 py-1.5 text-[12px] text-toolbar-text outline-none ring-0 focus:border-toolbar-border/40"
                      value={responseDraft}
                      onChange={(event) =>
                        setResponseDraftById((previous) => ({
                          ...previous,
                          [queueId]: event.target.value,
                        }))
                      }
                      disabled={loading || entry.state === "approved_sending_to_llm"}
                    />
                  </>
                ) : null}

                {entry.state === "awaiting_teacher_approval" ? (
                  <div className="mt-2 flex items-center gap-1.5">
                    <button
                      type="button"
                      className="rounded-md border border-toolbar-border/20 bg-toolbar-chip/20 px-2 py-1 text-[11px] text-toolbar-text transition-colors hover:bg-toolbar-chip/30 disabled:cursor-not-allowed disabled:opacity-45"
                      onClick={() => {
                        void approveQuestion(queueId, {
                          modifiedQuestion:
                            normalizeText(questionDraft) !==
                            normalizeText(entry.question)
                              ? questionDraft
                              : undefined,
                        });
                      }}
                      disabled={loading}
                    >
                      Approve + Ask LLM
                    </button>
                    <button
                      type="button"
                      className="rounded-md border border-toolbar-border/20 bg-transparent px-2 py-1 text-[11px] text-toolbar-text/80 transition-colors hover:bg-toolbar-chip/15 disabled:cursor-not-allowed disabled:opacity-45"
                      onClick={() => {
                        rejectQuestion(queueId);
                      }}
                      disabled={loading}
                    >
                      Reject
                    </button>
                  </div>
                ) : null}

                {entry.state === "approved_sending_to_llm" ? (
                  <p className="mt-2 text-[11px] text-toolbar-muted/70">
                    LLM call in progress...
                  </p>
                ) : null}

                {entry.state === "awaiting_teacher_review" ? (
                  <div className="mt-2 grid gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        className="rounded-md border border-toolbar-border/20 bg-toolbar-chip/20 px-2 py-1 text-[11px] text-toolbar-text transition-colors hover:bg-toolbar-chip/30 disabled:cursor-not-allowed disabled:opacity-45"
                        onClick={() => {
                          forwardToStudent(
                            queueId,
                            normalizeText(responseDraft) !==
                              normalizeText(entry.llmResponse ?? "")
                              ? { modifiedResponse: responseDraft }
                              : undefined
                          );
                        }}
                        disabled={loading}
                      >
                        Forward
                      </button>
                      <button
                        type="button"
                        className="rounded-md border border-toolbar-border/20 bg-transparent px-2 py-1 text-[11px] text-toolbar-text/80 transition-colors hover:bg-toolbar-chip/15 disabled:cursor-not-allowed disabled:opacity-45"
                        onClick={() => {
                          rejectQuestion(queueId);
                        }}
                        disabled={loading}
                      >
                        Reject
                      </button>
                    </div>
                    <ReAskPresetBar
                      disabled={loading}
                      onSelect={(preset) => {
                        void reAskWithPreset(queueId, preset.prompt);
                      }}
                    />
                  </div>
                ) : null}

                {errorText ? (
                  <p className="mt-2 text-[11px] text-rose-200">{errorText}</p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
