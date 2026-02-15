"use client";
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ChangeEvent,
  type UIEvent,
} from "react";

import { useCanvasStore } from "@features/store/useCanvasStore";
import { useUIStore } from "@features/store/useUIStoreBridge";
import { dispatchCommand } from "@core/engine/commandBus";
import { cn } from "@core/utils";
import { Button } from "@ui/components/button";
import type {
  ImageItem,
  StepSegmentType,
  TextItem,
} from "@core/types/canvas";
import {
  DEFAULT_TEXT_LANE_STYLE,
  DEFAULT_TEXT_LINE_HEIGHT,
  TEXT_FONT_FAMILY_OPTIONS,
  TEXT_INLINE_BOLD_CLASS,
  TEXT_INLINE_COLOR_OPTIONS,
  TEXT_INLINE_SIZE_OPTIONS,
  normalizeTextSegmentStyle,
} from "@core/config/typography";
import { runAutoLayout } from "@features/layout/autoLayout";
import { buildEditorSurfaceModel } from "@features/editor-core/model/editorSurface";
import {
  blocksToRawText,
  buildBlocksFromFlowItems,
  normalizeBlocksDraft,
  syncBlocksFromRawText,
} from "@features/layout/dataInput/blockDraft";
import {
  type BreakBlockKind,
  clampBlockInsertionIndex,
  deleteBlockById,
  insertBreakBlockAt,
  moveBlockById as moveBlockByIdOp,
  moveBlockByIndex as moveBlockByIndexOp,
  reindexBlockStructure,
} from "@features/layout/dataInput/blockStructureOps";
import {
  reduceInlineEditCommand,
} from "@features/layout/dataInput/inlineEditCommands";
import {
  captureSelection,
  wrapSelectionWithClass,
  wrapSelectionWithHighlight,
  wrapSelectionWithMath,
} from "@features/layout/dataInput/segmentCommands";
import {
  readImageFile,
  readImageUrl,
  readVideoFile,
  readVideoUrl,
} from "@features/layout/dataInput/mediaIO";
import type { RawSyncDecision, StepBlockDraft } from "@features/layout/dataInput/types";
import {
  ChevronDown,
  ChevronUp,
  Columns,
  CornerDownLeft,
  FilePlus,
  GripVertical,
  ImagePlus,
  Minus,
  PlaySquare,
  Plus,
  Trash2,
  X,
} from "lucide-react";

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

export function DataInputPanel() {
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
  const [rawText, setRawText] = useState("");
  const [blocks, setBlocks] = useState<StepBlockDraft[]>([]);
  const [unmatchedBlocks, setUnmatchedBlocks] = useState<StepBlockDraft[]>([]);
  const [syncDecisions, setSyncDecisions] = useState<RawSyncDecision[]>([]);
  const [activeTab, setActiveTab] = useState<"input" | "blocks">("input");
  const [isAdvancedControls, setIsAdvancedControls] = useState(false);
  const [isLayoutRunning, setIsLayoutRunning] = useState(false);
  const [expandedBlockId, setExpandedBlockId] = useState<string | null>(null);
  const hasInitializedRef = useRef(false);
  const segmentRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const selectionRef = useRef<Record<string, Range | null>>({});
  const markerRailRef = useRef<HTMLDivElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const pendingMediaStepRef = useRef<string | null>(null);
  const canMath = isCapabilityEnabled("data.math");
  const canHighlight = isCapabilityEnabled("data.highlight");

  const writeInsertionIndex = useCallback(
    (index: number) => {
      void dispatchCommand("setInsertionIndex", { index }, {
        meta: { source: "data-input-panel" },
      })
        .catch(() => undefined);
    },
    []
  );

  const writeImportStepBlocks = useCallback(
    (nextBlocks: StepBlockDraft[]) => {
      void dispatchCommand("importStepBlocks", { blocks: nextBlocks }, {
        meta: { source: "data-input-panel" },
      })
        .catch(() => undefined);
    },
    []
  );

  const flowItems = useMemo(() => {
    const items = pages[currentPageId] ?? [];
    return items.filter(
      (item): item is TextItem | ImageItem => {
        if (item.type === "text") {
          return (item.layoutMode ?? "flow") === "flow";
        }
        if (item.type === "image") {
          return (item.layoutMode ?? "flow") === "flow";
        }
        return false;
      }
    );
  }, [pages, currentPageId]);

  const rawLines = useMemo(() => rawText.split(/\r?\n/), [rawText]);
  const isSingleLine = rawLines.length <= 1;
  const lineHeight = isSingleLine ? 1.25 : 1.6;
  const lineHeightClass = isSingleLine
    ? "leading-[1.25]"
    : "leading-[1.6]";

  const fallbackBlocks = useMemo(
    () => buildBlocksFromFlowItems(flowItems),
    [flowItems]
  );

  const editorSurface = useMemo(
    () =>
      buildEditorSurfaceModel(blocks, insertionIndex, {
        previewLabels: EDITOR_SURFACE_PREVIEW_LABELS,
        breakLabels: EDITOR_SURFACE_BREAK_LABELS,
      }),
    [blocks, insertionIndex]
  );

  const contentOrderByBlockId = useMemo(() => {
    const map: Record<string, number | null> = {};
    reindexBlockStructure(blocks).forEach((entry) => {
      map[entry.blockId] = entry.contentOrder;
    });
    return map;
  }, [blocks]);

  useEffect(() => {
    if (!isDataInputOpen) {
      hasInitializedRef.current = false;
      setUnmatchedBlocks([]);
      setSyncDecisions([]);
      setIsAdvancedControls(false);
      setExpandedBlockId(null);
      return;
    }
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;
    setActiveTab("input");
    setIsAdvancedControls(false);

    const initialBlocks = normalizeBlocksDraft(
      stepBlocks.length > 0 ? stepBlocks : fallbackBlocks
    );
    setBlocks(initialBlocks);
    setUnmatchedBlocks([]);
    setSyncDecisions([]);
    setRawText(blocksToRawText(initialBlocks));
    writeInsertionIndex(initialBlocks.length);
    setExpandedBlockId(null);
  }, [fallbackBlocks, isDataInputOpen, stepBlocks, writeInsertionIndex]);

  useEffect(() => {
    if (!isDataInputOpen || !hasInitializedRef.current) return;
    const stripBreaks = (list: StepBlockDraft[]) =>
      list.filter((block) => !block.kind || block.kind === "content");
    const localContent = stripBreaks(blocks);
    const storeContent = stripBreaks(stepBlocks);
    const sameContent =
      localContent.length === storeContent.length &&
      localContent.every((block, index) => block.id === storeContent[index]?.id);
    if (!sameContent) return;
    if (blocks.length === stepBlocks.length) return;
    const normalized = normalizeBlocksDraft(stepBlocks);
    setBlocks(normalized);
    setUnmatchedBlocks([]);
    setSyncDecisions([]);
    setRawText(blocksToRawText(normalized));
  }, [blocks, isDataInputOpen, stepBlocks]);

  useEffect(() => {
    if (!expandedBlockId) return;
    const hasExpandedBlock = blocks.some(
      (block) =>
        block.id === expandedBlockId &&
        (!block.kind || block.kind === "content")
    );
    if (!hasExpandedBlock) {
      setExpandedBlockId(null);
    }
  }, [blocks, expandedBlockId]);

  useEffect(() => {
    const nextInsertionIndex = clampBlockInsertionIndex(
      insertionIndex,
      blocks.length
    );
    if (nextInsertionIndex !== insertionIndex) {
      writeInsertionIndex(nextInsertionIndex);
    }
  }, [blocks.length, insertionIndex, writeInsertionIndex]);

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

  if (!isDataInputOpen) return null;

  const renderInsertionMarker = (index: number) => {
    const marker = editorSurface.insertionMarkers[index];
    const isActive = marker?.isActive ?? false;
    return (
      <button
        type="button"
        className={cn(
          "group flex w-full items-center gap-2 rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.2em]",
          isActive
            ? "text-[var(--theme-text)]"
            : "text-[var(--theme-text-subtle)] hover:text-[var(--theme-text-muted)]"
        )}
        onClick={() => writeInsertionIndex(index)}
      >
        <span
          className={cn(
            "h-px flex-1 transition-colors",
            isActive
              ? "bg-[var(--theme-accent-strong)]"
              : "bg-[var(--theme-surface-soft)] group-hover:bg-[var(--theme-border)]"
          )}
        />
        <span
          className={cn(
            "rounded-full border px-2 py-0.5",
            isActive
              ? "border-[var(--theme-accent)] bg-[var(--theme-accent-soft)]"
              : "border-[var(--theme-border)] bg-[var(--theme-surface-soft)]"
          )}
        >
          삽입
        </span>
        <span
          className={cn(
            "h-px flex-1 transition-colors",
            isActive
              ? "bg-[var(--theme-accent-strong)]"
              : "bg-[var(--theme-surface-soft)] group-hover:bg-[var(--theme-border)]"
          )}
        />
      </button>
    );
  };

  const updateBlocksFromRaw = (value: string) => {
    const syncPool = [...blocks, ...unmatchedBlocks];
    const result = syncBlocksFromRawText(value, syncPool);
    setBlocks(result.blocks);
    setUnmatchedBlocks(result.unmatchedBlocks);
    setSyncDecisions(result.decisions);
  };

  const handleRawChange = (value: string) => {
    setRawText(value);
    updateBlocksFromRaw(value);
  };

  const handleRestoreUnmatched = () => {
    if (unmatchedBlocks.length === 0) return;
    setBlocks((prev) => normalizeBlocksDraft([...prev, ...unmatchedBlocks]));
    setUnmatchedBlocks([]);
  };

  const handleDiscardUnmatched = () => {
    setUnmatchedBlocks([]);
  };

  const handleRawScroll = (event: UIEvent<HTMLTextAreaElement>) => {
    if (!markerRailRef.current) return;
    markerRailRef.current.style.transform = `translateY(-${event.currentTarget.scrollTop}px)`;
  };

  const applyInlineCommand = (command: Parameters<typeof reduceInlineEditCommand>[1]) => {
    setBlocks((prev) => reduceInlineEditCommand(prev, command));
  };

  const updateSegmentHtml = (segmentId: string, html: string) => {
    applyInlineCommand({
      type: "segment/set-html",
      segmentId,
      html,
    });
  };

  const handleSegmentCommit = (segmentId: string) => {
    const el = segmentRefs.current[segmentId];
    if (!el) return;
    updateSegmentHtml(segmentId, el.innerHTML);
  };

  const handleDeleteBlock = (id: string) => {
    const result = deleteBlockById(blocks, id, insertionIndex);
    setBlocks(result.blocks);
    if (result.insertionIndex !== insertionIndex) {
      writeInsertionIndex(result.insertionIndex);
    }
  };

  const toggleBlockExpanded = (blockId: string) => {
    setExpandedBlockId((prev) => (prev === blockId ? null : blockId));
  };

  const updateTextSegmentStyle = (
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
  };

  const adjustTextSegmentFontSize = (
    blockId: string,
    segmentId: string,
    deltaPx: number
  ) => {
    applyInlineCommand({
      type: "block/adjust-text-font-size",
      blockId,
      segmentId,
      deltaPx,
      minPx: FONT_SIZE_MIN_PX,
      maxPx: FONT_SIZE_MAX_PX,
      fallbackPx: DEFAULT_FONT_SIZE_PX,
    });
  };

  const addTextSegment = (blockId: string) => {
    applyInlineCommand({
      type: "block/add-text-segment",
      blockId,
    });
  };

  const addMediaSegment = (
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
  };

  const removeSegment = (blockId: string, segmentId: string) => {
    applyInlineCommand({
      type: "block/remove-segment",
      blockId,
      segmentId,
      fallbackTextHtml: "&nbsp;",
    });
  };

  const moveSegment = (blockId: string, fromId: string, toId: string) => {
    applyInlineCommand({
      type: "block/move-segment",
      blockId,
      fromId,
      toId,
    });
  };

  const moveBlock = (fromId: string, toId: string) => {
    setBlocks((prev) => moveBlockByIdOp(prev, fromId, toId));
  };

  const moveBlockByIndex = (index: number, delta: -1 | 1) => {
    setBlocks((prev) => moveBlockByIndexOp(prev, index, delta));
  };

  const insertBreakBlock = (kind: BreakBlockKind) => {
    const result = insertBreakBlockAt(blocks, insertionIndex, kind);
    setBlocks(result.blocks);
    writeInsertionIndex(result.insertionIndex);
  };

  const handleApply = () => {
    if (unmatchedBlocks.length > 0) return;
    const normalizedBlocks = normalizeBlocksDraft(blocks);
    writeImportStepBlocks(normalizedBlocks);
  };

  const handleMediaPick = (blockId: string, type: StepSegmentType) => {
    pendingMediaStepRef.current = blockId;
    if (type === "image") {
      imageInputRef.current?.click();
    } else if (type === "video") {
      videoInputRef.current?.click();
    }
  };


  const handleImageInput = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    const blockId = pendingMediaStepRef.current;
    pendingMediaStepRef.current = null;
    if (!file || !blockId) return;
    try {
      const data = await readImageFile(file);
      addMediaSegment(blockId, "image", data.src, data.width, data.height);
    } catch {
      // ignore
    }
  };

  const handleVideoInput = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    const blockId = pendingMediaStepRef.current;
    pendingMediaStepRef.current = null;
    if (!file || !blockId) return;
    try {
      const data = await readVideoFile(file);
      addMediaSegment(blockId, "video", data.src, data.width, data.height);
    } catch {
      // ignore
    }
  };

  const handleMediaUrl = async (blockId: string, type: "image" | "video") => {
    const promptLabel = type === "image" ? "이미지 URL" : "비디오 URL";
    const url = window.prompt(promptLabel);
    if (!url) return;
    try {
      if (type === "image") {
        const data = await readImageUrl(url);
        addMediaSegment(blockId, "image", data.src, data.width, data.height);
      } else {
        const data = await readVideoUrl(url);
        addMediaSegment(blockId, "video", data.src, data.width, data.height);
      }
    } catch {
      // ignore
    }
  };

  const handleAutoLayout = async () => {
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
  };

  return (
    <aside
      data-layout-state="state_input_mode"
      className="fixed inset-0 z-50 flex h-[100dvh] w-full flex-col bg-[var(--theme-surface-overlay)] px-4 py-4 backdrop-blur-md overscroll-contain xl:static xl:z-auto xl:h-full xl:w-[420px] xl:min-w-[420px] xl:shrink-0 xl:border-l xl:border-[var(--theme-border)] xl:bg-[var(--theme-surface-soft)]"
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
      <div
        data-layout-id="region_drafting_header"
        className="mb-4 flex items-center justify-between"
      >
        <div>
          <p className="text-sm font-semibold text-white">데이터 입력</p>
          <p className="text-xs text-white/50">한 줄 = 한 블록 (step)</p>
          <div className="mt-2 inline-flex items-center rounded-full border border-white/15 bg-black/40 p-1">
            <button
              type="button"
              className={cn(
                "h-11 min-w-[84px] rounded-full px-4 text-xs font-semibold transition-colors",
                isAdvancedControls
                  ? "text-white/60 hover:bg-white/10 hover:text-white"
                  : "bg-[var(--theme-accent)] text-[var(--theme-accent-text)]"
              )}
              onClick={() => setIsAdvancedControls(false)}
              data-layout-id="action_mode_compact"
            >
              간단
            </button>
            <button
              type="button"
              className={cn(
                "h-11 min-w-[84px] rounded-full px-4 text-xs font-semibold transition-colors",
                isAdvancedControls
                  ? "bg-[var(--theme-accent)] text-[var(--theme-accent-text)]"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              )}
              onClick={() => setIsAdvancedControls(true)}
              data-layout-id="action_mode_advanced"
            >
              상세
            </button>
          </div>
        </div>
        <Button
          data-layout-id="action_return_to_canvas"
          variant="ghost"
          size="icon"
          className="h-11 w-11 text-white/70 hover:text-white"
          onClick={closeDataInput}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

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
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-6 [scrollbar-gutter:stable]"
      >
        <div
          className={cn(
            "flex flex-col gap-2",
            activeTab === "input" ? "flex" : "hidden",
            "xl:flex"
          )}
        >
          <label className="text-xs font-semibold text-white/60">
            원문 입력
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute left-3 top-3 bottom-3 w-4 overflow-hidden text-sm text-white/25">
              <div ref={markerRailRef} className="flex flex-col">
                {rawLines.map((_, index) => (
                  <span
                    key={`marker-${index}`}
                    style={{
                      height: `${lineHeight}em`,
                      lineHeight: `${lineHeight}em`,
                    }}
                  >
                    ·
                  </span>
                ))}
              </div>
            </div>
            <textarea
              className={cn(
                "h-40 w-full resize-none rounded-lg border border-white/10 bg-black/40 pb-3 pl-8 pr-3 pt-3 text-sm text-white/80 outline-none focus:border-white/40",
                lineHeightClass
              )}
              value={rawText}
              onChange={(event) => handleRawChange(event.target.value)}
              onScroll={handleRawScroll}
              placeholder="여기에 문제/풀이를 줄 단위로 붙여넣으세요."
            />
          </div>
          <p className="text-[11px] text-white/40">
            원문 수정 시 블록은 비파괴 동기화됩니다. 매칭 실패 블록은 임시 보관됩니다.
          </p>
          {syncDecisions.length > 0 && (
            <p className="text-[11px] text-white/30">
              동기화 결과: {syncDecisions.length}줄 처리
            </p>
          )}
        </div>

        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col gap-2",
            activeTab === "blocks" ? "flex" : "hidden",
            "xl:flex"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/60">
              블록 미리보기
            </span>
            <span className="text-[11px] text-white/40">
              {blocks.length}개
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              className="h-10 px-3 text-xs"
              onClick={() => insertBreakBlock("line-break")}
            >
              <CornerDownLeft className="mr-1 h-3 w-3" />
              줄바꿈
            </Button>
            <Button
              variant="outline"
              className="h-10 px-3 text-xs"
              onClick={() => insertBreakBlock("column-break")}
            >
              <Columns className="mr-1 h-3 w-3" />
              단나눔
            </Button>
            <Button
              variant="outline"
              className="h-10 px-3 text-xs"
              onClick={() => insertBreakBlock("page-break")}
            >
              <FilePlus className="mr-1 h-3 w-3" />
              페이지
            </Button>
          </div>
          <div className="flex flex-col gap-3 pr-1">
            {editorSurface.blockEntries.map((entry) => {
              const block = blocks[entry.blockIndex];
              if (!block) return null;
              let imageIndex = 0;
              let videoIndex = 0;
              const index = entry.blockIndex;
              const isBreakBlock = entry.isBreakBlock;
              const contentOrder = contentOrderByBlockId[entry.blockId];
              const stepNumber =
                typeof contentOrder === "number" ? contentOrder + 1 : null;
              const breakLabel = entry.breakLabel ?? EDITOR_SURFACE_BREAK_LABELS.fallback;
              const isExpanded =
                !isBreakBlock && expandedBlockId === block.id;
              const blockPreview = entry.preview;
              return (
                  <Fragment key={block.id}>
                    {renderInsertionMarker(index)}
                    <div
                      className={cn(
                        "group rounded-lg border bg-white/5",
                        isBreakBlock
                          ? "min-h-9 border-dashed border-[var(--theme-accent)] bg-[var(--theme-accent-soft)] px-3 py-2"
                          : "border-[var(--theme-border)] p-3"
                      )}
                      draggable
                      onDragStart={(event) => {
                        if (
                          (event.target as HTMLElement)?.closest(
                            "[data-segment-drag]"
                          )
                        ) {
                          event.preventDefault();
                          return;
                        }
                        event.dataTransfer.setData("text/plain", block.id);
                      }}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        const fromId = event.dataTransfer.getData("text/plain");
                        moveBlock(fromId, block.id);
                      }}
                    >
                      <div className={cn("flex items-start gap-2", isBreakBlock && "items-center")}>
                        <div className="text-white/40">
                          <GripVertical className="h-4 w-4" />
                        </div>
                        {isBreakBlock ? (
                          <span className="flex-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--theme-text)] break-label">
                            {breakLabel}
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="min-h-11 min-w-0 flex-1 rounded-md px-1 py-1 text-left hover:bg-white/5"
                            onClick={() => toggleBlockExpanded(block.id)}
                          >
                            <span className="text-xs font-semibold text-white step-label">
                              Step {stepNumber}
                            </span>
                            <p className="mt-1 truncate text-[11px] text-white/45">
                              {blockPreview}
                            </p>
                          </button>
                        )}
                        {!isBreakBlock && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-11 w-11 text-white/60 hover:text-white"
                            onClick={() => toggleBlockExpanded(block.id)}
                            aria-label={isExpanded ? "블록 접기" : "블록 펼치기"}
                          >
                            <ChevronDown
                              className={cn(
                                "h-4 w-4 transition-transform",
                                isExpanded ? "rotate-180" : ""
                              )}
                            />
                          </Button>
                        )}
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-11 w-11 text-white/50 hover:text-white"
                            onClick={() => moveBlockByIndex(index, -1)}
                            disabled={index === 0}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-11 w-11 text-white/50 hover:text-white"
                            onClick={() => moveBlockByIndex(index, 1)}
                            disabled={index === blocks.length - 1}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-11 w-11 text-white/50 hover:text-white"
                            onClick={() => handleDeleteBlock(block.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {!isBreakBlock && isExpanded ? (
                        <div className="mt-3 flex flex-col gap-2">
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
                            const editorStyle: CSSProperties | undefined =
                              textStyle
                                ? {
                                    fontFamily: textStyle.fontFamily,
                                    fontSize: textStyle.fontSize,
                                    fontWeight:
                                      textStyle.fontWeight as CSSProperties["fontWeight"],
                                    color: textStyle.color,
                                    lineHeight: DEFAULT_TEXT_LINE_HEIGHT,
                                  }
                                : undefined;
                            const fontSizePx = textStyle
                              ? parseFontSizePx(
                                  textStyle.fontSize,
                                  DEFAULT_FONT_SIZE_PX
                                )
                              : DEFAULT_FONT_SIZE_PX;
                            const canDecreaseFontSize =
                              fontSizePx > FONT_SIZE_MIN_PX;
                            const canIncreaseFontSize =
                              fontSizePx < FONT_SIZE_MAX_PX;
                            return (
                              <div
                                key={segment.id}
                                className="flex items-start gap-2 rounded-md border border-white/10 bg-black/30 p-2"
                                draggable
                                onDragStart={(event) => {
                                  event.dataTransfer.setData(
                                    "text/plain",
                                    `${block.id}:${segment.id}`
                                  );
                                }}
                                onDragOver={(event) => event.preventDefault()}
                                onDrop={(event) => {
                                  const raw = event.dataTransfer.getData("text/plain");
                                  const [fromBlockId, fromSegmentId] = raw.split(":");
                                  if (fromBlockId !== block.id) return;
                                  moveSegment(block.id, fromSegmentId, segment.id);
                                }}
                              >
                                <div data-segment-drag className="mt-1 text-white/40">
                                  <GripVertical className="h-4 w-4" />
                                </div>
                                <span className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] uppercase text-white/70">
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
                                          "min-h-[40px] rounded-md border border-white/10 bg-black/30 px-2 py-2 text-sm text-white/80 outline-none",
                                          "focus-within:border-white/40"
                                        )}
                                        style={editorStyle}
                                        contentEditable
                                        suppressContentEditableWarning
                                        onBlur={() =>
                                          handleSegmentCommit(segment.id)
                                        }
                                        dangerouslySetInnerHTML={{
                                          __html: segment.html,
                                        }}
                                      />
                                      <div className="flex flex-col gap-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                          <div className="inline-flex h-11 min-w-[192px] items-center gap-2 rounded-md border border-white/15 bg-black/40 px-2">
                                            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/45">
                                              폰트
                                            </span>
                                            <select
                                              className="h-9 flex-1 min-w-[108px] rounded-md border border-white/15 bg-black/50 px-2 text-[11px] text-white/80 outline-none"
                                              value={textStyle?.fontFamily ?? ""}
                                              onChange={(event) =>
                                                updateTextSegmentStyle(
                                                  block.id,
                                                  segment.id,
                                                  {
                                                    fontFamily:
                                                      event.target.value,
                                                  }
                                                )
                                              }
                                            >
                                              {TEXT_FONT_FAMILY_OPTIONS.map(
                                                (option) => (
                                                  <option
                                                    key={option.value}
                                                    value={option.value}
                                                  >
                                                    {option.label}
                                                  </option>
                                                )
                                              )}
                                            </select>
                                          </div>
                                          <div className="inline-flex h-11 items-center rounded-md border border-white/15 bg-black/40">
                                            <Button
                                              variant="ghost"
                                              className="h-11 rounded-r-none px-3 text-[11px] text-white/75 hover:text-white"
                                              onClick={() =>
                                                adjustTextSegmentFontSize(
                                                  block.id,
                                                  segment.id,
                                                  -FONT_SIZE_STEP_PX
                                                )
                                              }
                                              disabled={!canDecreaseFontSize}
                                              aria-label="폰트 크기 줄이기"
                                            >
                                              A-
                                            </Button>
                                            <span className="min-w-[56px] border-x border-[var(--theme-border)] px-2 text-center text-[11px] font-semibold text-[var(--theme-text)]">
                                              {fontSizePx}px
                                            </span>
                                            <Button
                                              variant="ghost"
                                              className="h-11 rounded-l-none px-3 text-[11px] text-white/75 hover:text-white"
                                              onClick={() =>
                                                adjustTextSegmentFontSize(
                                                  block.id,
                                                  segment.id,
                                                  FONT_SIZE_STEP_PX
                                                )
                                              }
                                              disabled={!canIncreaseFontSize}
                                              aria-label="폰트 크기 키우기"
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
                                      </div>
                                      {isAdvancedControls && (
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
                                    </>
                                  ) : (
                                    <div className="flex items-center gap-3 text-xs text-white/60">
                                      {segment.type === "image" ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                          src={segment.src}
                                          alt="preview"
                                          className="h-12 w-12 rounded-md object-cover"
                                        />
                                      ) : (
                                        <div className="flex h-12 w-12 items-center justify-center rounded-md border border-white/20 bg-white/5 text-[10px] tracking-widest text-white/50">
                                          PLAY
                                        </div>
                                      )}
                                      <span className="truncate">
                                        {segment.type === "image"
                                          ? "이미지"
                                          : "비디오"}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-10 w-10 text-white/50 hover:text-white"
                                  onClick={() =>
                                    removeSegment(block.id, segment.id)
                                  }
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                              </div>
                            );
                        })}
                      </div>
                    ) : null}

                      {!isBreakBlock && isExpanded && (
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
                          className="h-10 px-3 text-[11px] text-white/60 hover:text-white"
                          onClick={() => handleMediaUrl(block.id, "image")}
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
                          className="h-10 px-3 text-[11px] text-white/60 hover:text-white"
                          onClick={() => handleMediaUrl(block.id, "video")}
                        >
                          URL
                        </Button>
                      </div>
                    )}
                  </div>
                  </Fragment>
                );
              })}
            {renderInsertionMarker(blocks.length)}
          </div>
        </div>
      </div>

      {unmatchedBlocks.length > 0 && (
        <div className="mt-3 rounded-lg border border-[var(--theme-warning)] bg-[var(--theme-warning-soft)] p-3 text-[var(--theme-text)]">
          <p className="text-xs font-semibold">
            보존 블록 {unmatchedBlocks.length}개가 임시 보관 중입니다.
          </p>
          <p className="mt-1 text-[11px] text-[var(--theme-text-muted)]">
            적용 전 복원 또는 폐기를 선택해야 데이터 유실 없이 진행됩니다.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="h-10 border-[var(--theme-warning)] text-xs text-[var(--theme-text)] hover:bg-[var(--theme-warning-soft)]"
              onClick={handleRestoreUnmatched}
            >
              보존 블록 복원
            </Button>
            <Button
              variant="ghost"
              className="h-10 text-xs text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
              onClick={handleDiscardUnmatched}
            >
              보존 블록 폐기
            </Button>
          </div>
        </div>
      )}

      <div
        data-layout-id="region_drafting_actions"
        className="sticky bottom-0 mt-4 border-t border-[var(--theme-border)] bg-[var(--theme-surface-overlay)] pb-[env(safe-area-inset-bottom)] pt-3 xl:bg-[var(--theme-surface-soft)]"
      >
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="ghost"
            className="h-11 border border-white/20 bg-white/[0.03] text-white/70 hover:bg-white/10"
            onClick={closeDataInput}
          >
            닫기
          </Button>
          <Button
            variant="ghost"
            className="h-11 border border-white/20 bg-white/[0.03] text-white/70 hover:bg-white/10"
            onClick={restoreLayoutSnapshot}
            disabled={!layoutSnapshot}
          >
            되돌리기
          </Button>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="h-11 border-[var(--theme-accent)] bg-[var(--theme-accent-soft)] text-[var(--theme-text)] hover:bg-[var(--theme-accent-strong)]"
            onClick={handleAutoLayout}
            disabled={isLayoutRunning}
          >
            {isLayoutRunning ? "배치 중..." : "Auto Layout"}
          </Button>
          <Button
            className="h-11 bg-[var(--theme-accent)] text-[var(--theme-accent-text)] hover:bg-[var(--theme-accent-strong)] disabled:bg-[var(--theme-surface-soft)] disabled:text-[var(--theme-text-subtle)]"
            onClick={handleApply}
            disabled={unmatchedBlocks.length > 0}
          >
            캔버스에 적용
          </Button>
        </div>
      </div>
    </aside>
  );
}
