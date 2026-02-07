"use client";
import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ChangeEvent,
  type UIEvent,
} from "react";

import { useCanvasStore } from "@features/store/useCanvasStore";
import { useUIStore } from "@features/store/useUIStore";
import { cn } from "@core/utils";
import { Button } from "@ui/components/button";
import type {
  ImageItem,
  StepBlockKind,
  StepSegment,
  StepSegmentType,
  TextItem,
} from "@core/types/canvas";
import {
  DEFAULT_TEXT_LINE_HEIGHT,
  TEXT_FONT_FAMILY_OPTIONS,
  TEXT_INLINE_BOLD_CLASS,
  TEXT_INLINE_COLOR_OPTIONS,
  TEXT_INLINE_SIZE_OPTIONS,
  normalizeTextSegmentStyle,
} from "@core/config/typography";
import { runAutoLayout } from "@features/layout/autoLayout";
import {
  blocksToRawText,
  buildBlocksFromFlowItems,
  createBlockId,
  createBlocksFromRawText,
  createMediaSegment,
  createTextSegment,
  normalizeBlocksDraft,
  normalizeSegments,
  sanitizeDraftHtml,
} from "@features/layout/dataInput/blockDraft";
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
import type { StepBlockDraft } from "@features/layout/dataInput/types";
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
    setInsertionIndex,
    importStepBlocks,
    applyAutoLayout,
    captureLayoutSnapshot,
    restoreLayoutSnapshot,
    layoutSnapshot,
  } = useCanvasStore();
  const [rawText, setRawText] = useState("");
  const [blocks, setBlocks] = useState<StepBlockDraft[]>([]);
  const [activeTab, setActiveTab] = useState<"input" | "blocks">("input");
  const [isLayoutRunning, setIsLayoutRunning] = useState(false);
  const hasInitializedRef = useRef(false);
  const segmentRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const selectionRef = useRef<Record<string, Range | null>>({});
  const markerRailRef = useRef<HTMLDivElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const pendingMediaStepRef = useRef<string | null>(null);
  const canMath = isCapabilityEnabled("data.math");
  const canHighlight = isCapabilityEnabled("data.highlight");

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

  useEffect(() => {
    if (!isDataInputOpen) {
      hasInitializedRef.current = false;
      return;
    }
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;
    setActiveTab("input");

    const initialBlocks = normalizeBlocksDraft(
      stepBlocks.length > 0 ? stepBlocks : fallbackBlocks
    );
    setBlocks(initialBlocks);
    setRawText(blocksToRawText(initialBlocks));
    setInsertionIndex(initialBlocks.length);
  }, [fallbackBlocks, isDataInputOpen, stepBlocks]);

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
    setRawText(blocksToRawText(normalized));
  }, [blocks, isDataInputOpen, stepBlocks]);

  useEffect(() => {
    if (blocks.length < insertionIndex) {
      setInsertionIndex(blocks.length);
    }
  }, [blocks.length, insertionIndex, setInsertionIndex]);

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
    const isActive = insertionIndex === index;
    return (
      <button
        type="button"
        className={cn(
          "group flex w-full items-center gap-2 rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.2em]",
          isActive ? "text-cyan-200" : "text-white/30 hover:text-white/60"
        )}
        onClick={() => setInsertionIndex(index)}
      >
        <span
          className={cn(
            "h-px flex-1 transition-colors",
            isActive ? "bg-cyan-300/80" : "bg-white/10 group-hover:bg-white/20"
          )}
        />
        <span
          className={cn(
            "rounded-full border px-2 py-0.5",
            isActive
              ? "border-cyan-300/70 bg-cyan-400/10"
              : "border-white/10 bg-white/5"
          )}
        >
          삽입
        </span>
        <span
          className={cn(
            "h-px flex-1 transition-colors",
            isActive ? "bg-cyan-300/80" : "bg-white/10 group-hover:bg-white/20"
          )}
        />
      </button>
    );
  };

  const updateBlocksFromRaw = (value: string) => {
    const nextBlocks = createBlocksFromRawText(value);
    setBlocks(nextBlocks);
  };

  const handleRawChange = (value: string) => {
    setRawText(value);
    updateBlocksFromRaw(value);
  };

  const handleRawScroll = (event: UIEvent<HTMLTextAreaElement>) => {
    if (!markerRailRef.current) return;
    markerRailRef.current.style.transform = `translateY(-${event.currentTarget.scrollTop}px)`;
  };

  const updateSegmentHtml = (segmentId: string, html: string) => {
    const cleaned = sanitizeDraftHtml(html);
    setBlocks((prev) =>
      prev.map((block) => ({
        ...block,
        segments: block.segments.map((segment) =>
          segment.id === segmentId && segment.type === "text"
            ? {
                ...segment,
                html: cleaned.trim() === "" ? "&nbsp;" : cleaned,
              }
            : segment
        ),
      }))
    );
  };

  const handleSegmentCommit = (segmentId: string) => {
    const el = segmentRefs.current[segmentId];
    if (!el) return;
    updateSegmentHtml(segmentId, el.innerHTML);
  };

  const handleDeleteBlock = (id: string) => {
    setBlocks((prev) => prev.filter((block) => block.id !== id));
  };

  const updateBlockSegments = (
    blockId: string,
    updater: (segments: StepSegment[]) => StepSegment[]
  ) => {
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === blockId
          ? { ...block, segments: normalizeSegments(updater(block.segments)) }
          : block
      )
    );
  };

  const updateTextSegmentStyle = (
    blockId: string,
    segmentId: string,
    partial: Partial<ReturnType<typeof normalizeTextSegmentStyle>>
  ) => {
    updateBlockSegments(blockId, (segments) =>
      segments.map((segment) => {
        if (segment.id !== segmentId || segment.type !== "text") return segment;
        return {
          ...segment,
          style: normalizeTextSegmentStyle({
            ...segment.style,
            ...partial,
          }),
        };
      })
    );
  };

  const addTextSegment = (blockId: string) => {
    updateBlockSegments(blockId, (segments) => [
      ...segments,
      createTextSegment("&nbsp;", segments.length),
    ]);
  };

  const addMediaSegment = (
    blockId: string,
    type: "image" | "video",
    src: string,
    width: number,
    height: number
  ) => {
    updateBlockSegments(blockId, (segments) => [
      ...segments,
      createMediaSegment(type, src, width, height, segments.length),
    ]);
  };

  const removeSegment = (blockId: string, segmentId: string) => {
    updateBlockSegments(blockId, (segments) => {
      const next = segments.filter((segment) => segment.id !== segmentId);
      const hasText = next.some((segment) => segment.type === "text");
      if (!hasText) {
        return [createTextSegment("&nbsp;", 0), ...next];
      }
      return next;
    });
  };

  const moveSegment = (blockId: string, fromId: string, toId: string) => {
    if (fromId === toId) return;
    updateBlockSegments(blockId, (segments) => {
      const fromIndex = segments.findIndex((segment) => segment.id === fromId);
      const toIndex = segments.findIndex((segment) => segment.id === toId);
      if (fromIndex === -1 || toIndex === -1) return segments;
      const next = [...segments];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const moveBlock = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    setBlocks((prev) => {
      const fromIndex = prev.findIndex((block) => block.id === fromId);
      const toIndex = prev.findIndex((block) => block.id === toId);
      if (fromIndex === -1 || toIndex === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const moveBlockByIndex = (index: number, delta: -1 | 1) => {
    setBlocks((prev) => {
      const targetIndex = index + delta;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  };

  const insertBreakBlock = (kind: StepBlockKind) => {
    const safeIndex = Math.max(0, Math.min(insertionIndex, blocks.length));
    setBlocks((prev) => {
      const next = [...prev];
      next.splice(safeIndex, 0, {
        id: createBlockId(),
        kind,
        segments: [],
      });
      return next;
    });
    setInsertionIndex(Math.min(safeIndex + 1, blocks.length + 1));
  };

  const handleApply = () => {
    const normalizedBlocks = normalizeBlocksDraft(blocks);
    importStepBlocks(normalizedBlocks);
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
      className="fixed inset-0 z-50 flex h-[100dvh] w-full flex-col bg-slate-900/95 px-4 py-4 backdrop-blur-md overscroll-contain xl:static xl:z-auto xl:h-full xl:w-[420px] xl:min-w-[420px] xl:shrink-0 xl:border-l xl:border-white/10 xl:bg-black/40"
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
            원문을 수정하면 블록이 다시 생성됩니다.
          </p>
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
              className="h-8 px-2 text-xs"
              onClick={() => insertBreakBlock("line-break")}
            >
              <CornerDownLeft className="mr-1 h-3 w-3" />
              줄바꿈
            </Button>
            <Button
              variant="outline"
              className="h-8 px-2 text-xs"
              onClick={() => insertBreakBlock("column-break")}
            >
              <Columns className="mr-1 h-3 w-3" />
              단나눔
            </Button>
            <Button
              variant="outline"
              className="h-8 px-2 text-xs"
              onClick={() => insertBreakBlock("page-break")}
            >
              <FilePlus className="mr-1 h-3 w-3" />
              페이지
            </Button>
          </div>
          <div className="flex flex-col gap-3 pr-1">
            {(() => {
              let contentIndex = 0;
              return blocks.map((block, index) => {
                let imageIndex = 0;
                let videoIndex = 0;
                const isBreakBlock =
                  Boolean(block.kind) && block.kind !== "content";
                const stepNumber = isBreakBlock ? null : ++contentIndex;
                const breakLabel =
                  block.kind === "line-break"
                    ? "줄바꿈"
                    : block.kind === "column-break"
                      ? "단 나눔"
                      : block.kind === "page-break"
                        ? "페이지 이동"
                        : "구분선";
                return (
                  <Fragment key={block.id}>
                    {renderInsertionMarker(index)}
                    <div
                      className={cn(
                        "group rounded-lg border border-white/10 bg-white/5",
                        isBreakBlock ? "px-3 py-2" : "p-3"
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
                      <div className="flex items-center gap-2">
                        <div className="text-white/40">
                          <GripVertical className="h-4 w-4" />
                        </div>
                        {isBreakBlock ? (
                          <span className="text-xs break-label">{breakLabel}</span>
                        ) : (
                          <span className="text-xs step-label">
                            Step {stepNumber}
                          </span>
                        )}
                        <div className="ml-auto flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-white/50 hover:text-white"
                            onClick={() => moveBlockByIndex(index, -1)}
                            disabled={index === 0}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-white/50 hover:text-white"
                            onClick={() => moveBlockByIndex(index, 1)}
                            disabled={index === blocks.length - 1}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-white/50 hover:text-white"
                            onClick={() => handleDeleteBlock(block.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {!isBreakBlock ? (
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
                                          "min-h-[28px] rounded-md border border-white/10 bg-black/30 px-2 py-1 text-sm text-white/80 outline-none",
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
                                      <div className="flex flex-wrap items-center gap-2">
                                        <select
                                          className="h-7 rounded-md border border-white/15 bg-black/40 px-2 text-[11px] text-white/80 outline-none"
                                          value={textStyle?.fontFamily ?? ""}
                                          onChange={(event) =>
                                            updateTextSegmentStyle(
                                              block.id,
                                              segment.id,
                                              { fontFamily: event.target.value }
                                            )
                                          }
                                        >
                                          {TEXT_FONT_FAMILY_OPTIONS.map((option) => (
                                            <option
                                              key={option.value}
                                              value={option.value}
                                            >
                                              {option.label}
                                            </option>
                                          ))}
                                        </select>
                                        <Button
                                          variant="outline"
                                          className="h-7 px-2 text-[11px] font-bold"
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
                                        {TEXT_INLINE_COLOR_OPTIONS.map((option) => (
                                          <Button
                                            key={`${segment.id}-${option.className}`}
                                            variant="outline"
                                            className="h-7 px-2 text-[11px]"
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
                                            className="h-7 px-2 text-[11px]"
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
                                        {canMath && (
                                          <Button
                                            variant="outline"
                                            className="h-7 px-2 text-[11px]"
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
                                            className="h-7 px-2 text-[11px]"
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
                                    </>
                                  ) : (
                                    <div className="flex items-center gap-3 text-xs text-white/60">
                                      {segment.type === "image" ? (
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
                                  className="h-7 w-7 text-white/50 hover:text-white"
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

                    {!isBreakBlock && (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Button
                          variant="outline"
                          className="h-8 px-2 text-xs"
                          onClick={() => addTextSegment(block.id)}
                        >
                          <Plus className="mr-1 h-3 w-3" />
                          Text
                        </Button>
                        <Button
                          variant="outline"
                          className="h-8 px-2 text-xs"
                          onClick={() => handleMediaPick(block.id, "image")}
                        >
                          <ImagePlus className="mr-1 h-3 w-3" />
                          Image
                        </Button>
                        <Button
                          variant="ghost"
                          className="h-8 px-2 text-[11px] text-white/60 hover:text-white"
                          onClick={() => handleMediaUrl(block.id, "image")}
                        >
                          URL
                        </Button>
                        <Button
                          variant="outline"
                          className="h-8 px-2 text-xs"
                          onClick={() => handleMediaPick(block.id, "video")}
                        >
                          <PlaySquare className="mr-1 h-3 w-3" />
                          Video
                        </Button>
                        <Button
                          variant="ghost"
                          className="h-8 px-2 text-[11px] text-white/60 hover:text-white"
                          onClick={() => handleMediaUrl(block.id, "video")}
                        >
                          URL
                        </Button>
                      </div>
                    )}
                  </div>
                  </Fragment>
                );
              });
            })()}
            {renderInsertionMarker(blocks.length)}
          </div>
        </div>
      </div>

      <div
        data-layout-id="region_drafting_actions"
        className="sticky bottom-0 mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 bg-slate-900/95 pb-[env(safe-area-inset-bottom)] pt-3 xl:bg-black/40"
      >
        <Button
          variant="outline"
          className="flex-1 border-white/20 text-white/70 hover:bg-white/10"
          onClick={closeDataInput}
        >
          닫기
        </Button>
        <Button
          variant="outline"
          className="flex-1 border-white/20 text-white/70 hover:bg-white/10"
          onClick={restoreLayoutSnapshot}
          disabled={!layoutSnapshot}
        >
          되돌리기
        </Button>
        <Button
          variant="outline"
          className="flex-1 border-white/20 text-white/70 hover:bg-white/10"
          onClick={handleAutoLayout}
          disabled={isLayoutRunning}
        >
          {isLayoutRunning ? "배치 중..." : "Auto Layout"}
        </Button>
        <Button className="flex-1" onClick={handleApply}>
          캔버스에 적용
        </Button>
      </div>
    </aside>
  );
}
