"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ChangeEvent,
} from "react";

import { dispatchCommand } from "@core/runtime/command/commandBus";
import { cn } from "@core/utils";
import {
  DEFAULT_TEXT_LANE_STYLE,
  DEFAULT_TEXT_LINE_HEIGHT,
  TEXT_FONT_FAMILY_OPTIONS,
  TEXT_INLINE_BOLD_CLASS,
  TEXT_INLINE_COLOR_OPTIONS,
  TEXT_INLINE_SIZE_OPTIONS,
  normalizeTextSegmentStyle,
} from "@core/ui/theming/engine/typography";
import type {
  ImageItem,
  StepSegmentType,
  TextItem,
} from "@core/foundation/types/canvas";
import {
  InputStudioActionsSection,
  InputStudioBlocksSection,
  InputStudioHeaderSection,
  InputStudioRawSection,
} from "@features/editor/input-studio/components";
import {
  createInputStudioDraftQueueEnvelope,
} from "@features/editor/input-studio/approval/inputStudioApproval";
import type {
  InputStudioBlockRenderArgs,
  InputStudioMode,
} from "@features/editor/input-studio/hooks/types";
import { useInputStudioHeadless } from "@features/editor/input-studio/hooks/useInputStudioHeadless";
import {
  INPUT_STUDIO_LLM_DRAFT_ADAPTER_ID,
  INPUT_STUDIO_LLM_DRAFT_TOOL_ID,
} from "@features/editor/input-studio/llm/types";
import { useInputStudioLlmDraft } from "@features/editor/input-studio/llm/useInputStudioLlmDraft";
import { useInputStudioPublishRollback } from "@features/editor/input-studio/publish/useInputStudioPublishRollback";
import {
  StructuredSchemaEditor,
} from "@features/editor/input-studio/schema/StructuredSchemaEditor";
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
import {
  captureSelection,
  wrapSelectionWithClass,
  wrapSelectionWithHighlight,
  wrapSelectionWithMath,
} from "@features/chrome/layout/dataInput/segmentCommands";
import type { StepBlockDraft } from "@features/chrome/layout/dataInput/types";
import { useCanvasStore } from "@features/platform/store/useCanvasStore";
import { useLocalStore } from "@features/platform/store/useLocalStore";
import { useSyncStore } from "@features/platform/store/useSyncStore";
import { useUIStore } from "@features/platform/store/useUIStoreBridge";
import { Button } from "@ui/components/button";
import { ImagePlus, Minus, PlaySquare, Plus } from "lucide-react";

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

const formatDiagnostic = (diagnostic: BatchTransformDiagnostic): string => {
  const scope = diagnostic.stepId ? `[${diagnostic.stepId}] ` : "";
  return `${scope}${diagnostic.phase}:${diagnostic.code} - ${diagnostic.message}`;
};

export type DataInputPanelMountMode = "legacy-shell" | "window-host";

type DataInputPanelProps = {
  mountMode?: DataInputPanelMountMode;
  className?: string;
};

export function DataInputPanel(props: DataInputPanelProps = {}) {
  const { mountMode = "legacy-shell", className } = props;
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

  const [activeTab, setActiveTab] = useState<"input" | "blocks">("input");
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
  }, [mediaUrlInput, mediaUrlValue, addMediaSegment]);

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

  const renderExpandedContent = ({
    block,
  }: InputStudioBlockRenderArgs) => {
    let imageIndex = 0;
    let videoIndex = 0;

    return (
      <>
        <div className="flex flex-col gap-2">
          {block.segments.map((segment) => {
            const label =
              segment.type === "text"
                ? "TXT"
                : segment.type === "image"
                  ? `img${String(++imageIndex).padStart(2, "0")}`
                  : `play${String(++videoIndex).padStart(2, "0")}`;

            const textStyle =
              segment.type === "text"
                ? normalizeTextSegmentStyle(segment.style)
                : null;

            const editorStyle: CSSProperties | undefined = textStyle
              ? {
                  fontFamily: textStyle.fontFamily,
                  fontSize: textStyle.fontSize,
                  fontWeight: textStyle.fontWeight as CSSProperties["fontWeight"],
                  color: textStyle.color,
                  lineHeight: DEFAULT_TEXT_LINE_HEIGHT,
                }
              : undefined;

            const fontSizePx = textStyle
              ? parseFontSizePx(textStyle.fontSize, DEFAULT_FONT_SIZE_PX)
              : DEFAULT_FONT_SIZE_PX;
            const canDecreaseFontSize = fontSizePx > FONT_SIZE_MIN_PX;
            const canIncreaseFontSize = fontSizePx < FONT_SIZE_MAX_PX;

            return (
              <div
                key={segment.id}
                className="flex items-start gap-2 rounded-md border border-theme-border/10 bg-theme-surface/30 p-2"
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData("text/plain", `${block.id}:${segment.id}`);
                }}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  const raw = event.dataTransfer.getData("text/plain");
                  const [fromBlockId, fromSegmentId] = raw.split(":");
                  if (
                    !fromBlockId ||
                    !fromSegmentId ||
                    fromBlockId !== block.id
                  ) {
                    return;
                  }
                  moveSegment(block.id, fromSegmentId, segment.id);
                }}
              >
                <span
                  data-segment-drag
                  className="rounded-full border border-theme-border/20 bg-theme-surface-soft px-2 py-0.5 text-[10px] uppercase text-theme-text/70"
                >
                  {label}
                </span>

                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  {segment.type === "text" ? (
                    <>
                      <div
                        ref={(node) => {
                          segmentRefs.current[segment.id] = node;
                        }}
                        className={cn(
                          "min-h-[40px] rounded-md border border-theme-border/10 bg-theme-surface/30 px-2 py-2 text-sm text-theme-text/80 outline-none",
                          "focus-within:border-theme-border/40"
                        )}
                        style={editorStyle}
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={() => handleSegmentCommit(segment.id)}
                        dangerouslySetInnerHTML={{
                          __html: segment.html,
                        }}
                      />

                      <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="inline-flex h-11 min-w-[192px] items-center gap-2 rounded-md border border-theme-border/15 bg-theme-surface/40 px-2">
                            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-theme-text/45">
                              폰트
                            </span>
                            <select
                              className="h-9 min-w-[108px] flex-1 rounded-md border border-theme-border/15 bg-theme-surface/50 px-2 text-[11px] text-theme-text/80 outline-none"
                              value={textStyle?.fontFamily ?? ""}
                              onChange={(event) =>
                                updateTextSegmentStyle(block.id, segment.id, {
                                  fontFamily: event.target.value,
                                })
                              }
                            >
                              {TEXT_FONT_FAMILY_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="inline-flex h-11 items-center rounded-md border border-theme-border/15 bg-theme-surface/40">
                            <Button
                              variant="ghost"
                              className="h-11 rounded-r-none px-3 text-[11px] text-theme-text/75 hover:text-theme-text"
                              onClick={() =>
                                adjustTextSegmentFontSize(
                                  block.id,
                                  segment.id,
                                  -FONT_SIZE_STEP_PX
                                )
                              }
                              disabled={!canDecreaseFontSize}
                            >
                              A-
                            </Button>
                            <span className="min-w-[56px] border-x border-[var(--theme-border)] px-2 text-center text-[11px] font-semibold text-[var(--theme-text)]">
                              {fontSizePx}px
                            </span>
                            <Button
                              variant="ghost"
                              className="h-11 rounded-l-none px-3 text-[11px] text-theme-text/75 hover:text-theme-text"
                              onClick={() =>
                                adjustTextSegmentFontSize(
                                  block.id,
                                  segment.id,
                                  FONT_SIZE_STEP_PX
                                )
                              }
                              disabled={!canIncreaseFontSize}
                            >
                              A+
                            </Button>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            variant="outline"
                            className="h-10 px-3 text-[11px] font-bold"
                            onMouseDown={(event) => {
                              event.preventDefault();
                              wrapSelectionWithClass(
                                segment.id,
                                TEXT_INLINE_BOLD_CLASS,
                                segmentRefs.current,
                                selectionRef.current,
                                updateSegmentHtml
                              );
                            }}
                          >
                            B
                          </Button>
                          {canMath && (
                            <Button
                              variant="outline"
                              className="h-10 px-3 text-[11px]"
                              onMouseDown={(event) => {
                                event.preventDefault();
                                wrapSelectionWithMath(
                                  segment.id,
                                  segmentRefs.current,
                                  selectionRef.current,
                                  updateSegmentHtml
                                );
                              }}
                            >
                              $$
                            </Button>
                          )}
                          {canHighlight && (
                            <Button
                              variant="outline"
                              className="h-10 px-3 text-[11px]"
                              onMouseDown={(event) => {
                                event.preventDefault();
                                wrapSelectionWithHighlight(
                                  segment.id,
                                  segmentRefs.current,
                                  selectionRef.current,
                                  updateSegmentHtml
                                );
                              }}
                            >
                              HL
                            </Button>
                          )}
                        </div>

                        {studioMode === "advanced" && (
                          <div className="flex flex-wrap items-center gap-2">
                            {TEXT_INLINE_COLOR_OPTIONS.map((option) => (
                              <Button
                                key={`${segment.id}-${option.className}`}
                                variant="outline"
                                className="h-10 px-3 text-[11px]"
                                onMouseDown={(event) => {
                                  event.preventDefault();
                                  wrapSelectionWithClass(
                                    segment.id,
                                    option.className,
                                    segmentRefs.current,
                                    selectionRef.current,
                                    updateSegmentHtml
                                  );
                                }}
                              >
                                {option.label}
                              </Button>
                            ))}
                            {TEXT_INLINE_SIZE_OPTIONS.map((option) => (
                              <Button
                                key={`${segment.id}-${option.className}`}
                                variant="outline"
                                className="h-10 px-3 text-[11px]"
                                onMouseDown={(event) => {
                                  event.preventDefault();
                                  wrapSelectionWithClass(
                                    segment.id,
                                    option.className,
                                    segmentRefs.current,
                                    selectionRef.current,
                                    updateSegmentHtml
                                  );
                                }}
                              >
                                {option.label}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-3 text-xs text-theme-text/60">
                      {segment.type === "image" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={segment.src}
                          alt="preview"
                          className="h-12 w-12 rounded-md object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-md border border-theme-border/20 bg-theme-surface-soft text-[10px] tracking-widest text-theme-text/50">
                          PLAY
                        </div>
                      )}
                      <span className="truncate">
                        {segment.type === "image" ? "이미지" : "비디오"}
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 text-theme-text/50 hover:text-theme-text"
                  onClick={() => removeSegment(block.id, segment.id)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            className="h-10 px-3 text-xs"
            onClick={() => addTextSegment(block.id)}
          >
            <Plus className="mr-1 h-3 w-3" />
            Text
          </Button>
          <Button
            variant="outline"
            className="h-10 px-3 text-xs"
            onClick={() => handleMediaPick(block.id, "image")}
          >
            <ImagePlus className="mr-1 h-3 w-3" />
            Image
          </Button>
          <Button
            variant="ghost"
            className="h-10 px-3 text-[11px] text-theme-text/60 hover:text-theme-text"
            onClick={() => {
              openMediaUrlInput(block.id, "image");
            }}
          >
            URL
          </Button>
          <Button
            variant="outline"
            className="h-10 px-3 text-xs"
            onClick={() => handleMediaPick(block.id, "video")}
          >
            <PlaySquare className="mr-1 h-3 w-3" />
            Video
          </Button>
          <Button
            variant="ghost"
            className="h-10 px-3 text-[11px] text-theme-text/60 hover:text-theme-text"
            onClick={() => {
              openMediaUrlInput(block.id, "video");
            }}
          >
            URL
          </Button>
        </div>
        {mediaUrlInput && mediaUrlInput.blockId === block.id && (
          <div className="flex items-center gap-2 rounded-lg border border-theme-border/20 bg-theme-surface/60 px-2 py-1.5">
            <input
              type="url"
              value={mediaUrlValue}
              onChange={(e) => setMediaUrlValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  void submitMediaUrl();
                } else if (e.key === "Escape") {
                  cancelMediaUrlInput();
                }
              }}
              placeholder={
                mediaUrlInput.type === "image" ? "이미지 URL" : "비디오 URL"
              }
              className="min-w-0 flex-1 bg-transparent text-xs text-theme-text outline-none placeholder:text-theme-text/40"
              autoFocus
            />
            <Button
              variant="ghost"
              className="h-7 shrink-0 px-2 text-[11px]"
              onClick={() => {
                void submitMediaUrl();
              }}
              disabled={!mediaUrlValue.trim()}
            >
              확인
            </Button>
            <Button
              variant="ghost"
              className="h-7 shrink-0 px-2 text-[11px] text-theme-text/50"
              onClick={cancelMediaUrlInput}
            >
              취소
            </Button>
          </div>
        )}
      </>
    );
  };

  if (!isDataInputOpen) return null;

  const hasNormalizedPrompt = normalizePrompt(llmPrompt).length > 0;
  const hasCandidate = Boolean(candidate);

  return (
    <aside
      data-layout-state="state_input_mode"
      data-panel-mount-mode={mountMode}
      className={cn(
        mountMode === "window-host"
          ? "flex h-full w-full min-h-0 flex-col overflow-hidden bg-[var(--theme-surface-soft)] px-4 py-4 overscroll-contain"
          : "fixed inset-0 z-50 flex h-[100dvh] w-full flex-col bg-[var(--theme-surface-overlay)] px-4 py-4 backdrop-blur-md overscroll-contain xl:static xl:z-auto xl:h-full xl:w-[420px] xl:min-w-[420px] xl:shrink-0 xl:border-l xl:border-[var(--theme-border)] xl:bg-[var(--theme-surface-soft)]",
        className
      )}
    >
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageInput}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleVideoInput}
      />

      <InputStudioHeaderSection
        mode={studioMode}
        onModeChange={setStudioMode}
        onClose={closeDataInput}
      />

      <div className="mb-3 flex items-center gap-2 xl:hidden">
        <Button
          variant={activeTab === "input" ? "default" : "outline"}
          className="h-11 flex-1 text-xs"
          onClick={() => setActiveTab("input")}
        >
          Input
        </Button>
        <Button
          variant={activeTab === "blocks" ? "default" : "outline"}
          className="h-11 flex-1 text-xs"
          onClick={() => setActiveTab("blocks")}
        >
          Blocks
        </Button>
      </div>

      <div
        data-layout-id="region_drafting_content"
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-4 [scrollbar-gutter:stable]"
      >
        <div
          className={cn(
            "flex flex-col gap-3",
            activeTab === "input" ? "flex" : "hidden",
            "xl:flex"
          )}
        >
          <InputStudioRawSection
            rawText={rawText}
            onRawTextChange={handleRawChange}
            syncDecisionCount={syncDecisions.length}
          />

          {studioMode === "advanced" && (
            <StructuredSchemaEditor
              jsonText={schemaJsonText}
              onJsonTextChange={setSchemaJsonText}
              onValidationResult={setSchemaValidation}
              onValidBlocks={handleSchemaValidBlocks}
            />
          )}

          <section className="rounded-lg border border-theme-border/10 bg-theme-surface/30 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-theme-text/70">LLM Draft</p>
              <span className="text-[11px] text-theme-text/45">role: {effectiveRole}</span>
            </div>

            <textarea
              className="mt-2 h-20 w-full resize-none rounded-md border border-theme-border/15 bg-theme-surface/40 p-2 text-xs text-theme-text/85 outline-none focus:border-theme-border/35"
              value={llmPrompt}
              onChange={(event) => {
                setLlmPrompt(event.target.value);
                if (llmError) {
                  clearError();
                }
              }}
              placeholder="프롬프트를 입력하고 초안 생성을 요청하세요."
            />

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                className="h-10 px-3 text-xs"
                disabled={!hasNormalizedPrompt || isLlmRequesting}
                onClick={() => {
                  void handleRequestLlmDraft();
                }}
              >
                {isLlmRequesting ? "요청 중..." : "초안 요청"}
              </Button>
              <Button
                variant="ghost"
                className="h-10 px-3 text-xs text-theme-text/65"
                disabled={!hasCandidate}
                onClick={clearCandidate}
              >
                후보 초기화
              </Button>
            </div>

            {llmError && (
              <p className="mt-2 text-[11px] text-[var(--theme-warning)]">
                요청 실패: {llmError.message}
              </p>
            )}

            {candidate && (
              <div className="mt-3 rounded-md border border-theme-border/10 bg-theme-surface/30 p-2">
                <p className="text-[11px] text-theme-text/70">
                  후보 블록: {candidate.diff.summary.totalCandidate}개 / 변경: {" "}
                  {candidate.diff.summary.changed}개
                </p>
                <p className="mt-1 text-[11px] text-theme-text/45">
                  추가 {candidate.diff.summary.added} / 수정 {candidate.diff.summary.modified} / 삭제 {candidate.diff.summary.removed}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button
                    className="h-10 px-3 text-xs"
                    onClick={handleApplyCandidateToDraft}
                  >
                    초안 반영
                  </Button>
                  <Button
                    variant="outline"
                    className="h-10 px-3 text-xs"
                    onClick={handleQueueCandidateForApproval}
                  >
                    승인 큐 전송
                  </Button>
                </div>
              </div>
            )}
          </section>
        </div>

        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col",
            activeTab === "blocks" ? "flex" : "hidden",
            "xl:flex"
          )}
        >
          <InputStudioBlocksSection
            blocks={blocks}
            editorSurface={editorSurface}
            contentOrderByBlockId={contentOrderByBlockId}
            expandedBlockId={expandedBlockId}
            onExpandedBlockChange={setExpandedBlockId}
            onMoveBlock={moveBlock}
            onMoveBlockByIndex={moveBlockByIndex}
            onDeleteBlock={deleteBlock}
            onInsertionIndexChange={writeInsertionIndex}
            onInsertBreakBlock={insertBreakBlock}
            renderExpandedContent={renderExpandedContent}
          />
        </div>

        {pipelineDiagnostics.length > 0 && (
          <section className="rounded-lg border border-[var(--theme-warning)] bg-[var(--theme-warning-soft)] p-3">
            <p className="text-xs font-semibold text-[var(--theme-text)]">
              검증/파이프라인 진단
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-[11px] text-[var(--theme-text-muted)]">
              {pipelineDiagnostics.map((diagnostic, index) => (
                <li key={`${diagnostic.code}:${diagnostic.path}:${index}`}>
                  {formatDiagnostic(diagnostic)}
                </li>
              ))}
            </ul>
          </section>
        )}

        {schemaValidation && !schemaValidation.ok && (
          <section className="rounded-lg border border-[var(--theme-warning)] bg-[var(--theme-warning-soft)] p-3 text-[11px] text-[var(--theme-text-muted)]">
            스키마 오류 {schemaValidation.issues.length}건이 감지되었습니다.
          </section>
        )}

        {publishMessage && (
          <p className="rounded-md border border-[var(--theme-border)] bg-[var(--theme-surface-soft)] px-2 py-1 text-[11px] text-[var(--theme-text-muted)]">
            {publishMessage}
          </p>
        )}
      </div>

      <InputStudioActionsSection
        onClose={closeDataInput}
        onRestoreLayoutSnapshot={restoreLayoutSnapshot}
        canRestoreLayoutSnapshot={Boolean(layoutSnapshot)}
        onAutoLayout={handleAutoLayout}
        isAutoLayoutRunning={isLayoutRunning}
        onApply={handleApplyToCanvas}
        canApply={canApply}
        unmatchedBlockCount={unmatchedBlocks.length}
        onRestoreUnmatchedBlocks={restoreUnmatchedBlocks}
        onDiscardUnmatchedBlocks={discardUnmatchedBlocks}
      />

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          className="h-10 px-3 text-xs"
          disabled={!rollbackSnapshot}
          onClick={handleRollback}
        >
          입력 롤백
        </Button>
        <Button
          variant="ghost"
          className="h-10 px-3 text-xs text-theme-text/65"
          disabled={!rollbackSnapshot}
          onClick={() => {
            clearSnapshots();
            setPublishMessage(null);
          }}
        >
          스냅샷 초기화
        </Button>
      </div>
    </aside>
  );
}
