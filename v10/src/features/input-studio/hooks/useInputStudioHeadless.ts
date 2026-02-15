"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { buildEditorSurfaceModel } from "@features/editor-core/model/editorSurface";
import {
  blocksToRawText,
  normalizeBlocksDraft,
  syncBlocksFromRawText,
} from "@features/layout/dataInput/blockDraft";
import {
  clampBlockInsertionIndex,
  deleteBlockById,
  insertBreakBlockAt,
  moveBlockById as moveBlockByIdOp,
  moveBlockByIndex as moveBlockByIndexOp,
  reindexBlockStructure,
} from "@features/layout/dataInput/blockStructureOps";
import type {
  RawSyncDecision,
  StepBlockDraft,
} from "@features/layout/dataInput/types";

import type {
  InputStudioApplyResult,
  InputStudioBlocksUpdater,
  InputStudioHeadlessResult,
  UseInputStudioHeadlessOptions,
} from "./types";

const resolveNextBlocks = (
  previousBlocks: StepBlockDraft[],
  updater: InputStudioBlocksUpdater
) => {
  if (typeof updater === "function") {
    return updater(previousBlocks);
  }
  return updater;
};

const stripBreakBlocks = (blocks: StepBlockDraft[]) =>
  blocks.filter((block) => !block.kind || block.kind === "content");

export const useInputStudioHeadless = (
  options: UseInputStudioHeadlessOptions
): InputStudioHeadlessResult => {
  const {
    isOpen,
    sourceBlocks,
    fallbackBlocks = [],
    insertionIndex,
    onInsertionIndexChange,
    onApplyBlocks,
    editorSurfacePreviewLabels,
    editorSurfaceBreakLabels,
  } = options;

  const [rawText, setRawText] = useState("");
  const [blocks, setBlocks] = useState<StepBlockDraft[]>([]);
  const [unmatchedBlocks, setUnmatchedBlocks] = useState<StepBlockDraft[]>([]);
  const [syncDecisions, setSyncDecisions] = useState<RawSyncDecision[]>([]);
  const hasInitializedRef = useRef(false);

  const resetSyncTracking = useCallback(() => {
    setUnmatchedBlocks([]);
    setSyncDecisions([]);
  }, []);

  const writeInsertionIndex = useCallback(
    (nextIndex: number) => {
      onInsertionIndexChange?.(nextIndex);
    },
    [onInsertionIndexChange]
  );

  const initializeDraft = useCallback(
    (initialBlocks: StepBlockDraft[]) => {
      const normalizedBlocks = normalizeBlocksDraft(initialBlocks);
      setBlocks(normalizedBlocks);
      resetSyncTracking();
      setRawText(blocksToRawText(normalizedBlocks));
      writeInsertionIndex(normalizedBlocks.length);
    },
    [resetSyncTracking, writeInsertionIndex]
  );

  const reconcileFromSourceBlocks = useCallback(
    (nextSourceBlocks: StepBlockDraft[]) => {
      const normalizedBlocks = normalizeBlocksDraft(nextSourceBlocks);
      setBlocks(normalizedBlocks);
      resetSyncTracking();
      setRawText(blocksToRawText(normalizedBlocks));
    },
    [resetSyncTracking]
  );

  useEffect(() => {
    let cancelled = false;

    if (!isOpen) {
      hasInitializedRef.current = false;
      queueMicrotask(() => {
        if (cancelled) return;
        resetSyncTracking();
      });
      return () => {
        cancelled = true;
      };
    }
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    const initialBlocks =
      sourceBlocks.length > 0 ? sourceBlocks : fallbackBlocks;
    queueMicrotask(() => {
      if (cancelled) return;
      initializeDraft(initialBlocks);
    });

    return () => {
      cancelled = true;
    };
  }, [fallbackBlocks, initializeDraft, isOpen, resetSyncTracking, sourceBlocks]);

  useEffect(() => {
    if (!isOpen || !hasInitializedRef.current) return;

    const localContent = stripBreakBlocks(blocks);
    const sourceContent = stripBreakBlocks(sourceBlocks);
    const sameContent =
      localContent.length === sourceContent.length &&
      localContent.every((block, index) => block.id === sourceContent[index]?.id);

    if (!sameContent) return;
    if (blocks.length === sourceBlocks.length) return;

    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      reconcileFromSourceBlocks(sourceBlocks);
    });
    return () => {
      cancelled = true;
    };
  }, [blocks, isOpen, reconcileFromSourceBlocks, sourceBlocks]);

  useEffect(() => {
    const nextInsertionIndex = clampBlockInsertionIndex(
      insertionIndex,
      blocks.length
    );
    if (nextInsertionIndex !== insertionIndex) {
      writeInsertionIndex(nextInsertionIndex);
    }
  }, [blocks.length, insertionIndex, writeInsertionIndex]);

  const setRawTextDraft = useCallback((value: string) => {
    setRawText(value);
  }, []);

  const setBlocksDraft = useCallback((updater: InputStudioBlocksUpdater) => {
    setBlocks((previousBlocks) =>
      normalizeBlocksDraft(resolveNextBlocks(previousBlocks, updater))
    );
  }, []);

  const updateBlocksFromRaw = useCallback(
    (value: string) => {
      const syncPool = [...blocks, ...unmatchedBlocks];
      const result = syncBlocksFromRawText(value, syncPool);
      setBlocks(result.blocks);
      setUnmatchedBlocks(result.unmatchedBlocks);
      setSyncDecisions(result.decisions);
    },
    [blocks, unmatchedBlocks]
  );

  const handleRawChange = useCallback(
    (value: string) => {
      setRawText(value);
      updateBlocksFromRaw(value);
    },
    [updateBlocksFromRaw]
  );

  const restoreUnmatchedBlocks = useCallback(() => {
    if (unmatchedBlocks.length === 0) return;
    setBlocks((previousBlocks) =>
      normalizeBlocksDraft([...previousBlocks, ...unmatchedBlocks])
    );
    setUnmatchedBlocks([]);
  }, [unmatchedBlocks]);

  const discardUnmatchedBlocks = useCallback(() => {
    setUnmatchedBlocks([]);
  }, []);

  const deleteBlock = useCallback(
    (blockId: string) => {
      const result = deleteBlockById(blocks, blockId, insertionIndex);
      setBlocks(result.blocks);
      if (result.insertionIndex !== insertionIndex) {
        writeInsertionIndex(result.insertionIndex);
      }
    },
    [blocks, insertionIndex, writeInsertionIndex]
  );

  const moveBlock = useCallback((fromId: string, toId: string) => {
    setBlocks((previousBlocks) => moveBlockByIdOp(previousBlocks, fromId, toId));
  }, []);

  const moveBlockByIndex = useCallback((index: number, delta: -1 | 1) => {
    setBlocks((previousBlocks) => moveBlockByIndexOp(previousBlocks, index, delta));
  }, []);

  const insertBreakBlock = useCallback(
    (kind: "line-break" | "column-break" | "page-break") => {
      const result = insertBreakBlockAt(blocks, insertionIndex, kind);
      setBlocks(result.blocks);
      writeInsertionIndex(result.insertionIndex);
    },
    [blocks, insertionIndex, writeInsertionIndex]
  );

  const syncRawFromBlocks = useCallback(
    (nextBlocks?: StepBlockDraft[]) => {
      const normalizedBlocks = normalizeBlocksDraft(nextBlocks ?? blocks);
      if (nextBlocks) {
        setBlocks(normalizedBlocks);
      }
      setRawText(blocksToRawText(normalizedBlocks));
      setUnmatchedBlocks([]);
      setSyncDecisions([]);
    },
    [blocks]
  );

  const applyDraft = useCallback((): InputStudioApplyResult => {
    if (unmatchedBlocks.length > 0) {
      return {
        ok: false,
        reason: "unmatched-blocks",
        unmatchedCount: unmatchedBlocks.length,
      };
    }

    const normalizedBlocks = normalizeBlocksDraft(blocks);
    onApplyBlocks?.(normalizedBlocks);
    return {
      ok: true,
      blocks: normalizedBlocks,
    };
  }, [blocks, onApplyBlocks, unmatchedBlocks]);

  const rawLines = useMemo(() => rawText.split(/\r?\n/), [rawText]);
  const isSingleLine = rawLines.length <= 1;
  const lineHeight = isSingleLine ? 1.25 : 1.6;
  const lineHeightClass = isSingleLine ? "leading-[1.25]" : "leading-[1.6]";
  const hasUnmatchedBlocks = unmatchedBlocks.length > 0;
  const canApply = !hasUnmatchedBlocks;
  const safeInsertionIndex = clampBlockInsertionIndex(insertionIndex, blocks.length);

  const editorSurface = useMemo(
    () =>
      buildEditorSurfaceModel(blocks, insertionIndex, {
        previewLabels: editorSurfacePreviewLabels,
        breakLabels: editorSurfaceBreakLabels,
      }),
    [blocks, editorSurfaceBreakLabels, editorSurfacePreviewLabels, insertionIndex]
  );

  const contentOrderByBlockId = useMemo(() => {
    const map: Record<string, number | null> = {};
    reindexBlockStructure(blocks).forEach((entry) => {
      map[entry.blockId] = entry.contentOrder;
    });
    return map;
  }, [blocks]);

  return {
    rawText,
    rawLines,
    isSingleLine,
    lineHeight,
    lineHeightClass,
    blocks,
    unmatchedBlocks,
    syncDecisions,
    hasUnmatchedBlocks,
    canApply,
    safeInsertionIndex,
    editorSurface,
    contentOrderByBlockId,
    setRawTextDraft,
    setBlocksDraft,
    handleRawChange,
    updateBlocksFromRaw,
    restoreUnmatchedBlocks,
    discardUnmatchedBlocks,
    deleteBlock,
    moveBlock,
    moveBlockByIndex,
    insertBreakBlock,
    syncRawFromBlocks,
    applyDraft,
  };
};
