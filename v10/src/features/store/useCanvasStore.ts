import { create } from "zustand";

import type {
  AnchorMap,
  CanvasItem,
  PersistedCanvasV2,
  PersistedSlateDoc,
  StepAudio,
  StepBlock,
  StepSegment,
  StrokeItem,
} from "@core/types/canvas";

export type StrokeInput = Omit<
  StrokeItem,
  "id" | "type" | "x" | "y" | "zIndex"
> &
  Partial<Pick<StrokeItem, "id" | "x" | "y" | "zIndex">>;

interface CanvasState extends PersistedCanvasV2 {
  currentStroke: StrokeItem | null;
  selectedItemId: string | null;
  stepBlocks: StepBlock[];
  audioByStep: Record<number, StepAudio>;
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
  undo: () => void;
  clear: () => void;
  importStepBlocks: (blocks: StepBlock[]) => void;
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
    insertionIndex: 0,
    anchorMap: null,
    layoutSnapshot: null,
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

const getGlobalMaxStep = (pages: Record<string, CanvasItem[]>) => {
  return Object.values(pages).reduce((max, items) => {
    return Math.max(max, getMaxStepIndex(items));
  }, -1);
};

const findPageForStep = (
  pages: Record<string, CanvasItem[]>,
  stepIndex: number
) => {
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

const CONTENT_PADDING = 48;
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

const isContentBlock = (block: StepBlock) =>
  !block.kind || block.kind === "content";

const findBlockIndexForStep = (blocks: StepBlock[], stepIndex: number) => {
  let contentIndex = 0;
  for (let i = 0; i < blocks.length; i += 1) {
    const block = blocks[i];
    if (!isContentBlock(block)) continue;
    if (contentIndex === stepIndex) return i;
    contentIndex += 1;
  }
  return blocks.length;
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
      return;
    }
    const isBreakBlock = Boolean(block.kind) && block.kind !== "content";
    if (!isBreakBlock) {
      contentPlacements.set(contentIndex, { pageId: currentPageId, stepIndex });
      contentIndex += 1;
    }
    if (isBreakBlock) {
      const zIndex = zIndexByPage.get(currentPageId) ?? 0;
      const breakStepIndex = Math.max(stepIndex - 1, -1);
      const html =
        block.kind === "column-break"
          ? '<div class="force-break"></div>'
          : '<span class="line-break-spacer">&nbsp;</span>';
      pages[currentPageId].push({
        id: createItemId(),
        type: "text",
        content: html,
        layoutMode: "flow",
        stepIndex: breakStepIndex,
        x: 0,
        y: 0,
        zIndex,
        style: { fontSize: "28px", color: "#ffffff" },
      });
      zIndexByPage.set(currentPageId, zIndex + 1);
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
          style: { fontSize: "28px", color: "#ffffff" },
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

export const useCanvasStore = create<CanvasState>((set) => {
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
        return { pages: { ...state.pages, [pageId]: next } };
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
        return { pages: { ...state.pages, [pageId]: next } };
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
        return {
          pages: {
            ...state.pages,
            [pageId]: existing.filter((_, index) => index !== lastStrokeIndex),
          },
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
        };
      }),
    importStepBlocks: (blocks) =>
      set((state) => {
        const built = buildPagesFromBlocks(blocks, state);
        const firstStepPage =
          findPageForStep(built.pages, 0) ?? built.pageOrder[0];
        return {
          pages: built.pages,
          pageOrder: built.pageOrder,
          currentPageId: firstStepPage ?? state.currentPageId,
          currentStep: 0,
          pageColumnCounts: built.pageColumnCounts,
          stepBlocks: blocks,
          insertionIndex: blocks.length,
          anchorMap: null,
        };
      }),
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
        };
      }),
    applyAutoLayout: (payload) =>
      set((state) => {
        const firstStepPage =
          findPageForStep(payload.pages, 0) ?? payload.pageOrder[0];
        return {
          pages: payload.pages,
          pageOrder: payload.pageOrder,
          currentPageId: firstStepPage ?? state.currentPageId,
          currentStep: 0,
          pageColumnCounts: payload.pageColumnCounts,
          anchorMap: payload.anchorMap,
          stepBlocks: payload.stepBlocks ?? state.stepBlocks,
          insertionIndex: (payload.stepBlocks ?? state.stepBlocks).length,
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
          layoutSnapshot: null,
        };
      }),
    nextStep: () =>
      set((state) => {
        const maxStep = getGlobalMaxStep(state.pages);
        if (state.currentStep > maxStep) return {};
        const next = state.currentStep + 1;
        const nextPage =
          next <= maxStep ? findPageForStep(state.pages, next) : null;
        return {
          currentStep: next,
          currentPageId: nextPage ?? state.currentPageId,
        };
      }),
    prevStep: () =>
      set((state) => {
        if (state.currentStep <= 0) return {};
        const next = state.currentStep - 1;
        const nextPage = findPageForStep(state.pages, next);
        return {
          currentStep: next,
          currentPageId: nextPage ?? state.currentPageId,
        };
      }),
    goToStep: (step) =>
      set((state) => {
        const maxStep = getGlobalMaxStep(state.pages);
        const next = Math.max(0, Math.min(step, maxStep + 1));
        const nextPage =
          next <= maxStep ? findPageForStep(state.pages, next) : null;
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
          findPageForStep(state.pages, 0) ?? state.currentPageId,
      })),
    hydrate: (data) =>
      set(() => {
        const pageOrder = data.pageOrder.length > 0
          ? data.pageOrder
          : Object.keys(data.pages);
        const firstPageId = pageOrder[0] ?? Object.keys(data.pages)[0] ?? createPageId();
        return {
          version: 2,
          pages: data.pages,
          pageOrder,
          currentPageId: firstPageId,
          currentStep: 0,
          pageColumnCounts: data.pageColumnCounts ?? {},
          currentStroke: null,
          selectedItemId: null,
          stepBlocks: data.stepBlocks ?? [],
          audioByStep: data.audioByStep ?? {},
          insertionIndex: (data.stepBlocks ?? []).length,
          anchorMap: data.anchorMap ?? null,
          layoutSnapshot: null,
        };
      }),
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
