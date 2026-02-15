"use client";

import { useState } from "react";

import {
  preflightStudioPublish,
  publishStudioDraftBundle,
  rollbackStudioSnapshot,
} from "@features/mod-studio/publish/publishStudioDraft";
import { emitAuditEvent } from "@features/observability/auditLogger";
import { useModStudioStore } from "@features/store/useModStudioStore";

export function PublishStudioSection() {
  const {
    draft,
    snapshots,
    addSnapshot,
    setDraftBundle,
    setLastPublishResult,
    lastPublishResult,
  } = useModStudioStore((state) => ({
    draft: state.draft,
    snapshots: state.snapshots,
    addSnapshot: state.addSnapshot,
    setDraftBundle: state.setDraftBundle,
    setLastPublishResult: state.setLastPublishResult,
    lastPublishResult: state.lastPublishResult,
  }));
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
    <div className="grid gap-3 text-xs text-white/85">
      <div className="text-[11px] uppercase tracking-[0.18em] text-white/60">
        Publish & Rollback
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handlePreflight}
          className="rounded border border-white/20 px-2 py-1 text-[11px] text-white/80 hover:bg-white/10"
        >
          Preflight
        </button>
        <button
          type="button"
          onClick={handlePublish}
          className="rounded border border-emerald-400/40 bg-emerald-500/15 px-2 py-1 text-[11px] text-emerald-100 hover:bg-emerald-500/25"
        >
          Publish
        </button>
      </div>

      {lastPublishResult ? (
        <div
          className={
            lastPublishResult.ok
              ? "rounded border border-emerald-400/35 bg-emerald-500/10 px-2 py-1.5 text-emerald-100"
              : "rounded border border-rose-400/35 bg-rose-500/10 px-2 py-1.5 text-rose-100"
          }
        >
          {lastPublishResult.message}
        </div>
      ) : null}

      <section className="grid gap-2 rounded border border-white/10 bg-white/5 p-2">
        <div className="text-[11px] font-semibold text-white/80">Snapshots</div>
        <select
          value={selectedSnapshotId}
          onChange={(event) => setSelectedSnapshotId(event.target.value)}
          className="rounded border border-white/20 bg-black/40 px-2 py-1 text-xs text-white"
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
          className="w-fit rounded border border-white/20 px-2 py-1 text-[11px] text-white/80 hover:bg-white/10"
        >
          Rollback Selected
        </button>
      </section>
    </div>
  );
}
