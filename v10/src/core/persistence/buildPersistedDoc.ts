import type {
  AnchorMap,
  ModInput,
  PersistedSlateDoc,
  StepAudio,
  StepBlock,
} from "@core/types/canvas";

type BuildPersistedDocInput = {
  version?: PersistedSlateDoc["version"];
  pages: PersistedSlateDoc["pages"];
  pageOrder: PersistedSlateDoc["pageOrder"];
  pageColumnCounts?: PersistedSlateDoc["pageColumnCounts"];
  stepBlocks?: StepBlock[];
  anchorMap?: AnchorMap | null;
  audioByStep?: Record<number, StepAudio>;
  animationModInput?: ModInput | null;
};

type BuildPersistedDocOptions = {
  includeImages?: boolean;
};

const filterImages = (pages: PersistedSlateDoc["pages"]) => {
  let hasImages = false;
  const filtered: PersistedSlateDoc["pages"] = {};
  Object.entries(pages).forEach(([pageId, items]) => {
    const nextItems = items.filter((item) => item.type !== "image");
    if (nextItems.length !== items.length) hasImages = true;
    filtered[pageId] = nextItems;
  });
  return { pages: filtered, hasImages };
};

export const buildPersistedDoc = (
  input: BuildPersistedDocInput,
  options?: BuildPersistedDocOptions
): { doc: PersistedSlateDoc; hasImages: boolean } => {
  const includeImages = options?.includeImages ?? true;
  const resolved =
    includeImages ? { pages: input.pages, hasImages: false } : filterImages(input.pages);

  const doc: PersistedSlateDoc = {
    version: input.version ?? 2,
    pages: resolved.pages,
    pageOrder: input.pageOrder,
    pageColumnCounts: input.pageColumnCounts,
    stepBlocks: input.stepBlocks,
    anchorMap: input.anchorMap,
    audioByStep: input.audioByStep,
    animationModInput: input.animationModInput ?? null,
  };

  return { doc, hasImages: resolved.hasImages };
};
