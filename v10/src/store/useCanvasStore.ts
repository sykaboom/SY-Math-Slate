import { create } from "zustand";

export type Point = {
  x: number;
  y: number;
  p?: number;
  t?: number;
};

export type Stroke = {
  id: string;
  type: "pen" | "eraser";
  penType?: "ink" | "pencil" | "highlighter";
  color?: string;
  width: number;
  alpha?: number;
  pointerType?: string;
  path: Point[];
};

export type PersistedCanvas = {
  version: 1;
  pages: Record<string, Stroke[]>;
  pageOrder: string[];
  currentPageId: string;
};

interface CanvasState extends PersistedCanvas {
  currentStroke: Stroke | null;
  setCurrentStroke: (stroke: Stroke | null) => void;
  addStroke: (stroke: Stroke) => void;
  undo: () => void;
  clear: () => void;
  nextPage: () => void;
  prevPage: () => void;
  hydrate: (data: PersistedCanvas) => void;
}

const createPageId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `page-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const createInitialState = () => {
  const firstPageId = createPageId();
  return {
    pages: { [firstPageId]: [] },
    pageOrder: [firstPageId],
    currentPageId: firstPageId,
  };
};

export const useCanvasStore = create<CanvasState>((set) => {
  const initial = createInitialState();

  return {
    version: 1,
    ...initial,
    currentStroke: null,
    setCurrentStroke: (stroke) => set(() => ({ currentStroke: stroke })),
    addStroke: (stroke) =>
      set((state) => {
        const pageId = state.currentPageId;
        const existing = state.pages[pageId] ?? [];
        return {
          pages: {
            ...state.pages,
            [pageId]: [...existing, stroke],
          },
          currentStroke: null,
        };
      }),
    undo: () =>
      set((state) => {
        const pageId = state.currentPageId;
        const existing = state.pages[pageId] ?? [];
        if (existing.length === 0) return {};
        return {
          pages: {
            ...state.pages,
            [pageId]: existing.slice(0, -1),
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
    nextPage: () =>
      set((state) => {
        const index = state.pageOrder.indexOf(state.currentPageId);
        const nextId = state.pageOrder[index + 1];
        if (nextId) {
          return { currentPageId: nextId };
        }
        const newPageId = createPageId();
        return {
          pages: {
            ...state.pages,
            [newPageId]: [],
          },
          pageOrder: [...state.pageOrder, newPageId],
          currentPageId: newPageId,
        };
      }),
    prevPage: () =>
      set((state) => {
        const index = state.pageOrder.indexOf(state.currentPageId);
        if (index > 0) {
          return { currentPageId: state.pageOrder[index - 1] };
        }
        return {};
      }),
    hydrate: (data) =>
      set(() => ({
        version: 1,
        pages: data.pages,
        pageOrder: data.pageOrder,
        currentPageId: data.currentPageId,
        currentStroke: null,
      })),
  };
});
