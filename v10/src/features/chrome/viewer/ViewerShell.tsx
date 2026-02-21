"use client";

import { useEffect, useMemo, useState } from "react";

import {
  LECTURE_BROADCAST,
  cloneSessionPolicy,
  resolveSessionPolicyTemplate,
} from "@core/foundation/policies/sessionPolicyTemplates";
import type { PersistedCanvasV2, PersistedSlateDoc } from "@core/foundation/types/canvas";
import type { CanvasItem } from "@core/foundation/types/canvas";
import type { SessionPolicy } from "@core/foundation/types/sessionPolicy";
import { CanvasStage } from "@features/editor/canvas/CanvasStage";
import { StudentAIPromptBar } from "@features/collaboration/sharing/ai/StudentAIPromptBar";
import {
  applySnapshotScopeToCanvas,
  resolveSnapshotLayerIds,
} from "@features/collaboration/sharing/snapshotSerializer";
import { useParticipantSession } from "@features/collaboration/sharing/useParticipantSession";
import { useStudentAISession } from "@features/collaboration/sharing/useStudentAISession";
import { useCanvasStore } from "@features/platform/store/useCanvasStore";
import { useDocStore } from "@features/platform/store/useDocStore";

import { useViewerSession } from "./useViewerSession";

type ViewerShellProps = {
  shareId: string;
};

const formatDate = (value: number): string => {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Unknown date";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const getMaxStep = (
  pages: Record<string, CanvasItem[]>,
  stepBlockCount: number
): number => {
  if (stepBlockCount > 0) return stepBlockCount - 1;
  return Object.values(pages).reduce((max, items) => {
    return items.reduce((innerMax, item) => {
      if (item.type !== "text" && item.type !== "image") return innerMax;
      const mode = item.layoutMode ?? "flow";
      if (mode !== "flow") return innerMax;
      const stepIndex = typeof item.stepIndex === "number" ? item.stepIndex : 0;
      return Math.max(innerMax, stepIndex);
    }, max);
  }, -1);
};

const resolveSessionPolicy = (
  input: SessionPolicy | undefined
): SessionPolicy => {
  if (!input) return cloneSessionPolicy(LECTURE_BROADCAST);

  const fallback = resolveSessionPolicyTemplate(input.templateId);
  return cloneSessionPolicy({
    ...fallback,
    ...input,
    proposalRules: {
      ...fallback.proposalRules,
      ...input.proposalRules,
    },
  });
};

const toPersistedDoc = (canvas: PersistedCanvasV2): PersistedSlateDoc => {
  return {
    version: canvas.version,
    pages: canvas.pages,
    pageOrder: canvas.pageOrder,
    pageColumnCounts: canvas.pageColumnCounts,
    stepBlocks: canvas.stepBlocks,
    anchorMap: canvas.anchorMap,
    audioByStep: canvas.audioByStep,
    animationModInput: canvas.animationModInput,
  };
};

const normalizeSnapshotStep = (canvas: PersistedCanvasV2): number => {
  const safeStep = Number.isFinite(canvas.currentStep)
    ? Math.max(0, Math.floor(canvas.currentStep))
    : 0;
  const stepBlockCount = Array.isArray(canvas.stepBlocks)
    ? canvas.stepBlocks.length
    : 0;
  const maxStep = getMaxStep(canvas.pages, stepBlockCount);
  return Math.min(safeStep, Math.max(0, maxStep + 1));
};

const resolveSnapshotPageId = (canvas: PersistedCanvasV2): string => {
  if (canvas.currentPageId in canvas.pages) return canvas.currentPageId;
  return canvas.pageOrder[0] ?? Object.keys(canvas.pages)[0] ?? canvas.currentPageId;
};

export function ViewerShell({ shareId }: ViewerShellProps) {
  const session = useViewerSession(shareId);
  const [participantActorId] = useState(() => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    return `viewer-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  });
  const { pages, stepBlocks, currentStep, prevStep, nextStep } = useCanvasStore(
    (state) => ({
      pages: state.pages,
      stepBlocks: state.stepBlocks,
      currentStep: state.currentStep,
      prevStep: state.prevStep,
      nextStep: state.nextStep,
    })
  );
  const sessionPolicy = useMemo(
    () => resolveSessionPolicy(session.snapshot?.sessionPolicy),
    [session.snapshot?.sessionPolicy]
  );
  const scopedCanvas = useMemo(() => {
    if (session.status !== "ready" || !session.snapshot) return null;
    const layerIds = resolveSnapshotLayerIds({
      layerIds: session.snapshot.layerIds,
      layerId: session.snapshot.layerId,
    });
    return applySnapshotScopeToCanvas(session.snapshot.canvas, {
      scope: session.snapshot.scope,
      layerIds,
      layerId: session.snapshot.layerId,
    });
  }, [session.snapshot, session.status]);
  const participantSession = useParticipantSession({
    shareId: session.status === "ready" ? session.snapshot?.shareId ?? null : null,
    actorId: participantActorId,
    liveSession: session.status === "ready" ? session.snapshot?.liveSession : undefined,
    enabled: session.status === "ready" && session.source === "server",
  });
  const studentAISession = useStudentAISession({
    participantSession,
    sessionPolicy,
  });

  useEffect(() => {
    if (session.status !== "ready" || !session.snapshot || !scopedCanvas) return;

    if (scopedCanvas !== session.snapshot.canvas) {
      const persistedDoc = toPersistedDoc(scopedCanvas);
      useDocStore.getState().hydrateDoc(persistedDoc);
      useCanvasStore.getState().hydrate(persistedDoc);
    }

    useCanvasStore.setState(() => ({
      currentStep: normalizeSnapshotStep(scopedCanvas),
      currentPageId: resolveSnapshotPageId(scopedCanvas),
    }));
  }, [scopedCanvas, session.snapshot, session.status]);

  useEffect(() => {
    const blockMutationInput = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      if (
        "stopImmediatePropagation" in event &&
        typeof event.stopImmediatePropagation === "function"
      ) {
        event.stopImmediatePropagation();
      }
    };

    window.addEventListener("paste", blockMutationInput, true);
    window.addEventListener("drop", blockMutationInput, true);
    window.addEventListener("dragover", blockMutationInput, true);

    return () => {
      window.removeEventListener("paste", blockMutationInput, true);
      window.removeEventListener("drop", blockMutationInput, true);
      window.removeEventListener("dragover", blockMutationInput, true);
    };
  }, []);

  const maxStep = useMemo(
    () => getMaxStep(pages, stepBlocks.length),
    [pages, stepBlocks.length]
  );
  const canPrev = currentStep > 0;
  const canNext = currentStep <= maxStep;
  const totalSteps = Math.max(maxStep + 1, 0);
  const currentDisplay = totalSteps === 0 ? 0 : Math.min(currentStep + 1, totalSteps);
  const canRequestStepProposal =
    sessionPolicy.proposalRules.step_navigation !== "denied";
  const canSubmitStepProposal =
    canRequestStepProposal && participantSession.connectionState === "open";
  const latestProposalStatus = participantSession.latestProposal
    ? participantSession.latestProposal.status
    : null;

  const handleSubmitStepProposal = () => {
    if (!canSubmitStepProposal) return;
    participantSession.submitProposal({
      proposalType: "step_navigation",
      payload: {
        requestedStep: currentStep + 1,
      },
      baseVersion: currentStep,
    });
  };

  if (session.status === "loading") {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-slate-app text-theme-text/70">
        Loading snapshot...
      </div>
    );
  }

  if (session.status === "not_found") {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-slate-app px-4 text-center text-theme-text/70">
        Snapshot not found for this share link.
      </div>
    );
  }

  if (session.status === "error" || !session.snapshot) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-slate-app px-4 text-center text-theme-text/70">
        Failed to load snapshot. {session.errorMessage ?? "Unknown error."}
      </div>
    );
  }

  const snapshotTitle =
    session.snapshot.title?.trim().length
      ? session.snapshot.title
      : `Snapshot ${session.snapshot.shareId.slice(0, 8)}`;

  return (
    <div className="flex h-[100dvh] w-full flex-col bg-slate-app text-theme-text">
      <header className="border-b border-theme-border/10 bg-theme-surface/40 px-4 py-3 backdrop-blur-md sm:px-6">
        <p className="text-sm font-semibold">{snapshotTitle}</p>
        <p className="text-xs text-theme-text/60">
          {formatDate(session.snapshot.createdAt)} · Made with SY Math Slate
        </p>
        <p className="text-xs text-theme-text/45">
          Policy: {sessionPolicy.label}
        </p>
      </header>

      <main className="min-h-0 flex-1 p-3 sm:p-5">
        <div className="relative h-full w-full overflow-hidden rounded-xl border border-theme-border/15 bg-theme-surface/15">
          <CanvasStage />
          <div className="absolute inset-0 z-40 pointer-events-none" aria-hidden="true" />
        </div>
      </main>

      <StudentAIPromptBar session={studentAISession} />

      <footer className="flex items-center justify-center gap-3 border-t border-theme-border/10 bg-theme-surface/35 px-4 py-3 text-xs">
        <button
          type="button"
          className="rounded-full border border-theme-border/15 bg-theme-surface-soft px-3 py-1.5 text-theme-text/80 disabled:opacity-40"
          onClick={prevStep}
          disabled={!canPrev}
          aria-label="Previous step"
        >
          Prev
        </button>
        <span className="min-w-[72px] text-center text-theme-text/65">
          {currentDisplay}/{totalSteps}
        </span>
        <button
          type="button"
          className="rounded-full border border-theme-border/15 bg-theme-surface-soft px-3 py-1.5 text-theme-text/80 disabled:opacity-40"
          onClick={nextStep}
          disabled={!canNext}
          aria-label="Next step"
        >
          Next
        </button>
        {canRequestStepProposal ? (
          <button
            type="button"
            className="rounded-full border border-theme-border/15 bg-theme-surface-soft px-3 py-1.5 text-theme-text/80 disabled:opacity-40"
            onClick={handleSubmitStepProposal}
            disabled={!canSubmitStepProposal}
            aria-label="Request next step from host"
          >
            Request Step
          </button>
        ) : null}
        {latestProposalStatus ? (
          <span className="min-w-[96px] text-center text-theme-text/55">
            Proposal: {latestProposalStatus}
          </span>
        ) : null}
      </footer>
    </div>
  );
}
