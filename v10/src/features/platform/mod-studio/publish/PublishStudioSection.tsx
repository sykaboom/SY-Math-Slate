"use client";

import { useState } from "react";

import {
  preflightStudioPublish,
  publishStudioDraftBundle,
  rollbackStudioSnapshot,
} from "@features/platform/mod-studio/publish/publishStudioDraft";
import { emitAuditEvent } from "@features/platform/observability/auditLogger";
import { useModStudioStore } from "@features/platform/store/useModStudioStore";

export function PublishStudioSection() {
  const draft = useModStudioStore((state) => state.draft);
  const snapshots = useModStudioStore((state) => state.snapshots);
  const addSnapshot = useModStudioStore((state) => state.addSnapshot);
  const setDraftBundle = useModStudioStore((state) => state.setDraftBundle);
  const setLastPublishResult = useModStudioStore(
    (state) => state.setLastPublishResult
  );
  const lastPublishResult = useModStudioStore((state) => state.lastPublishResult);
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string>("");

  const handlePreflight = () => {
    const result = preflightStudioPublish(draft);
    emitAuditEvent(
      "publish",
      "studio-preflight",
      `studio-preflight-${Date.now()}`,
      {
        ok: result.ok,
        message: result.ok ? "passed" : result.message,
      }
    );
    setLastPublishResult(
      result.ok
        ? { ok: true, message: "preflight passed" }
        : { ok: false, message: result.message }
    );
  };

  const handlePublish = () => {
    addSnapshot("before publish");
    const result = publishStudioDraftBundle(draft);
    emitAuditEvent(
      "publish",
      "studio-publish",
      `studio-publish-${Date.now()}`,
      {
        ok: result.ok,
        message: result.message,
      }
    );
    setLastPublishResult(result);
  };

  const handleRollback = () => {
    const snapshot = snapshots.find((entry) => entry.id === selectedSnapshotId);
    if (!snapshot) {
      setLastPublishResult({ ok: false, message: "snapshot not selected" });
      return;
    }
    const result = rollbackStudioSnapshot(snapshot);
    if (result.ok) {
      setDraftBundle(snapshot.bundle);
    }
    emitAuditEvent(
      "publish",
      "studio-rollback",
      `studio-rollback-${Date.now()}`,
      {
        ok: result.ok,
        snapshotId: snapshot.id,
        message: result.message,
      }
    );
    setLastPublishResult(result);
  };

  return (
    <div className="grid gap-3 text-xs text-theme-text/85">
      <div className="text-[11px] uppercase tracking-[0.18em] text-theme-text/60">
        Publish & Rollback
      </div>

      <div className="rounded border border-theme-border/10 bg-theme-surface-soft px-2 py-1 text-[11px] text-theme-text/70">
        Active template pack:{" "}
        <span className="font-semibold text-theme-text/85">{draft.template.packId}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handlePreflight}
          className="rounded border border-theme-border/20 px-2 py-1 text-[11px] text-theme-text/80 hover:bg-theme-surface-soft"
        >
          Preflight
        </button>
        <button
          type="button"
          onClick={handlePublish}
          className="rounded border border-[var(--theme-success)] bg-[var(--theme-success-soft)] px-2 py-1 text-[11px] text-[var(--theme-text)] hover:bg-[var(--theme-success-soft)]"
        >
          Publish
        </button>
      </div>

      {lastPublishResult ? (
        <div
          className={
            lastPublishResult.ok
              ? "rounded border border-[var(--theme-success)] bg-[var(--theme-success-soft)] px-2 py-1.5 text-[var(--theme-text)]"
              : "rounded border border-[var(--theme-danger)] bg-[var(--theme-danger-soft)] px-2 py-1.5 text-[var(--theme-text)]"
          }
        >
          {lastPublishResult.message}
        </div>
      ) : null}

      <section className="grid gap-2 rounded border border-theme-border/10 bg-theme-surface-soft p-2">
        <div className="text-[11px] font-semibold text-theme-text/80">Snapshots</div>
        <select
          value={selectedSnapshotId}
          onChange={(event) => setSelectedSnapshotId(event.target.value)}
          className="rounded border border-theme-border/20 bg-theme-surface/40 px-2 py-1 text-xs text-theme-text"
        >
          <option value="">Select snapshot</option>
          {snapshots.map((snapshot) => (
            <option key={snapshot.id} value={snapshot.id}>
              {new Date(snapshot.createdAt).toISOString()} - {snapshot.reason}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleRollback}
          className="w-fit rounded border border-theme-border/20 px-2 py-1 text-[11px] text-theme-text/80 hover:bg-theme-surface-soft"
        >
          Rollback Selected
        </button>
      </section>
    </div>
  );
}
