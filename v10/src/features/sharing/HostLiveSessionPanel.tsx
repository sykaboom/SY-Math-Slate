"use client";

import { useMemo } from "react";

import { TeacherApprovalPanel } from "@features/sharing/ai/TeacherApprovalPanel";
import { useHostPolicyEngine } from "@features/sharing/useHostPolicyEngine";
import { useHostSession } from "@features/sharing/useHostSession";
import { useHostShareStore } from "@features/store/useHostShareStore";
import { useSessionPolicyStore } from "@features/store/useSessionPolicyStore";

const formatTime = (value: number): string => {
  if (!Number.isFinite(value)) return "unknown";
  try {
    return new Date(value).toLocaleTimeString();
  } catch {
    return "unknown";
  }
};

const formatPayloadPreview = (value: unknown): string => {
  if (value === null || value === undefined) return "No payload.";
  if (typeof value === "string") {
    return value.length <= 180 ? value : `${value.slice(0, 177)}...`;
  }

  try {
    const serialized = JSON.stringify(value);
    if (serialized.length <= 180) return serialized;
    return `${serialized.slice(0, 177)}...`;
  } catch {
    return "Unserializable payload.";
  }
};

const resolveConnectionTone = (value: string): string => {
  if (value === "open") return "text-[var(--theme-success)]";
  if (value === "error") return "text-[var(--theme-danger)]";
  if (value === "connecting") return "text-theme-text/85";
  return "text-theme-text/75";
};

export function HostLiveSessionPanel() {
  const activeSession = useHostShareStore((state) => state.activeSession);
  const clearActiveSession = useHostShareStore((state) => state.clearActiveSession);
  const activePolicy = useSessionPolicyStore((state) => state.activePolicy);
  const policyRules = useMemo(
    () => Object.entries(activePolicy.proposalRules),
    [activePolicy.proposalRules]
  );
  const hasLiveSession =
    activeSession?.liveSession?.enabled === true &&
    Boolean(activeSession.liveSession.relayUrl);
  const shareId = activeSession?.shareId ?? null;
  const hostActorId = activeSession?.hostActorId ?? "host-live-session";
  const liveSession = activeSession?.liveSession ?? undefined;
  const enabled = hasLiveSession && Boolean(shareId);

  const { connectionState, publishSnapshot, endSession } = useHostSession({
    shareId,
    hostActorId,
    liveSession,
    enabled,
  });
  const {
    connectionState: policyConnectionState,
    pendingProposals,
    recentDecisions,
    approveProposal,
    rejectProposal,
  } = useHostPolicyEngine({
    shareId,
    hostActorId,
    policy: activePolicy,
    liveSession,
    enabled,
  });

  return (
    <section className="flex h-full min-h-0 w-full flex-col gap-3 overflow-y-auto p-3 text-theme-text">
      <header className="rounded-xl border border-theme-border/15 bg-theme-surface/35 p-2.5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-theme-text/70">
          Host Live Session
        </p>
        <div className="mt-2 grid gap-1 text-[11px] text-theme-text/70">
          <p>
            Broadcast:{" "}
            <span className={resolveConnectionTone(connectionState)}>
              {connectionState}
            </span>
          </p>
          <p>
            Policy bus:{" "}
            <span className={resolveConnectionTone(policyConnectionState)}>
              {policyConnectionState}
            </span>
          </p>
          <p className="truncate text-theme-text/55">
            Policy: {activePolicy.label} ({activePolicy.templateId})
          </p>
        </div>
      </header>

      {!activeSession ? (
        <p className="rounded-xl border border-theme-border/15 bg-theme-surface/30 px-3 py-2 text-[11px] text-theme-text/70">
          No active session. Create a share first to start a live host session.
        </p>
      ) : !hasLiveSession ? (
        <p className="rounded-xl border border-theme-border/20 bg-theme-surface-soft px-3 py-2 text-[11px] text-theme-text/75">
          Live relay is not configured for this share. Set
          `NEXT_PUBLIC_SHARE_LIVE_WS_URL` and create a new share.
        </p>
      ) : (
        <>
          <section className="rounded-xl border border-theme-border/15 bg-theme-surface/30 p-2.5">
            <div className="grid gap-1 text-[11px] text-theme-text/70">
              <p className="truncate">Share: {activeSession.shareId}</p>
              <p className="truncate">Host: {activeSession.hostActorId}</p>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                className="h-9 rounded-md border border-theme-border/20 bg-theme-surface-soft px-2.5 text-[11px] text-theme-text/85 hover:bg-theme-surface/40"
                onClick={() => {
                  publishSnapshot();
                }}
              >
                Publish Snapshot
              </button>
              <button
                type="button"
                className="h-9 rounded-md border border-theme-border/20 bg-theme-surface-soft px-2.5 text-[11px] text-theme-text/85 hover:bg-theme-surface/40"
                onClick={() => {
                  endSession();
                }}
              >
                End Session
              </button>
              <button
                type="button"
                className="h-9 rounded-md border border-theme-border/20 bg-transparent px-2.5 text-[11px] text-theme-text/75 hover:bg-theme-surface/30"
                onClick={clearActiveSession}
              >
                Clear
              </button>
            </div>
          </section>

          <section className="rounded-xl border border-theme-border/15 bg-theme-surface/30 p-2.5">
            <header className="mb-2 flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-theme-text/70">
                Pending Proposals
              </p>
              <span className="text-[11px] text-theme-text/55">
                {pendingProposals.length}
              </span>
            </header>
            {pendingProposals.length === 0 ? (
              <p className="rounded-md border border-theme-border/10 bg-theme-surface/20 px-2 py-2 text-[11px] text-theme-text/65">
                No pending proposals.
              </p>
            ) : (
              <ul className="grid max-h-[180px] gap-2 overflow-y-auto pr-1">
                {pendingProposals.map((proposal) => (
                  <li
                    key={proposal.proposalId}
                    className="rounded-md border border-theme-border/10 bg-theme-surface/20 p-2"
                  >
                    <p className="text-[11px] font-semibold text-theme-text/85">
                      {proposal.proposalType}
                    </p>
                    <p className="text-[10px] text-theme-text/60">
                      {proposal.actorId} · {formatTime(proposal.timestamp)}
                    </p>
                    <p className="mt-1 break-all text-[10px] text-theme-text/65">
                      {formatPayloadPreview(proposal.payload)}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <button
                        type="button"
                        className="h-8 rounded-md border border-theme-border/20 bg-theme-surface-soft px-2 text-[11px] text-theme-text/85 hover:bg-theme-surface/40"
                        onClick={() => {
                          approveProposal(proposal.proposalId);
                        }}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="h-8 rounded-md border border-theme-border/20 bg-transparent px-2 text-[11px] text-theme-text/75 hover:bg-theme-surface/30"
                        onClick={() => {
                          rejectProposal(proposal.proposalId);
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      <section className="rounded-xl border border-theme-border/15 bg-theme-surface/30 p-2.5">
        <header className="mb-2 flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-theme-text/70">
            Policy Rules
          </p>
          <span className="text-[11px] text-theme-text/55">
            recent {recentDecisions.length}
          </span>
        </header>
        <ul className="grid gap-1 text-[10px] text-theme-text/65">
          {policyRules.map(([proposalType, mode]) => (
            <li key={proposalType}>
              {proposalType}: {mode}
            </li>
          ))}
        </ul>
      </section>

      <TeacherApprovalPanel />
    </section>
  );
}
