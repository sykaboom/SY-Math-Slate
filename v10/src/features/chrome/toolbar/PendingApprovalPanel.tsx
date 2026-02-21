"use client";

import { TeacherApprovalPanel } from "@features/collaboration/sharing/ai/TeacherApprovalPanel";
import { Button } from "@ui/components/button";
import { useLocalStore } from "@features/platform/store/useLocalStore";
import {
  useSyncStore,
  type PendingAIQueueEntry,
} from "@features/platform/store/useSyncStore";

import { useApprovalLogic } from "./useApprovalLogic";

const formatCreatedAt = (value: number) => {
  if (!Number.isFinite(value)) return "unknown time";
  try {
    return new Date(value).toLocaleTimeString();
  } catch {
    return "unknown time";
  }
};

const isAIQuestionQueueEntry = (entry: PendingAIQueueEntry): boolean => {
  if (!entry.meta || typeof entry.meta !== "object") return false;
  if (Array.isArray(entry.meta)) return false;
  return entry.meta.queueType === "ai_question";
};

export function PendingApprovalPanel() {
  const role = useLocalStore((state) => state.role);
  const queue = useSyncStore((state) => state.pendingAIQueue);
  const { entries, approve, reject } = useApprovalLogic();

  if (role !== "host") return null;

  const pendingCount = queue.filter((entry) => entry.status === "pending").length;
  const aiPendingCount = queue.filter(
    (entry) => entry.status === "pending" && isAIQuestionQueueEntry(entry)
  ).length;
  const nonAiEntries = entries.filter(
    (entry) => !isAIQuestionQueueEntry(entry)
  );
  const nonAiQueueCount = queue.filter(
    (entry) => !isAIQuestionQueueEntry(entry)
  ).length;

  return (
    <section
      data-state={queue.length > 0 ? "pending" : "empty"}
      className="flex w-full max-w-sm flex-col gap-2 rounded-2xl border border-toolbar-border/10 bg-toolbar-surface/90 p-3 text-toolbar-text/70 shadow-[var(--toolbar-panel-shadow)]"
      aria-label="Pending approvals"
    >
      <header className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-toolbar-muted/60">
            Pending Queue
          </p>
          <p className="text-xs text-toolbar-muted/70">
            {pendingCount} pending / {queue.length} total
          </p>
          <p className="text-[10px] text-toolbar-muted/55">
            AI pending: {aiPendingCount}
          </p>
        </div>
      </header>

      <TeacherApprovalPanel />

      {nonAiEntries.length === 0 ? (
        <p
          data-state="empty"
          className="rounded-xl border border-toolbar-border/10 bg-toolbar-chip/5 px-3 py-2 text-xs text-toolbar-muted/70"
        >
          {nonAiQueueCount === 0
            ? "Nothing to approve."
            : "No non-AI approvals pending."}
        </p>
      ) : (
        <ul className="grid max-h-72 gap-2 overflow-y-auto pr-1">
          {nonAiEntries.map((entry) => (
            <li
              key={entry.id}
              data-state={entry.status}
              className="rounded-xl border border-toolbar-border/10 bg-toolbar-chip/5 p-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-toolbar-text">
                    {entry.toolId}
                  </p>
                  <p className="truncate text-[11px] text-toolbar-muted/70">
                    {entry.adapterId}
                  </p>
                  <p className="text-[10px] text-toolbar-muted/60">
                    {formatCreatedAt(entry.createdAt)}
                  </p>
                </div>
                <span className="rounded-full border border-toolbar-border/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-toolbar-muted/70">
                  {entry.status}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                <Button
                  type="button"
                  size="sm"
                  className="h-7 bg-toolbar-chip/20 px-2 text-[11px] text-toolbar-text hover:bg-toolbar-chip/30"
                  onClick={() => approve(entry.id)}
                >
                  Approve
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 border-toolbar-border/20 bg-transparent px-2 text-[11px] text-toolbar-text/80 hover:bg-toolbar-chip/15 hover:text-toolbar-text"
                  onClick={() => reject(entry.id)}
                >
                  Reject
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
