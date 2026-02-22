"use client";

import { type KeyboardEvent } from "react";

import type { UseStudentAISessionState } from "@features/collaboration/sharing/useStudentAISession";

type StudentAIPromptBarProps = {
  session: UseStudentAISessionState;
};

const CONNECTION_LABEL: Record<
  UseStudentAISessionState["connectionState"],
  string
> = {
  idle: "Idle",
  disabled: "Disabled",
  connecting: "Connecting",
  open: "Connected",
  closed: "Closed",
  error: "Error",
};

const STATUS_LABEL: Record<
  NonNullable<UseStudentAISessionState["latestEntry"]>["status"],
  string
> = {
  pending_teacher_approval: "Teacher review pending",
  forwarded_to_student: "Teacher forwarded response",
  rejected: "Teacher rejected",
};

export function StudentAIPromptBar({ session }: StudentAIPromptBarProps) {
  if (!session.canUseAI) return null;

  const handleSubmit = () => {
    void session.submitQuestion();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    if (session.isSubmitting) return;
    void session.submitQuestion();
  };

  return (
    <section className="w-full rounded-lg border border-theme-border/20 bg-theme-surface/55 p-2.5">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-theme-text/85">Ask Teacher AI</p>
        <span className="text-[10px] text-theme-text/55">
          {CONNECTION_LABEL[session.connectionState]}
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <textarea
          value={session.draft}
          onChange={(event) => session.setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="질문을 입력하고 Enter로 전송"
          className="min-h-16 w-full resize-y rounded-md border border-theme-border/20 bg-theme-surface-soft/60 px-2 py-1.5 text-xs text-theme-text outline-none ring-0 focus:border-theme-border/40"
          disabled={session.isSubmitting || session.connectionState !== "open"}
        />
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            className="rounded-md border border-theme-border/25 bg-theme-surface-soft px-2.5 py-1 text-xs text-theme-text/85 transition-colors hover:bg-theme-surface/40 disabled:cursor-not-allowed disabled:opacity-45"
            onClick={handleSubmit}
            disabled={session.isSubmitting || session.connectionState !== "open"}
          >
            {session.isSubmitting ? "Sending..." : "Send Question"}
          </button>
          {session.latestEntry ? (
            <span className="text-[10px] text-theme-text/60">
              {STATUS_LABEL[session.latestEntry.status]}
            </span>
          ) : null}
        </div>
      </div>

      {session.error ? (
        <p className="mt-1.5 text-[11px] text-[var(--theme-danger)]">
          {session.error}
        </p>
      ) : null}

      {session.latestEntry?.response ? (
        <div className="mt-2 rounded-md border border-theme-border/15 bg-theme-surface-soft/40 px-2 py-1.5">
          <p className="text-[10px] uppercase tracking-wide text-theme-text/55">
            Latest Response
          </p>
          <p className="mt-1 whitespace-pre-wrap text-xs text-theme-text/85">
            {session.latestEntry.response}
          </p>
        </div>
      ) : null}
    </section>
  );
}
