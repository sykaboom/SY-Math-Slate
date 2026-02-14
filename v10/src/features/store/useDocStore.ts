import { create } from "zustand";

import type {
  AnchorMap,
  ModInput,
  PersistedSlateDoc,
  StepAudio,
  StepBlock,
} from "@core/types/canvas";

type DocVersion = PersistedSlateDoc["version"];

export type SyncFromCanvasSource = {
  pages: PersistedSlateDoc["pages"];
  pageOrder: PersistedSlateDoc["pageOrder"];
  pageColumnCounts?: PersistedSlateDoc["pageColumnCounts"];
  stepBlocks?: PersistedSlateDoc["stepBlocks"];
  anchorMap?: PersistedSlateDoc["anchorMap"];
  audioByStep?: PersistedSlateDoc["audioByStep"];
  animationModInput?: PersistedSlateDoc["animationModInput"];
  version?: unknown;
};

type DocStoreData = {
  version: DocVersion;
  pages: PersistedSlateDoc["pages"];
  pageOrder: PersistedSlateDoc["pageOrder"];
  pageColumnCounts: Record<string, number>;
  stepBlocks: StepBlock[];
  anchorMap: AnchorMap | null;
  audioByStep: Record<number, StepAudio>;
  animationModInput: ModInput | null;
};

type DocLike = {
  version?: unknown;
  pages: PersistedSlateDoc["pages"];
  pageOrder: PersistedSlateDoc["pageOrder"];
  pageColumnCounts?: PersistedSlateDoc["pageColumnCounts"];
  stepBlocks?: PersistedSlateDoc["stepBlocks"];
  anchorMap?: PersistedSlateDoc["anchorMap"];
  audioByStep?: PersistedSlateDoc["audioByStep"];
  animationModInput?: PersistedSlateDoc["animationModInput"];
};

interface DocStoreState extends DocStoreData {
  hydrateDoc: (doc: PersistedSlateDoc) => void;
  setFromPersistedDoc: (doc: PersistedSlateDoc) => void;
  syncFromCanvas: (source: SyncFromCanvasSource) => void;
  setStepBlocks: (stepBlocks: StepBlock[]) => void;
  getDocSnapshot: () => PersistedSlateDoc;
}

const normalizeVersion = (
  value: unknown,
  fallback: DocVersion = 2
): DocVersion => {
  if (value === 2.1 || value === "2.1") return 2.1;
  if (value === 2 || value === "2") return 2;

  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.abs(value - 2.1) < 0.000001 ? 2.1 : 2;
  }
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) {
      return Math.abs(parsed - 2.1) < 0.000001 ? 2.1 : 2;
    }
  }
  return fallback;
};

const clonePages = (
  pages: PersistedSlateDoc["pages"]
): PersistedSlateDoc["pages"] => {
  const next: PersistedSlateDoc["pages"] = {};
  Object.entries(pages).forEach(([pageId, items]) => {
    next[pageId] = items.map((item) => ({ ...item }));
  });
  return next;
};

const cloneStepBlocks = (stepBlocks: StepBlock[] | undefined): StepBlock[] =>
  (stepBlocks ?? []).map((block) => ({
    ...block,
    segments: block.segments.map((segment) => ({ ...segment })),
  }));

const cloneAnchorMap = (
  anchorMap: AnchorMap | null | undefined
): AnchorMap | null => {
  if (!anchorMap) return null;

  const next: AnchorMap = {};
  Object.entries(anchorMap).forEach(([pageId, pageAnchors]) => {
    const nextAnchors: Record<number, AnchorMap[string][number]> = {};
    Object.entries(pageAnchors).forEach(([stepKey, anchors]) => {
      nextAnchors[Number(stepKey)] = anchors.map((anchor) => ({ ...anchor }));
    });
    next[pageId] = nextAnchors;
  });

  return next;
};

const cloneAudioByStep = (
  audioByStep: Record<number, StepAudio> | undefined
): Record<number, StepAudio> => {
  const next: Record<number, StepAudio> = {};
  if (!audioByStep) return next;

  Object.entries(audioByStep).forEach(([stepKey, audio]) => {
    next[Number(stepKey)] = { ...audio };
  });
  return next;
};

const cloneAnimationModInput = (
  modInput: ModInput | null | undefined
): ModInput | null => {
  if (!modInput) return null;
  return { ...modInput };
};

const toDocStoreData = (
  source: DocLike,
  fallbackVersion: DocVersion
): DocStoreData => ({
  version: normalizeVersion(source.version, fallbackVersion),
  pages: clonePages(source.pages),
  pageOrder: [...source.pageOrder],
  pageColumnCounts: { ...(source.pageColumnCounts ?? {}) },
  stepBlocks: cloneStepBlocks(source.stepBlocks),
  anchorMap: cloneAnchorMap(source.anchorMap),
  audioByStep: cloneAudioByStep(source.audioByStep),
  animationModInput: cloneAnimationModInput(source.animationModInput),
});

const initialData: DocStoreData = {
  version: 2,
  pages: {},
  pageOrder: [],
  pageColumnCounts: {},
  stepBlocks: [],
  anchorMap: null,
  audioByStep: {},
  animationModInput: null,
};

const toHydratedDocState = (doc: PersistedSlateDoc): DocStoreData =>
  toDocStoreData(doc, 2);

export const useDocStore = create<DocStoreState>((set, get) => ({
  ...initialData,
  hydrateDoc: (doc) =>
    set(() => {
      return toHydratedDocState(doc);
    }),
  setFromPersistedDoc: (doc) =>
    set(() => {
      return toHydratedDocState(doc);
    }),
  syncFromCanvas: (source) =>
    set((state) => {
      return toDocStoreData(source, state.version);
    }),
  setStepBlocks: (stepBlocks) =>
    set(() => ({
      stepBlocks: cloneStepBlocks(stepBlocks),
    })),
  getDocSnapshot: () => {
    const state = get();
    return {
      version: normalizeVersion(state.version, 2),
      pages: clonePages(state.pages),
      pageOrder: [...state.pageOrder],
      pageColumnCounts: { ...state.pageColumnCounts },
      stepBlocks: cloneStepBlocks(state.stepBlocks),
      anchorMap: cloneAnchorMap(state.anchorMap),
      audioByStep: cloneAudioByStep(state.audioByStep),
      animationModInput: cloneAnimationModInput(state.animationModInput),
    };
  },
}));
