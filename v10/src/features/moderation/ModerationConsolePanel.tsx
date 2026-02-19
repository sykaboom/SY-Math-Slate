"use client";

import { useEffect } from "react";

import { Button } from "@ui/components/button";

import { useModerationConsole } from "./useModerationConsole";

const formatTime = (value: number): string => {
  if (!Number.isFinite(value)) return "unknown";
  try {
    return new Date(value).toLocaleTimeString();
  } catch {
    return "unknown";
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const toAuditSummary = (payload: Record<string, unknown>): string => {
  const reportId = typeof payload.reportId === "string" ? payload.reportId : null;
  const decision = typeof payload.decision === "string" ? payload.decision : null;
  const status = typeof payload.status === "string" ? payload.status : null;

  if (reportId && decision) {
    return `${reportId} -> ${decision}${status ? ` (${status})` : ""}`;
  }
  if (reportId) return reportId;

  const commandId = typeof payload.commandId === "string" ? payload.commandId : null;
  if (commandId) return commandId;

  return "n/a";
};

export function ModerationConsolePanel() {
  const {
    isHost,
    isLoading,
    lastError,
    pendingRows,
    resolvedRows,
    pendingRightsClaims,
    resolvedRightsClaims,
    trafficSignals,
    safetyEvents,
    sloSummary,
    auditEvents,
    refresh,
    approveReport,
    rejectReport,
    approveRightsClaim,
    rejectRightsClaim,
  } = useModerationConsole();

  useEffect(() => {
    if (!isHost) return;
    void refresh();
  }, [isHost, refresh]);

  if (!isHost) return null;

  return (
    <section
      className="flex w-full max-w-sm flex-col gap-2 rounded-2xl border border-toolbar-border/10 bg-toolbar-surface/90 p-3 text-toolbar-text/70 shadow-[var(--toolbar-panel-shadow)]"
      aria-label="Moderation console"
    >
      <header className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-toolbar-muted/60">
            Moderation
          </p>
          <p className="text-xs text-toolbar-muted/70">
            {pendingRows.length} pending / {resolvedRows.length} resolved
          </p>
          <p className="text-xs text-toolbar-muted/70">
            rights {pendingRightsClaims.length} pending / {resolvedRightsClaims.length} resolved
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-9 border-toolbar-border/20 bg-transparent px-2 text-[11px] text-toolbar-text/80 hover:bg-toolbar-chip/15 hover:text-toolbar-text"
          onClick={() => {
            void refresh();
          }}
          disabled={isLoading}
        >
          Refresh
        </Button>
      </header>

      {lastError ? (
        <p className="rounded-xl border border-red-300/25 bg-red-500/10 px-3 py-2 text-[11px] text-red-100">
          {lastError.code}: {lastError.message}
        </p>
      ) : null}

      {pendingRows.length === 0 ? (
        <p className="rounded-xl border border-toolbar-border/10 bg-toolbar-chip/5 px-3 py-2 text-xs text-toolbar-muted/70">
          No pending reports.
        </p>
      ) : (
        <ul className="grid max-h-64 gap-2 overflow-y-auto pr-1">
          {pendingRows.map((row) => (
            <li
              key={row.report.id}
              className="rounded-xl border border-toolbar-border/10 bg-toolbar-chip/5 p-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-toolbar-text">
                    {row.report.id}
                  </p>
                  <p className="truncate text-[11px] text-toolbar-muted/70">
                    {row.targetSummary}
                  </p>
                  <p className="text-[10px] text-toolbar-muted/60">
                    reason: {row.report.reason}
                  </p>
                </div>
                <span className="rounded-full border border-toolbar-border/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-toolbar-muted/70">
                  {row.report.status}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                <Button
                  type="button"
                  size="sm"
                  className="h-7 bg-toolbar-chip/20 px-2 text-[11px] text-toolbar-text hover:bg-toolbar-chip/30"
                  onClick={() => {
                    void approveReport(row.report.id);
                  }}
                >
                  Approve
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 border-toolbar-border/20 bg-transparent px-2 text-[11px] text-toolbar-text/80 hover:bg-toolbar-chip/15 hover:text-toolbar-text"
                  onClick={() => {
                    void rejectReport(row.report.id);
                  }}
                >
                  Reject
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="border-t border-toolbar-border/10 pt-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-toolbar-muted/60">
          Rights Claims
        </p>
        {pendingRightsClaims.length === 0 ? (
          <p className="mt-1 text-[11px] text-toolbar-muted/70">
            No pending rights claims.
          </p>
        ) : (
          <ul className="mt-1 grid max-h-48 gap-2 overflow-y-auto pr-1">
            {pendingRightsClaims.map((row) => (
              <li
                key={row.claim.id}
                className="rounded-xl border border-toolbar-border/10 bg-toolbar-chip/5 p-2"
              >
                <p className="truncate text-xs font-medium text-toolbar-text">
                  {row.claim.id}
                </p>
                <p className="truncate text-[11px] text-toolbar-muted/70">
                  {row.targetSummary}
                </p>
                <p className="text-[10px] text-toolbar-muted/60">
                  type: {row.claim.claimType}
                </p>
                <div className="mt-2 flex items-center gap-1.5">
                  <Button
                    type="button"
                    size="sm"
                    className="h-7 bg-toolbar-chip/20 px-2 text-[11px] text-toolbar-text hover:bg-toolbar-chip/30"
                    onClick={() => {
                      void approveRightsClaim(row.claim.id);
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 border-toolbar-border/20 bg-transparent px-2 text-[11px] text-toolbar-text/80 hover:bg-toolbar-chip/15 hover:text-toolbar-text"
                    onClick={() => {
                      void rejectRightsClaim(row.claim.id);
                    }}
                  >
                    Reject
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-toolbar-border/10 pt-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-toolbar-muted/60">
          Trust/Safety SLO (24h)
        </p>
        {sloSummary ? (
          <div className="mt-1 rounded-lg border border-toolbar-border/10 bg-toolbar-chip/5 px-2 py-1 text-[10px] text-toolbar-muted/70">
            <p>pending reports: {sloSummary.pendingReports}</p>
            <p>pending rights claims: {sloSummary.pendingRightsClaims}</p>
            <p>elevated traffic: {sloSummary.elevatedTrafficSignals24h}</p>
            <p>blocked traffic: {sloSummary.blockedTrafficSignals24h}</p>
          </div>
        ) : (
          <p className="mt-1 text-[11px] text-toolbar-muted/70">No SLO snapshot.</p>
        )}
      </div>

      <div className="border-t border-toolbar-border/10 pt-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-toolbar-muted/60">
          UGC Safety Events
        </p>
        {safetyEvents.length === 0 ? (
          <p className="mt-1 text-[11px] text-toolbar-muted/70">No safety events.</p>
        ) : (
          <ul className="mt-1 grid max-h-40 gap-1 overflow-y-auto pr-1">
            {safetyEvents.slice(0, 20).map((event) => (
              <li
                key={event.id}
                className="rounded-lg border border-toolbar-border/10 bg-toolbar-chip/5 px-2 py-1"
              >
                <p className="truncate text-[11px] text-toolbar-text">
                  {event.action} · {event.verdict}
                  {event.category ? ` · ${event.category}` : ""}
                </p>
                <p className="truncate text-[10px] text-toolbar-muted/70">
                  actor {event.actorId}
                  {event.matchedTerm ? ` · term ${event.matchedTerm}` : ""}
                </p>
                <p className="text-[10px] text-toolbar-muted/60">
                  {formatTime(event.observedAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-toolbar-border/10 pt-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-toolbar-muted/60">
          Invalid Traffic Signals
        </p>
        {trafficSignals.length === 0 ? (
          <p className="mt-1 text-[11px] text-toolbar-muted/70">No traffic signals.</p>
        ) : (
          <ul className="mt-1 grid max-h-40 gap-1 overflow-y-auto pr-1">
            {trafficSignals.slice(0, 20).map((signal) => (
              <li
                key={signal.id}
                className="rounded-lg border border-toolbar-border/10 bg-toolbar-chip/5 px-2 py-1"
              >
                <p className="truncate text-[11px] text-toolbar-text">
                  {signal.action} · {signal.riskLevel}
                </p>
                <p className="truncate text-[10px] text-toolbar-muted/70">
                  {signal.reason} · count {signal.sampleCount}
                </p>
                <p className="text-[10px] text-toolbar-muted/60">
                  {formatTime(signal.observedAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-toolbar-border/10 pt-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-toolbar-muted/60">
          Approval/Audit Stream
        </p>
        {auditEvents.length === 0 ? (
          <p className="mt-1 text-[11px] text-toolbar-muted/70">No audit events.</p>
        ) : (
          <ul className="mt-1 grid max-h-40 gap-1 overflow-y-auto pr-1">
            {auditEvents.map((event, index) => {
              const payload = isRecord(event.payload) ? event.payload : {};
              return (
                <li
                  key={`${event.timestamp}:${event.eventType}:${event.correlationId}:${index}`}
                  className="rounded-lg border border-toolbar-border/10 bg-toolbar-chip/5 px-2 py-1"
                >
                  <p className="truncate text-[11px] text-toolbar-text">
                    {event.channel}:{event.eventType}
                  </p>
                  <p className="truncate text-[10px] text-toolbar-muted/70">
                    {toAuditSummary(payload)}
                  </p>
                  <p className="text-[10px] text-toolbar-muted/60">
                    {formatTime(event.timestamp)}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
