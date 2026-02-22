import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";

import type {
  ImageItem,
  StepSegmentType,
  TextItem,
} from "@core/foundation/types/canvas";
import { dispatchCommand } from "@core/runtime/command/commandBus";
import {
  DEFAULT_TEXT_LANE_STYLE,
  normalizeTextSegmentStyle,
} from "@core/ui/theming/engine/typography";
import { createInputStudioDraftQueueEnvelope } from "@features/editor/input-studio/approval/inputStudioApproval";
import type { InputStudioMode } from "@features/editor/input-studio/hooks/types";
import { useInputStudioHeadless } from "@features/editor/input-studio/hooks/useInputStudioHeadless";
import {
  INPUT_STUDIO_LLM_DRAFT_ADAPTER_ID,
  INPUT_STUDIO_LLM_DRAFT_TOOL_ID,
} from "@features/editor/input-studio/llm/types";
import { useInputStudioLlmDraft } from "@features/editor/input-studio/llm/useInputStudioLlmDraft";
import { useInputStudioPublishRollback } from "@features/editor/input-studio/publish/useInputStudioPublishRollback";
import type { StructuredContentValidationResult } from "@features/editor/input-studio/schema/structuredContentSchema";
import { runBatchTransformPipeline } from "@features/editor/input-studio/validation/batchTransformPipeline";
import type { BatchTransformDiagnostic } from "@features/editor/input-studio/validation/types";
import { runAutoLayout } from "@features/chrome/layout/autoLayout";
import {
  buildBlocksFromFlowItems,
  normalizeBlocksDraft,
} from "@features/chrome/layout/dataInput/blockDraft";
import { reduceInlineEditCommand } from "@features/chrome/layout/dataInput/inlineEditCommands";
import {
  readImageFile,
  readImageUrl,
  readVideoFile,
  readVideoUrl,
} from "@features/chrome/layout/dataInput/mediaIO";
import { captureSelection } from "@features/chrome/layout/dataInput/segmentCommands";
import type { StepBlockDraft } from "@features/chrome/layout/dataInput/types";
import { useCanvasStore } from "@features/platform/store/useCanvasStore";
import { useLocalStore } from "@features/platform/store/useLocalStore";
import { useSyncStore } from "@features/platform/store/useSyncStore";
import { useUIStore } from "@features/platform/store/useUIStoreBridge";

const FONT_SIZE_PATTERN_PX = /^(\d+(?:\.\d+)?)px$/i;
const FONT_SIZE_STEP_PX = 2;
const FONT_SIZE_MIN_PX = 16;
const FONT_SIZE_MAX_PX = 72;

const parseFontSizePx = (
  value: string | undefined,
  fallback: number
): number => {
  if (!value) return fallback;
  const match = value.trim().match(FONT_SIZE_PATTERN_PX);
  if (!match) return fallback;
  const parsed = Number(match[1]);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.round(parsed);
};

const DEFAULT_FONT_SIZE_PX = parseFontSizePx(
  DEFAULT_TEXT_LANE_STYLE.fontSize,
  28
);

const EDITOR_SURFACE_PREVIEW_LABELS = {
  imageToken: "[이미지]",
  videoToken: "[비디오]",
  empty: "내용 없음",
};

const EDITOR_SURFACE_BREAK_LABELS = {
  lineBreak: "줄바꿈",
  columnBreak: "단 나눔",
  pageBreak: "페이지 이동",
  fallback: "구분선",
};

const createRequestId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `input-studio-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const normalizePrompt = (value: string): string => value.trim();

export type DataInputTab = "input" | "blocks";

export function useDataInputPanelRuntime() {
  const {
    isDataInputOpen,
    closeDataInput,
    isCapabilityEnabled,
    overviewViewportRatio,
  } = useUIStore();
  const {
    pages,
    currentPageId,
    pageColumnCounts,
    stepBlocks,
    insertionIndex,
    applyAutoLayout,
    captureLayoutSnapshot,
    restoreLayoutSnapshot,
    layoutSnapshot,
  } = useCanvasStore();
  const effectiveRole = useLocalStore((state) =>
    state.trustedRoleClaim === "host" || state.role === "host"
      ? "host"
      : "student"
  );
  const enqueuePendingAI = useSyncStore((state) => state.enqueuePendingAI);

  const [activeTab, setActiveTab] = useState<DataInputTab>("input");
  const [studioMode, setStudioMode] = useState<InputStudioMode>("compact");
  const [isLayoutRunning, setIsLayoutRunning] = useState(false);
  const [expandedBlockId, setExpandedBlockId] = useState<string | null>(null);
  const [schemaJsonText, setSchemaJsonText] = useState("[]");
  const [schemaValidation, setSchemaValidation] =
    useState<StructuredContentValidationResult | null>(null);
  const [llmPrompt, setLlmPrompt] = useState("");
  const [pipelineDiagnostics, setPipelineDiagnostics] = useState<
    BatchTransformDiagnostic[]
  >([]);
  const [publishMessage, setPublishMessage] = useState<string | null>(null);
  const [mediaUrlInput, setMediaUrlInput] = useState<{
    blockId: string;
    type: "image" | "video";
  } | null>(null);
  const [mediaUrlValue, setMediaUrlValue] = useState("");

  const segmentRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const selectionRef = useRef<Record<string, Range | null>>({});
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const pendingMediaStepRef = useRef<string | null>(null);

  const canMath = isCapabilityEnabled("data.math");
  const canHighlight = isCapabilityEnabled("data.highlight");

  const writeInsertionIndex = useCallback((index: number) => {
    void dispatchCommand(
      "setInsertionIndex",
      { index },
      {
        meta: { source: "data-input-panel" },
      }
    ).catch(() => undefined);
  }, []);

  const writeImportStepBlocks = useCallback((nextBlocks: StepBlockDraft[]) => {
    void dispatchCommand(
      "importStepBlocks",
      { blocks: nextBlocks },
      {
        meta: { source: "data-input-panel" },
      }
    ).catch(() => undefined);
  }, []);

  const flowItems = useMemo(() => {
    const items = pages[currentPageId] ?? [];
    return items.filter((item): item is TextItem | ImageItem => {
      if (item.type === "text") {
        return (item.layoutMode ?? "flow") === "flow";
      }
      if (item.type === "image") {
        return (item.layoutMode ?? "flow") === "flow";
      }
      return false;
    });
  }, [pages, currentPageId]);

  const fallbackBlocks = useMemo(
    () => buildBlocksFromFlowItems(flowItems),
    [flowItems]
  );

  const {
    rawText,
    blocks,
    unmatchedBlocks,
    syncDecisions,
    canApply,
    editorSurface,
    contentOrderByBlockId,
    setBlocksDraft,
    handleRawChange,
    restoreUnmatchedBlocks,
    discardUnmatchedBlocks,
    deleteBlock,
    moveBlock,
    moveBlockByIndex,
    insertBreakBlock,
    syncRawFromBlocks,
    applyDraft,
  } = useInputStudioHeadless({
    isOpen: isDataInputOpen,
    sourceBlocks: stepBlocks,
    fallbackBlocks,
    insertionIndex,
    onInsertionIndexChange: writeInsertionIndex,
    onApplyBlocks: writeImportStepBlocks,
    editorSurfacePreviewLabels: EDITOR_SURFACE_PREVIEW_LABELS,
    editorSurfaceBreakLabels: EDITOR_SURFACE_BREAK_LABELS,
  });

  const {
    isRequesting: isLlmRequesting,
    candidate,
    error: llmError,
    requestDraft,
    clearCandidate,
    clearError,
  } = useInputStudioLlmDraft({
    currentBlocks: blocks,
    fallbackLocale: "ko-KR",
  });

  const {
    rollbackSnapshot,
    publishDrafts,
    restoreSnapshot,
    clearSnapshots,
  } = useInputStudioPublishRollback();

  useEffect(() => {
    if (isDataInputOpen) return;
    setActiveTab("input");
    setStudioMode("compact");
    setExpandedBlockId(null);
    setSchemaValidation(null);
    setSchemaJsonText("[]");
    setLlmPrompt("");
    setPipelineDiagnostics([]);
    setPublishMessage(null);
    clearCandidate();
    clearError();
    clearSnapshots();
  }, [clearCandidate, clearError, clearSnapshots, isDataInputOpen]);

  useEffect(() => {
    if (!expandedBlockId) return;
    const hasExpandedBlock = blocks.some(
      (block) =>
        block.id === expandedBlockId && (!block.kind || block.kind === "content")
    );
    if (!hasExpandedBlock) {
      setExpandedBlockId(null);
    }
  }, [blocks, expandedBlockId]);

  useEffect(() => {
    if (!isDataInputOpen) return;
    const handleSelection = () =>
      captureSelection(segmentRefs.current, selectionRef.current);
    document.addEventListener("selectionchange", handleSelection);
    return () => document.removeEventListener("selectionchange", handleSelection);
  }, [isDataInputOpen]);

  useEffect(() => {
    if (!isDataInputOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      closeDataInput();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeDataInput, isDataInputOpen]);

  const applyInlineCommand = useCallback(
    (command: Parameters<typeof reduceInlineEditCommand>[1]) => {
      setBlocksDraft((previousBlocks) =>
        reduceInlineEditCommand(previousBlocks, command)
      );
    },
    [setBlocksDraft]
  );

  const updateSegmentHtml = useCallback(
    (segmentId: string, html: string) => {
      applyInlineCommand({
        type: "segment/set-html",
        segmentId,
        html,
      });
    },
    [applyInlineCommand]
  );

  const handleSegmentCommit = useCallback(
    (segmentId: string) => {
      const element = segmentRefs.current[segmentId];
      if (!element) return;
      updateSegmentHtml(segmentId, element.innerHTML);
    },
    [updateSegmentHtml]
  );

  const updateTextSegmentStyle = useCallback(
    (
      blockId: string,
      segmentId: string,
      partial: Partial<ReturnType<typeof normalizeTextSegmentStyle>>
    ) => {
      applyInlineCommand({
        type: "block/update-text-style",
        blockId,
        segmentId,
        partialStyle: partial,
      });
    },
    [applyInlineCommand]
  );

  const adjustTextSegmentFontSize = useCallback(
    (blockId: string, segmentId: string, deltaPx: number) => {
      applyInlineCommand({
        type: "block/adjust-text-font-size",
        blockId,
        segmentId,
        deltaPx,
        minPx: FONT_SIZE_MIN_PX,
        maxPx: FONT_SIZE_MAX_PX,
        fallbackPx: DEFAULT_FONT_SIZE_PX,
      });
    },
    [applyInlineCommand]
  );

  const addTextSegment = useCallback(
    (blockId: string) => {
      applyInlineCommand({
        type: "block/add-text-segment",
        blockId,
      });
    },
    [applyInlineCommand]
  );

  const addMediaSegment = useCallback(
    (
      blockId: string,
      type: "image" | "video",
      src: string,
      width: number,
      height: number
    ) => {
      applyInlineCommand({
        type: "block/add-media-segment",
        blockId,
        mediaType: type,
        src,
        width,
        height,
      });
    },
    [applyInlineCommand]
  );

  const removeSegment = useCallback(
    (blockId: string, segmentId: string) => {
      applyInlineCommand({
        type: "block/remove-segment",
        blockId,
        segmentId,
        fallbackTextHtml: "&nbsp;",
      });
    },
    [applyInlineCommand]
  );

  const moveSegment = useCallback(
    (blockId: string, fromId: string, toId: string) => {
      applyInlineCommand({
        type: "block/move-segment",
        blockId,
        fromId,
        toId,
      });
    },
    [applyInlineCommand]
  );

  const handleMediaPick = useCallback((blockId: string, type: StepSegmentType) => {
    pendingMediaStepRef.current = blockId;
    if (type === "image") {
      imageInputRef.current?.click();
      return;
    }
    if (type === "video") {
      videoInputRef.current?.click();
    }
  }, []);

  const handleImageInput = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      const blockId = pendingMediaStepRef.current;
      pendingMediaStepRef.current = null;
      if (!file || !blockId) return;
      try {
        const data = await readImageFile(file);
        addMediaSegment(blockId, "image", data.src, data.width, data.height);
      } catch {
        // no-op
      }
    },
    [addMediaSegment]
  );

  const handleVideoInput = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      const blockId = pendingMediaStepRef.current;
      pendingMediaStepRef.current = null;
      if (!file || !blockId) return;
      try {
        const data = await readVideoFile(file);
        addMediaSegment(blockId, "video", data.src, data.width, data.height);
      } catch {
        // no-op
      }
    },
    [addMediaSegment]
  );

  const openMediaUrlInput = useCallback(
    (blockId: string, type: "image" | "video") => {
      setMediaUrlInput({ blockId, type });
      setMediaUrlValue("");
    },
    []
  );

  const submitMediaUrl = useCallback(async () => {
    if (!mediaUrlInput || !mediaUrlValue.trim()) return;
    const { blockId, type } = mediaUrlInput;
    const url = mediaUrlValue.trim();
    setMediaUrlInput(null);
    setMediaUrlValue("");

    try {
      if (type === "image") {
        const data = await readImageUrl(url);
        addMediaSegment(blockId, "image", data.src, data.width, data.height);
        return;
      }

      const data = await readVideoUrl(url);
      addMediaSegment(blockId, "video", data.src, data.width, data.height);
    } catch {
      // no-op
    }
  }, [addMediaSegment, mediaUrlInput, mediaUrlValue]);

  const cancelMediaUrlInput = useCallback(() => {
    setMediaUrlInput(null);
    setMediaUrlValue("");
  }, []);

  const runNormalizePipeline = useCallback((inputBlocks: StepBlockDraft[]) => {
    return runBatchTransformPipeline({
      initialBlocks: inputBlocks,
      steps: [
        {
          id: "normalize-draft",
          description: "normalize step block drafts",
          transform: (draftBlocks) => normalizeBlocksDraft(draftBlocks),
        },
      ],
      stopOnError: true,
      enforceDeterminism: true,
    });
  }, []);

  const handleApplyToCanvas = useCallback(() => {
    const result = applyDraft();
    if (!result.ok) return;

    const pipelineResult = runNormalizePipeline(result.blocks);
    setPipelineDiagnostics(pipelineResult.diagnostics);
    if (!pipelineResult.ok) return;

    const publishResult = publishDrafts(
      stepBlocks,
      pipelineResult.blocks,
      "input-studio-apply"
    );
    writeImportStepBlocks(publishResult.appliedBlocks);
    setBlocksDraft(publishResult.appliedBlocks);
    syncRawFromBlocks(publishResult.appliedBlocks);
    setPublishMessage(`적용 완료: ${publishResult.appliedBlocks.length}개 블록`);
  }, [
    applyDraft,
    publishDrafts,
    runNormalizePipeline,
    setBlocksDraft,
    stepBlocks,
    syncRawFromBlocks,
    writeImportStepBlocks,
  ]);

  const handleRollback = useCallback(() => {
    const restored = restoreSnapshot();
    if (!restored) return;
    writeImportStepBlocks(restored.blocks);
    setBlocksDraft(restored.blocks);
    syncRawFromBlocks(restored.blocks);
    setPipelineDiagnostics([]);
    setPublishMessage(`롤백 완료: ${restored.blocks.length}개 블록`);
  }, [restoreSnapshot, setBlocksDraft, syncRawFromBlocks, writeImportStepBlocks]);

  const handleClearSnapshots = useCallback(() => {
    clearSnapshots();
    setPublishMessage(null);
  }, [clearSnapshots]);

  const handleAutoLayout = useCallback(async () => {
    if (isLayoutRunning) return;
    setIsLayoutRunning(true);
    captureLayoutSnapshot();

    const normalizedBlocks = normalizeBlocksDraft(blocks);
    try {
      const columnCount = pageColumnCounts?.[currentPageId] ?? 2;
      const result = await runAutoLayout(normalizedBlocks, {
        ratio: overviewViewportRatio,
        columnCount,
        basePageId: currentPageId,
      });
      applyAutoLayout({ ...result, stepBlocks: normalizedBlocks });
    } finally {
      setIsLayoutRunning(false);
    }
  }, [
    applyAutoLayout,
    blocks,
    captureLayoutSnapshot,
    currentPageId,
    isLayoutRunning,
    overviewViewportRatio,
    pageColumnCounts,
  ]);

  const handleSchemaValidBlocks = useCallback(
    (nextBlocks: StepBlockDraft[]) => {
      const pipelineResult = runNormalizePipeline(nextBlocks);
      setPipelineDiagnostics(pipelineResult.diagnostics);
      if (!pipelineResult.ok) return;

      setBlocksDraft(pipelineResult.blocks);
      syncRawFromBlocks(pipelineResult.blocks);
      setExpandedBlockId(null);
      setPublishMessage(`스키마 적용: ${pipelineResult.blocks.length}개 블록`);
    },
    [runNormalizePipeline, setBlocksDraft, syncRawFromBlocks]
  );

  const handleRequestLlmDraft = useCallback(async () => {
    const prompt = normalizePrompt(llmPrompt);
    if (!prompt) return;
    await requestDraft({
      prompt,
      rawText,
      meta: {
        source: "input-studio",
      },
    });
  }, [llmPrompt, rawText, requestDraft]);

  const handleApplyCandidateToDraft = useCallback(() => {
    if (!candidate) return;

    const pipelineResult = runNormalizePipeline(candidate.blocks);
    setPipelineDiagnostics(pipelineResult.diagnostics);
    if (!pipelineResult.ok) return;

    setBlocksDraft(pipelineResult.blocks);
    syncRawFromBlocks(pipelineResult.blocks);
    setExpandedBlockId(null);
    clearCandidate();
    setPublishMessage(`LLM 초안 반영: ${pipelineResult.blocks.length}개 블록`);
  }, [
    candidate,
    clearCandidate,
    runNormalizePipeline,
    setBlocksDraft,
    syncRawFromBlocks,
  ]);

  const handleQueueCandidateForApproval = useCallback(() => {
    if (!candidate) return;

    const requestId = createRequestId();
    const envelope = createInputStudioDraftQueueEnvelope({
      requestId,
      draftBlocks: candidate.blocks,
      reason: "input-studio-llm-draft",
      idempotencyKey: `input-studio-draft:${requestId}`,
    });

    enqueuePendingAI({
      id: `input-studio-draft-${requestId}`,
      toolId: INPUT_STUDIO_LLM_DRAFT_TOOL_ID,
      adapterId: INPUT_STUDIO_LLM_DRAFT_ADAPTER_ID,
      payload: envelope.payload,
      meta: envelope.meta,
      toolResult: null,
    });

    clearCandidate();
    setPublishMessage("LLM 초안을 승인 큐로 전송했습니다.");
  }, [candidate, clearCandidate, enqueuePendingAI]);

  const hasNormalizedPrompt = normalizePrompt(llmPrompt).length > 0;
  const hasCandidate = Boolean(candidate);

  return {
    isDataInputOpen,
    imageInputRef,
    videoInputRef,
    handleImageInput,
    handleVideoInput,
    header: {
      studioMode,
      setStudioMode,
      closeDataInput,
      activeTab,
      setActiveTab,
    },
    body: {
      activeTab,
      studioMode,
      rawText,
      onRawTextChange: handleRawChange,
      syncDecisionCount: syncDecisions.length,
      schemaJsonText,
      setSchemaJsonText,
      schemaValidation,
      setSchemaValidation,
      onSchemaValidBlocks: handleSchemaValidBlocks,
      effectiveRole,
      llmPrompt,
      setLlmPrompt,
      llmError,
      clearLlmError: clearError,
      isLlmRequesting,
      hasNormalizedPrompt,
      hasCandidate,
      candidate,
      onRequestLlmDraft: handleRequestLlmDraft,
      clearCandidate,
      onApplyCandidateToDraft: handleApplyCandidateToDraft,
      onQueueCandidateForApproval: handleQueueCandidateForApproval,
      blocks,
      editorSurface,
      contentOrderByBlockId,
      expandedBlockId,
      setExpandedBlockId,
      moveBlock,
      moveBlockByIndex,
      deleteBlock,
      onInsertionIndexChange: writeInsertionIndex,
      onInsertBreakBlock: insertBreakBlock,
      pipelineDiagnostics,
      publishMessage,
      canMath,
      canHighlight,
      fontSizeStepPx: FONT_SIZE_STEP_PX,
      fontSizeMinPx: FONT_SIZE_MIN_PX,
      fontSizeMaxPx: FONT_SIZE_MAX_PX,
      defaultFontSizePx: DEFAULT_FONT_SIZE_PX,
      segmentRefs,
      selectionRef,
      onSegmentCommit: handleSegmentCommit,
      updateSegmentHtml,
      updateTextSegmentStyle,
      adjustTextSegmentFontSize,
      addTextSegment,
      removeSegment,
      moveSegment,
      onMediaPick: handleMediaPick,
      mediaUrlInput,
      mediaUrlValue,
      setMediaUrlValue,
      openMediaUrlInput,
      submitMediaUrl,
      cancelMediaUrlInput,
    },
    actions: {
      closeDataInput,
      onRestoreLayoutSnapshot: restoreLayoutSnapshot,
      canRestoreLayoutSnapshot: Boolean(layoutSnapshot),
      onAutoLayout: handleAutoLayout,
      isAutoLayoutRunning: isLayoutRunning,
      onApply: handleApplyToCanvas,
      canApply,
      unmatchedBlockCount: unmatchedBlocks.length,
      onRestoreUnmatchedBlocks: restoreUnmatchedBlocks,
      onDiscardUnmatchedBlocks: discardUnmatchedBlocks,
      canRollback: Boolean(rollbackSnapshot),
      onRollback: handleRollback,
      onClearSnapshots: handleClearSnapshots,
    },
  };
}

export type DataInputPanelRuntime = ReturnType<typeof useDataInputPanelRuntime>;
