"use client";

import { useCallback, useState } from "react";

import type { StepBlockDraft } from "@features/chrome/layout/dataInput/types";

import {
  cloneStepBlockDrafts,
  createInputStudioPublishSnapshot,
  type InputStudioPublishApplyResult,
  type InputStudioPublishSnapshot,
  type InputStudioSnapshotApplyResult,
} from "./types";

const INPUT_STUDIO_CAPTURE_REASON = "input-studio-capture";
const INPUT_STUDIO_PUBLISH_REASON = "input-studio-publish";

export type UseInputStudioPublishRollbackResult = {
  rollbackSnapshot: InputStudioPublishSnapshot | null;
  publishedSnapshot: InputStudioPublishSnapshot | null;
  captureSnapshot: (
    blocks: StepBlockDraft[],
    reason?: string
  ) => InputStudioPublishSnapshot;
  applySnapshot: (
    snapshot: InputStudioPublishSnapshot
  ) => InputStudioSnapshotApplyResult;
  publishDrafts: (
    currentDrafts: StepBlockDraft[],
    nextDrafts: StepBlockDraft[],
    reason?: string
  ) => InputStudioPublishApplyResult;
  restoreSnapshot: (
    snapshot?: InputStudioPublishSnapshot | null
  ) => InputStudioSnapshotApplyResult | null;
  clearSnapshots: () => void;
};

const toPublishReason = (reason?: string): string => {
  if (typeof reason !== "string") return INPUT_STUDIO_PUBLISH_REASON;
  const trimmed = reason.trim();
  return trimmed.length > 0 ? trimmed : INPUT_STUDIO_PUBLISH_REASON;
};

export const useInputStudioPublishRollback =
  (): UseInputStudioPublishRollbackResult => {
    const [rollbackSnapshot, setRollbackSnapshot] =
      useState<InputStudioPublishSnapshot | null>(null);
    const [publishedSnapshot, setPublishedSnapshot] =
      useState<InputStudioPublishSnapshot | null>(null);

    const captureSnapshot = useCallback(
      (blocks: StepBlockDraft[], reason = INPUT_STUDIO_CAPTURE_REASON) =>
        createInputStudioPublishSnapshot(blocks, reason),
      []
    );

    const applySnapshot = useCallback(
      (snapshot: InputStudioPublishSnapshot): InputStudioSnapshotApplyResult => ({
        snapshot,
        blocks: cloneStepBlockDrafts(snapshot.blocks),
      }),
      []
    );

    const publishDrafts = useCallback(
      (
        currentDrafts: StepBlockDraft[],
        nextDrafts: StepBlockDraft[],
        reason?: string
      ): InputStudioPublishApplyResult => {
        const normalizedReason = toPublishReason(reason);
        const rollback = captureSnapshot(
          currentDrafts,
          `${normalizedReason}:rollback`
        );
        const published = captureSnapshot(
          nextDrafts,
          `${normalizedReason}:published`
        );
        setRollbackSnapshot(rollback);
        setPublishedSnapshot(published);
        return {
          rollbackSnapshot: rollback,
          publishedSnapshot: published,
          appliedBlocks: cloneStepBlockDrafts(published.blocks),
        };
      },
      [captureSnapshot]
    );

    const restoreSnapshot = useCallback(
      (
        snapshot?: InputStudioPublishSnapshot | null
      ): InputStudioSnapshotApplyResult | null => {
        const source = snapshot ?? rollbackSnapshot;
        if (!source) return null;
        return applySnapshot(source);
      },
      [applySnapshot, rollbackSnapshot]
    );

    const clearSnapshots = useCallback(() => {
      setRollbackSnapshot(null);
      setPublishedSnapshot(null);
    }, []);

    return {
      rollbackSnapshot,
      publishedSnapshot,
      captureSnapshot,
      applySnapshot,
      publishDrafts,
      restoreSnapshot,
      clearSnapshots,
    };
  };
