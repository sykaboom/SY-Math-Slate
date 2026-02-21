import { create } from "zustand";

import type {
  AnchorMap,
  CanvasItem,
  ModInput,
  PersistedCanvasV2,
  PersistedSlateDoc,
  StepAudio,
  StepBlock,
  StepSegment,
  StrokeItem,
} from "@core/foundation/types/canvas";
import { getBoardPadding } from "@core/foundation/policies/boardSpec";
import { toTextItemStyle } from "@core/ui/theming/engine/typography";
import { runAutoLayout } from "@features/chrome/layout/autoLayout";
import { useUIStore } from "@features/platform/store/useUIStoreBridge";

export type StrokeInput = Omit<
  StrokeItem,
  "id" | "type" | "x" | "y" | "zIndex"
> &
  Partial<Pick<StrokeItem, "id" | "x" | "y" | "zIndex">>;

type StrokeRedoEntry = {
  index: number;
  stroke: StrokeItem;
};

interface CanvasState extends PersistedCanvasV2 {
  currentStroke: StrokeItem | null;
  selectedItemId: string | null;
  strokeRedoByPage: Record<string, StrokeRedoEntry[]>;
  stepBlocks: StepBlock[];
  audioByStep: Record<number, StepAudio>;
  animationModInput: ModInput | null;
  insertionIndex: number;
  anchorMap: AnchorMap | null;
  layoutSnapshot: PersistedCanvasV2 | null;
  setCurrentStroke: (stroke: StrokeItem | null) => void;
  addStroke: (stroke: StrokeInput) => void;
  seedItems: (items: CanvasItem[]) => void;
  addItem: (item: CanvasItem) => void;
  selectItem: (id: string | null) => void;
  updateItem: (id: string, partial: Partial<CanvasItem>) => void;
  deleteItem: (id: string) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  setColumnCount: (count: number) => void;
  increaseColumns: () => void;
  decreaseColumns: () => void;
  addPage: () => void;
  deletePage: (pageId?: string) => void;
  goToPage: (pageId: string) => void;
  isPageEmpty: (pageId: string) => boolean;
  undo: () => void;
  redo: () => void;
  clear: () => void;
  importStepBlocks: (blocks: StepBlock[]) => void;
  setAnimationModInput: (input: ModInput | null) => void;
  setInsertionIndex: (index: number) => void;
  setStepAudio: (stepIndex: number, audio: StepAudio) => void;
  clearStepAudio: (stepIndex: number) => void;
  clearAllAudio: () => void;
  insertBreak: (
    type: "line" | "column" | "page",
    options?: { panelOpen?: boolean }
  ) => void;
  applyAutoLayout: (payload: {
    pages: Record<string, CanvasItem[]>;
    pageOrder: string[];
    pageColumnCounts: Record<string, number>;
    anchorMap: AnchorMap;
    stepBlocks?: StepBlock[];
  }) => void;
  captureLayoutSnapshot: () => void;
  restoreLayoutSnapshot: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  resetStep: () => void;
  hydrate: (data: PersistedSlateDoc) => void;
}

const createPageId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `page-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const createItemId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `item-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const createInitialState = () => {
  const firstPageId = createPageId();
  const defaultColumns = 2;
  return {
    pages: { [firstPageId]: [] as CanvasItem[] },
    pageOrder: [firstPageId],
    currentPageId: firstPageId,
    currentStep: 0,
    pageColumnCounts: { [firstPageId]: defaultColumns },
    stepBlocks: [] as StepBlock[],
    audioByStep: {} as Record<number, StepAudio>,
    animationModInput: null as ModInput | null,
    insertionIndex: 0,
    anchorMap: null,
    layoutSnapshot: null,
    strokeRedoByPage: {} as Record<string, StrokeRedoEntry[]>,
  };
};

const getMaxStepIndex = (items: CanvasItem[]) => {
  return items.reduce((max, item) => {
    if (item.type !== "text" && item.type !== "image") return max;
    const mode =
      item.type === "text" || item.type === "image"
        ? item.layoutMode ?? "flow"
        : "flow";
    if (mode !== "flow") return max;
    const stepIndex = typeof item.stepIndex === "number" ? item.stepIndex : 0;
    return Math.max(max, stepIndex);
  }, -1);
};

const getGlobalMaxStep = (
  pages: Record<string, CanvasItem[]>,
  blocks: StepBlock[]
) => {
  if (blocks.length > 0) return blocks.length - 1;
  return Object.values(pages).reduce((max, items) => {
    return Math.max(max, getMaxStepIndex(items));
  }, -1);
};

const findPageForStep = (
  pages: Record<string, CanvasItem[]>,
  anchorMap: AnchorMap | null,
  stepIndex: number
) => {
  if (anchorMap) {
    for (const [pageId, steps] of Object.entries(anchorMap)) {
      const anchors = steps[stepIndex];
      if (anchors && anchors.length > 0) return pageId;
    }
  }
  for (const [pageId, items] of Object.entries(pages)) {
    const hasStep = items.some((item) => {
      if (item.type !== "text" && item.type !== "image") return false;
      const mode = item.layoutMode ?? "flow";
      if (mode !== "flow") return false;
      const resolved = typeof item.stepIndex === "number" ? item.stepIndex : 0;
      return resolved === stepIndex;
    });
    if (hasStep) return pageId;
  }
  return null;
};

const hasBreakAnchors = (
  anchorMap: AnchorMap | null | undefined,
  blocks: StepBlock[]
) => {
  if (!anchorMap) return false;
  return blocks.every((block, index) => {
    if (!isBreakBlock(block)) return true;
    return Object.values(anchorMap).some((pageAnchors) =>
      pageAnchors[index]?.some((anchor) => anchor.segmentId === block.id)
    );
  });
};

const createStrokeItem = (
  stroke: StrokeInput,
  zIndexFallback: number
): StrokeItem => {
  return {
    id: stroke.id ?? createItemId(),
    type: "stroke",
    tool: stroke.tool,
    path: stroke.path,
    color: stroke.color,
    width: stroke.width,
    penType: stroke.penType,
    alpha: stroke.alpha,
    pointerType: stroke.pointerType,
    x: stroke.x ?? 0,
    y: stroke.y ?? 0,
    zIndex: stroke.zIndex ?? zIndexFallback,
  };
};

const clearStrokeRedoForPage = (
  historyByPage: Record<string, StrokeRedoEntry[]>,
  pageId: string
) => {
  if (!(pageId in historyByPage)) return historyByPage;
  const next = { ...historyByPage };
  delete next[pageId];
  return next;
};

const CONTENT_PADDING = getBoardPadding();
const COLUMN_GAP = 48;

const createBreakBlock = (
  kind: StepBlock["kind"],
  id?: string
): StepBlock => {
  return { id: id ?? createPageId(), kind, segments: [] };
};

const getColumnWidth = (columnCount: number) => {
  const boardWidth = 1920;
  const padding = CONTENT_PADDING * 2;
  const gap = COLUMN_GAP * (columnCount - 1);
  const innerWidth = boardWidth - padding;
  return Math.max(1, (innerWidth - gap) / columnCount);
};

const normalizeDocVersion = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 2;
};

const isContentBlock = (block: StepBlock) =>
  !block.kind || block.kind === "content";

const isBreakBlock = (block: StepBlock) =>
  Boolean(block.kind) && block.kind !== "content";

const findBlockIndexForStep = (blocks: StepBlock[], stepIndex: number) => {
  return Math.max(0, Math.min(stepIndex, blocks.length));
};

const findBlockIndexForSegment = (
  blocks: StepBlock[],
  segmentId: string
) => {
  return blocks.findIndex((block) =>
    block.segments.some((segment) => segment.id === segmentId)
  );
};

const getContentIndexAtBlockIndex = (
  blocks: StepBlock[],
  targetIndex: number
) => {
  let contentIndex = 0;
  const limit = Math.max(0, Math.min(targetIndex, blocks.length));
  for (let i = 0; i < limit; i += 1) {
    if (isContentBlock(blocks[i])) contentIndex += 1;
  }
  return contentIndex;
};

const pageHasAnchors = (
  anchorMap: AnchorMap | null | undefined,
  pageId: string
) => {
  if (!anchorMap) return false;
  const pageAnchors = anchorMap[pageId];
  if (!pageAnchors) return false;
  return Object.values(pageAnchors).some((anchors) => anchors.length > 0);
};

const pageHasItems = (
  pages: Record<string, CanvasItem[]>,
  pageId: string
) => {
  const items = pages[pageId] ?? [];
  return items.length > 0;
};

const resolveTargetIndex = (
  state: CanvasState,
  options?: { panelOpen?: boolean }
) => {
  if (options?.panelOpen) {
    return Math.max(0, Math.min(state.insertionIndex, state.stepBlocks.length));
  }
  if (state.selectedItemId) {
    const items = Object.values(state.pages).flatMap((page) => page);
    const selected = items.find((item) => item.id === state.selectedItemId);
    if (selected && "segmentId" in selected && selected.segmentId) {
      const index = findBlockIndexForSegment(
        state.stepBlocks,
        selected.segmentId
      );
      if (index >= 0) return index;
    }
  }
  return findBlockIndexForStep(state.stepBlocks, state.currentStep);
};

const buildPagesFromBlocks = (
  blocks: StepBlock[],
  state: CanvasState
): {
  pages: Record<string, CanvasItem[]>;
  pageOrder: string[];
  pageColumnCounts: Record<string, number>;
  contentPlacements: Map<number, { pageId: string; stepIndex: number }>;
} => {
  const basePageId = state.currentPageId;
  const baseColumns = state.pageColumnCounts?.[basePageId] ?? 2;
  const existing = state.pages[basePageId] ?? [];
  const kept = existing.filter((item) => {
    if (item.type === "stroke") return true;
    if (item.type === "text") {
      const mode = item.layoutMode ?? "flow";
      return mode !== "flow";
    }
    if (item.type === "image") {
      const mode = item.layoutMode ?? "flow";
      return mode !== "flow";
    }
    return true;
  });
  const pages: Record<string, CanvasItem[]> = {
    [basePageId]: [...kept],
  };
  const pageOrder = [basePageId];
  const pageColumnCounts: Record<string, number> = {
    ...(state.pageColumnCounts ?? {}),
    [basePageId]: baseColumns,
  };
  const zIndexByPage = new Map<string, number>([
    [basePageId, kept.length],
  ]);
  const contentPlacements = new Map<
    number,
    { pageId: string; stepIndex: number }
  >();
  let currentPageId = basePageId;
  let stepIndex = 0;
  let contentIndex = 0;
  const columnWidth = getColumnWidth(baseColumns);

  blocks.forEach((block) => {
    if (block.kind === "page-break") {
      currentPageId = createPageId();
      pages[currentPageId] = [];
      pageOrder.push(currentPageId);
      pageColumnCounts[currentPageId] = baseColumns;
      zIndexByPage.set(currentPageId, 0);
      stepIndex += 1;
      return;
    }
    if (!isBreakBlock(block)) {
      contentPlacements.set(contentIndex, { pageId: currentPageId, stepIndex });
      contentIndex += 1;
    } else {
      const zIndex = zIndexByPage.get(currentPageId) ?? 0;
      const html =
        block.kind === "column-break"
          ? '<div class="force-break"></div>'
          : '<span class="line-break-spacer">&nbsp;</span>';
      pages[currentPageId].push({
        id: createItemId(),
        type: "text",
        content: html,
        layoutMode: "flow",
        stepIndex,
        x: 0,
        y: 0,
        zIndex,
        style: toTextItemStyle(undefined),
        segmentId: block.id,
      });
      zIndexByPage.set(currentPageId, zIndex + 1);
      stepIndex += 1;
      return;
    }
    const sorted = [...block.segments].sort(
      (a, b) => a.orderIndex - b.orderIndex
    );
    sorted.forEach((segment) => {
      const zIndex = zIndexByPage.get(currentPageId) ?? 0;
      if (segment.type === "text") {
        pages[currentPageId].push({
          id: createItemId(),
          type: "text",
          content: segment.html,
          layoutMode: "flow",
          stepIndex,
          x: 0,
          y: 0,
          zIndex,
          style: toTextItemStyle(segment.style),
          segmentId: segment.id,
        });
        zIndexByPage.set(currentPageId, zIndex + 1);
        return;
      }
      if (segment.type === "image" || segment.type === "video") {
        const { width, height } = fitMediaToColumn(segment, columnWidth);
        pages[currentPageId].push({
          id: createItemId(),
          type: "image",
          src: segment.src,
          w: width,
          h: height,
          layoutMode: "flow",
          stepIndex,
          x: 0,
          y: 0,
          zIndex,
          segmentId: segment.id,
          mediaType: segment.type === "video" ? "video" : "image",
        });
        zIndexByPage.set(currentPageId, zIndex + 1);
      }
    });
    stepIndex += 1;
  });

  return { pages, pageOrder, pageColumnCounts, contentPlacements };
};

export const useCanvasStore = create<CanvasState>((set, get) => {
  const initial = createInitialState();

  return {
    version: 2,
    ...initial,
    currentStroke: null,
    selectedItemId: null,
    stepBlocks: initial.stepBlocks,
    insertionIndex: initial.insertionIndex,
    anchorMap: initial.anchorMap,
    layoutSnapshot: initial.layoutSnapshot,
    strokeRedoByPage: initial.strokeRedoByPage,
    setCurrentStroke: (stroke) => set(() => ({ currentStroke: stroke })),
    addStroke: (stroke) =>
      set((state) => {
        const pageId = state.currentPageId;
        const existing = state.pages[pageId] ?? [];
        const item = createStrokeItem(stroke, existing.length);
        return {
          pages: {
            ...state.pages,
            [pageId]: [...existing, item],
          },
          currentStroke: null,
          strokeRedoByPage: clearStrokeRedoForPage(
            state.strokeRedoByPage,
            pageId
          ),
        };
      }),
    seedItems: (items) =>
      set((state) => {
        const pageId = state.currentPageId;
        const existing = state.pages[pageId] ?? [];
        if (existing.length > 0) return {};
        return {
          pages: {
            ...state.pages,
            [pageId]: items,
          },
          strokeRedoByPage: clearStrokeRedoForPage(
            state.strokeRedoByPage,
            pageId
          ),
        };
      }),
    addItem: (item) =>
      set((state) => {
        const pageId = state.currentPageId;
        const existing = state.pages[pageId] ?? [];
        const normalized: CanvasItem = {
          ...item,
          id: item.id || createItemId(),
          zIndex: Number.isFinite(item.zIndex) ? item.zIndex : existing.length,
        };
        return {
          pages: {
            ...state.pages,
            [pageId]: [...existing, normalized],
          },
          strokeRedoByPage: clearStrokeRedoForPage(
            state.strokeRedoByPage,
            pageId
          ),
        };
      }),
    selectItem: (id) => set(() => ({ selectedItemId: id })),
    updateItem: (id, partial) =>
      set((state) => {
        const pageId = state.currentPageId;
        const existing = state.pages[pageId] ?? [];
        const index = existing.findIndex((item) => item.id === id);
        if (index === -1) return {};
        const current = existing[index];
        const updated: CanvasItem = {
          ...current,
          ...partial,
          id: current.id,
          type: current.type,
        } as CanvasItem;
        const next = [...existing];
        next[index] = updated;
        return {
          pages: {
            ...state.pages,
            [pageId]: next,
          },
          strokeRedoByPage: clearStrokeRedoForPage(
            state.strokeRedoByPage,
            pageId
          ),
        };
      }),
    deleteItem: (id) =>
      set((state) => {
        const pageId = state.currentPageId;
        const existing = state.pages[pageId] ?? [];
        const next = existing.filter((item) => item.id !== id);
        if (next.length === existing.length) return {};
        return {
          pages: {
            ...state.pages,
            [pageId]: next,
          },
          selectedItemId:
            state.selectedItemId === id ? null : state.selectedItemId,
          strokeRedoByPage: clearStrokeRedoForPage(
            state.strokeRedoByPage,
            pageId
          ),
        };
      }),
    bringToFront: (id) =>
      set((state) => {
        const pageId = state.currentPageId;
        const existing = state.pages[pageId] ?? [];
        const target = existing.find((item) => item.id === id);
        if (!target) return {};
        const maxZ = existing.reduce(
          (max, item) => Math.max(max, item.zIndex ?? 0),
          0
        );
        const next = existing.map((item) =>
          item.id === id ? { ...item, zIndex: maxZ + 1 } : item
        );
        return {
          pages: { ...state.pages, [pageId]: next },
          strokeRedoByPage: clearStrokeRedoForPage(
            state.strokeRedoByPage,
            pageId
          ),
        };
      }),
    sendToBack: (id) =>
      set((state) => {
        const pageId = state.currentPageId;
        const existing = state.pages[pageId] ?? [];
        const target = existing.find((item) => item.id === id);
        if (!target) return {};
        const minZ = existing.reduce(
          (min, item) => Math.min(min, item.zIndex ?? 0),
          0
        );
        const next = existing.map((item) =>
          item.id === id ? { ...item, zIndex: minZ - 1 } : item
        );
        return {
          pages: { ...state.pages, [pageId]: next },
          strokeRedoByPage: clearStrokeRedoForPage(
            state.strokeRedoByPage,
            pageId
          ),
        };
      }),
    setColumnCount: (count) =>
      set((state) => {
        const safe = Math.min(4, Math.max(1, count));
        return {
          pageColumnCounts: {
            ...(state.pageColumnCounts ?? {}),
            [state.currentPageId]: safe,
          },
        };
      }),
    increaseColumns: () =>
      set((state) => {
        const current =
          state.pageColumnCounts?.[state.currentPageId] ?? 2;
        const next = Math.min(4, current + 1);
        return {
          pageColumnCounts: {
            ...(state.pageColumnCounts ?? {}),
            [state.currentPageId]: next,
          },
        };
      }),
    decreaseColumns: () =>
      set((state) => {
        const current =
          state.pageColumnCounts?.[state.currentPageId] ?? 2;
        const next = Math.max(1, current - 1);
        return {
          pageColumnCounts: {
            ...(state.pageColumnCounts ?? {}),
            [state.currentPageId]: next,
          },
        };
      }),
    addPage: () =>
      set((state) => {
        const newPageId = createPageId();
        const currentColumns =
          state.pageColumnCounts?.[state.currentPageId] ?? 2;
        return {
          pages: {
            ...state.pages,
            [newPageId]: [],
          },
          pageOrder: [...state.pageOrder, newPageId],
          currentPageId: newPageId,
          pageColumnCounts: {
            ...(state.pageColumnCounts ?? {}),
            [newPageId]: currentColumns,
          },
        };
      }),
    deletePage: (pageId) =>
      set((state) => {
        const targetId = pageId ?? state.currentPageId;
        if (!state.pageOrder.includes(targetId)) return {};
        if (!state.pageOrder || state.pageOrder.length <= 1) return {};

        const hasItems = pageHasItems(state.pages, targetId);
        const hasAnchors = pageHasAnchors(state.anchorMap, targetId);
        if (hasItems || hasAnchors) return {};

        const nextPages = { ...state.pages };
        delete nextPages[targetId];

        const nextOrder = state.pageOrder.filter((id) => id !== targetId);
        const nextColumns = { ...(state.pageColumnCounts ?? {}) };
        delete nextColumns[targetId];

        const nextAnchorMap = state.anchorMap
          ? { ...state.anchorMap }
          : null;
        if (nextAnchorMap) {
          delete nextAnchorMap[targetId];
        }

        let nextCurrent = state.currentPageId;
        if (targetId === state.currentPageId) {
          const targetIndex = state.pageOrder.indexOf(targetId);
          nextCurrent =
            nextOrder[targetIndex] ??
            nextOrder[targetIndex - 1] ??
            nextOrder[0];
        }

        return {
          pages: nextPages,
          pageOrder: nextOrder,
          currentPageId: nextCurrent ?? state.currentPageId,
          pageColumnCounts: nextColumns,
          anchorMap: nextAnchorMap,
          strokeRedoByPage: clearStrokeRedoForPage(
            state.strokeRedoByPage,
            targetId
          ),
        };
      }),
    goToPage: (pageId) =>
      set((state) => {
        if (!state.pageOrder.includes(pageId)) return {};
        return { currentPageId: pageId };
      }),
    isPageEmpty: (pageId) => {
      const state = get();
      return (
        !pageHasItems(state.pages, pageId) &&
        !pageHasAnchors(state.anchorMap, pageId)
      );
    },
    undo: () =>
      set((state) => {
        const pageId = state.currentPageId;
        const existing = state.pages[pageId] ?? [];
        let lastStrokeIndex = -1;
        for (let i = existing.length - 1; i >= 0; i -= 1) {
          if (existing[i].type === "stroke") {
            lastStrokeIndex = i;
            break;
          }
        }
        if (lastStrokeIndex === -1) return {};
        const stroke = existing[lastStrokeIndex];
        if (stroke.type !== "stroke") return {};
        const history = state.strokeRedoByPage[pageId] ?? [];
        return {
          pages: {
            ...state.pages,
            [pageId]: existing.filter((_, index) => index !== lastStrokeIndex),
          },
          strokeRedoByPage: {
            ...state.strokeRedoByPage,
            [pageId]: [...history, { index: lastStrokeIndex, stroke }],
          },
        };
      }),
    redo: () =>
      set((state) => {
        const pageId = state.currentPageId;
        const history = state.strokeRedoByPage[pageId] ?? [];
        if (history.length === 0) return {};
        const entry = history[history.length - 1];
        const existing = state.pages[pageId] ?? [];
        const insertIndex = Math.max(0, Math.min(entry.index, existing.length));
        const nextPageItems = [...existing];
        nextPageItems.splice(insertIndex, 0, entry.stroke);
        const nextHistory = history.slice(0, -1);
        const nextHistoryByPage =
          nextHistory.length > 0
            ? { ...state.strokeRedoByPage, [pageId]: nextHistory }
            : clearStrokeRedoForPage(state.strokeRedoByPage, pageId);
        return {
          pages: {
            ...state.pages,
            [pageId]: nextPageItems,
          },
          strokeRedoByPage: nextHistoryByPage,
        };
      }),
    clear: () =>
      set((state) => {
        const pageId = state.currentPageId;
        return {
          pages: {
            ...state.pages,
            [pageId]: [],
          },
          currentStroke: null,
          strokeRedoByPage: clearStrokeRedoForPage(
            state.strokeRedoByPage,
            pageId
          ),
        };
      }),
    importStepBlocks: (blocks) =>
      set((state) => {
        const built = buildPagesFromBlocks(blocks, state);
        const firstStepPage =
          findPageForStep(built.pages, null, 0) ?? built.pageOrder[0];
        return {
          pages: built.pages,
          pageOrder: built.pageOrder,
          currentPageId: firstStepPage ?? state.currentPageId,
          currentStep: 0,
          pageColumnCounts: built.pageColumnCounts,
          stepBlocks: blocks,
          insertionIndex: blocks.length,
          anchorMap: null,
          strokeRedoByPage: {},
        };
      }),
    setAnimationModInput: (input) =>
      set(() => ({
        animationModInput: input,
      })),
    setInsertionIndex: (index) =>
      set((state) => {
        const max = state.stepBlocks.length;
        const next = Math.max(0, Math.min(index, max));
        if (next === state.insertionIndex) return {};
        return { insertionIndex: next };
      }),
    setStepAudio: (stepIndex, audio) =>
      set((state) => ({
        audioByStep: {
          ...state.audioByStep,
          [stepIndex]: audio,
        },
      })),
    clearStepAudio: (stepIndex) =>
      set((state) => {
        if (!(stepIndex in state.audioByStep)) return {};
        const next = { ...state.audioByStep };
        delete next[stepIndex];
        return { audioByStep: next };
      }),
    clearAllAudio: () => set(() => ({ audioByStep: {} })),
    insertBreak: (type, options) =>
      set((state) => {
        const targetIndex = resolveTargetIndex(state, options);
        const focusContentIndex = getContentIndexAtBlockIndex(
          state.stepBlocks,
          targetIndex
        );
        const kind: StepBlock["kind"] =
          type === "line"
            ? "line-break"
            : type === "column"
              ? "column-break"
              : "page-break";
        const nextBlocks = [...state.stepBlocks];
        nextBlocks.splice(targetIndex, 0, createBreakBlock(kind));
        const built = buildPagesFromBlocks(nextBlocks, state);
        const placement = built.contentPlacements.get(focusContentIndex) ?? null;
        return {
          pages: built.pages,
          pageOrder: built.pageOrder,
          currentPageId: placement?.pageId ?? state.currentPageId,
          currentStep: placement?.stepIndex ?? state.currentStep,
          pageColumnCounts: built.pageColumnCounts,
          stepBlocks: nextBlocks,
          anchorMap: null,
          strokeRedoByPage: {},
        };
      }),
    applyAutoLayout: (payload) =>
      set((state) => {
        const firstStepPage =
          findPageForStep(payload.pages, payload.anchorMap, 0) ??
          payload.pageOrder[0];
        return {
          pages: payload.pages,
          pageOrder: payload.pageOrder,
          currentPageId: firstStepPage ?? state.currentPageId,
          currentStep: 0,
          pageColumnCounts: payload.pageColumnCounts,
          anchorMap: payload.anchorMap,
          stepBlocks: payload.stepBlocks ?? state.stepBlocks,
          insertionIndex: (payload.stepBlocks ?? state.stepBlocks).length,
          strokeRedoByPage: {},
        };
      }),
    captureLayoutSnapshot: () =>
      set((state) => ({
        layoutSnapshot: {
          version: 2,
          pages: state.pages,
          pageOrder: state.pageOrder,
          currentPageId: state.currentPageId,
          currentStep: state.currentStep,
          pageColumnCounts: state.pageColumnCounts,
          stepBlocks: state.stepBlocks,
          anchorMap: state.anchorMap ?? undefined,
          audioByStep: state.audioByStep,
          animationModInput: state.animationModInput,
        },
      })),
    restoreLayoutSnapshot: () =>
      set((state) => {
        const snapshot = state.layoutSnapshot;
        if (!snapshot) return {};
        return {
          pages: snapshot.pages,
          pageOrder: snapshot.pageOrder,
          currentPageId: snapshot.currentPageId,
          currentStep: snapshot.currentStep,
          pageColumnCounts: snapshot.pageColumnCounts,
          stepBlocks: snapshot.stepBlocks ?? [],
          anchorMap: snapshot.anchorMap ?? null,
          audioByStep: snapshot.audioByStep ?? state.audioByStep,
          animationModInput: snapshot.animationModInput ?? null,
          layoutSnapshot: null,
          strokeRedoByPage: {},
        };
      }),
    nextStep: () =>
      set((state) => {
        const maxStep = getGlobalMaxStep(state.pages, state.stepBlocks);
        if (state.currentStep > maxStep) return {};
        const next = state.currentStep + 1;
        const nextPage =
          next <= maxStep
            ? findPageForStep(state.pages, state.anchorMap, next)
            : null;
        return {
          currentStep: next,
          currentPageId: nextPage ?? state.currentPageId,
        };
      }),
    prevStep: () =>
      set((state) => {
        if (state.currentStep <= 0) return {};
        const next = state.currentStep - 1;
        const nextPage = findPageForStep(state.pages, state.anchorMap, next);
        return {
          currentStep: next,
          currentPageId: nextPage ?? state.currentPageId,
        };
      }),
    goToStep: (step) =>
      set((state) => {
        const maxStep = getGlobalMaxStep(state.pages, state.stepBlocks);
        const next = Math.max(0, Math.min(step, maxStep + 1));
        const nextPage =
          next <= maxStep
            ? findPageForStep(state.pages, state.anchorMap, next)
            : null;
        return {
          currentStep: next,
          currentPageId: nextPage ?? state.currentPageId,
        };
      }),
    nextPage: () =>
      set((state) => {
        const index = state.pageOrder.indexOf(state.currentPageId);
        const nextId = state.pageOrder[index + 1];
        if (nextId) {
          return {
            currentPageId: nextId,
          };
        }
        const newPageId = createPageId();
        const currentColumns =
          state.pageColumnCounts?.[state.currentPageId] ?? 2;
        return {
          pages: {
            ...state.pages,
            [newPageId]: [],
          },
          pageOrder: [...state.pageOrder, newPageId],
          currentPageId: newPageId,
          pageColumnCounts: {
            ...(state.pageColumnCounts ?? {}),
            [newPageId]: currentColumns,
          },
        };
      }),
    prevPage: () =>
      set((state) => {
        const index = state.pageOrder.indexOf(state.currentPageId);
        if (index > 0) {
          const prevId = state.pageOrder[index - 1];
          return {
            currentPageId: prevId,
          };
        }
        return {};
      }),
    resetStep: () =>
      set((state) => ({
        currentStep: 0,
        currentPageId:
          findPageForStep(state.pages, state.anchorMap, 0) ??
          state.currentPageId,
      })),
    hydrate: (data) => {
      const pageOrder =
        data.pageOrder.length > 0 ? data.pageOrder : Object.keys(data.pages);
      const firstPageId =
        pageOrder[0] ?? Object.keys(data.pages)[0] ?? createPageId();
      const stepBlocks = data.stepBlocks ?? [];
      const docVersion = normalizeDocVersion(data.version);
      const hasLegacyBreaks = stepBlocks.some(isBreakBlock);
      const breakAnchorsReady = hasBreakAnchors(
        data.anchorMap ?? null,
        stepBlocks
      );
      const shouldRelayout =
        docVersion < 2.1 && hasLegacyBreaks && !breakAnchorsReady;

      if (shouldRelayout) {
        if (data.audioByStep && Object.keys(data.audioByStep).length > 0) {
          console.warn(
            "[slate] Legacy v2.0 audio detected. Break re-indexing may shift audio alignment."
          );
        }
        queueMicrotask(() => {
          if (typeof document === "undefined") return;
          const ratio = useUIStore.getState().overviewViewportRatio;
          const columnCount = data.pageColumnCounts?.[firstPageId] ?? 2;
          runAutoLayout(stepBlocks, {
            ratio,
            columnCount,
            basePageId: firstPageId,
          })
            .then((result) => {
              get().applyAutoLayout({ ...result, stepBlocks });
              set(() => ({
                version: 2.1 as PersistedCanvasV2["version"],
              }));
            })
            .catch((error) => {
              console.error("[slate] Legacy auto-layout migration failed", error);
            });
        });
      }

      set(() => ({
        version: (docVersion >= 2.1 ? 2.1 : 2) as PersistedCanvasV2["version"],
        pages: data.pages,
        pageOrder,
        currentPageId: firstPageId,
        currentStep: 0,
        pageColumnCounts: data.pageColumnCounts ?? {},
        currentStroke: null,
        selectedItemId: null,
        stepBlocks,
        audioByStep: data.audioByStep ?? {},
        animationModInput: data.animationModInput ?? null,
        insertionIndex: stepBlocks.length,
        anchorMap: data.anchorMap ?? null,
        layoutSnapshot: null,
        strokeRedoByPage: {},
      }));
    },
  };
});

const fitMediaToColumn = (segment: StepSegment, columnWidth: number) => {
  const ratio =
    segment.type === "image" || segment.type === "video"
      ? Math.max(segment.width ?? 1, 1) /
        Math.max(segment.height ?? 1, 1)
      : 1;
  const width = Math.max(120, Math.min(columnWidth, columnWidth));
  const height = Math.max(80, width / ratio);
  return { width, height };
};
