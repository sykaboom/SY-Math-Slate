import type { StepBlock } from "@core/types/canvas";

export type EditorSurfaceBreakKind = "line-break" | "column-break" | "page-break";

export type EditorSurfaceInsertionMarker = {
  index: number;
  isActive: boolean;
  beforeBlockId: string | null;
  afterBlockId: string | null;
};

export type EditorSurfaceBlockEntry = {
  blockId: string;
  blockIndex: number;
  isBreakBlock: boolean;
  breakKind: EditorSurfaceBreakKind | null;
  breakLabel: string | null;
  preview: string;
};

export type EditorSurfaceModel = {
  safeInsertionIndex: number;
  insertionMarkers: EditorSurfaceInsertionMarker[];
  blockEntries: EditorSurfaceBlockEntry[];
};

export type EditorSurfacePreviewLabels = {
  imageToken: string;
  videoToken: string;
  empty: string;
};

export type EditorSurfaceBreakLabels = {
  lineBreak: string;
  columnBreak: string;
  pageBreak: string;
  fallback: string;
};

export type EditorSurfaceModelOptions = {
  previewLimit?: number;
  previewLabels?: Partial<EditorSurfacePreviewLabels>;
  breakLabels?: Partial<EditorSurfaceBreakLabels>;
};

const DEFAULT_PREVIEW_LIMIT = 96;

const DEFAULT_PREVIEW_LABELS: EditorSurfacePreviewLabels = {
  imageToken: "[image]",
  videoToken: "[video]",
  empty: "No content",
};

const DEFAULT_BREAK_LABELS: EditorSurfaceBreakLabels = {
  lineBreak: "Line Break",
  columnBreak: "Column Break",
  pageBreak: "Page Break",
  fallback: "Divider",
};

const clampInsertionIndex = (index: number, blockCount: number) =>
  Math.max(0, Math.min(index, blockCount));

const normalizePreviewText = (value: string) =>
  value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();

const resolveBreakKind = (block: StepBlock): EditorSurfaceBreakKind | null => {
  if (!block.kind || block.kind === "content") return null;
  if (
    block.kind === "line-break" ||
    block.kind === "column-break" ||
    block.kind === "page-break"
  ) {
    return block.kind;
  }
  return null;
};

const resolveBreakLabel = (
  kind: EditorSurfaceBreakKind | null,
  labels: EditorSurfaceBreakLabels
) => {
  if (!kind) return null;
  if (kind === "line-break") return labels.lineBreak;
  if (kind === "column-break") return labels.columnBreak;
  if (kind === "page-break") return labels.pageBreak;
  return labels.fallback;
};

const getBlockPreview = (
  block: StepBlock,
  previewLabels: EditorSurfacePreviewLabels,
  previewLimit: number
) => {
  const breakKind = resolveBreakKind(block);
  if (breakKind) return "";

  const parts = block.segments
    .map((segment) => {
      if (segment.type === "text") {
        return normalizePreviewText(segment.html);
      }
      if (segment.type === "image") {
        return previewLabels.imageToken;
      }
      return previewLabels.videoToken;
    })
    .filter((part) => part.length > 0);

  if (parts.length === 0) return previewLabels.empty;
  return parts.join(" ").slice(0, previewLimit);
};

export const buildEditorSurfaceModel = (
  blocks: StepBlock[],
  insertionIndex: number,
  options?: EditorSurfaceModelOptions
): EditorSurfaceModel => {
  const safeInsertionIndex = clampInsertionIndex(insertionIndex, blocks.length);
  const previewLimit = options?.previewLimit ?? DEFAULT_PREVIEW_LIMIT;
  const previewLabels: EditorSurfacePreviewLabels = {
    ...DEFAULT_PREVIEW_LABELS,
    ...options?.previewLabels,
  };
  const breakLabels: EditorSurfaceBreakLabels = {
    ...DEFAULT_BREAK_LABELS,
    ...options?.breakLabels,
  };

  const insertionMarkers = Array.from(
    { length: blocks.length + 1 },
    (_, index): EditorSurfaceInsertionMarker => ({
      index,
      isActive: index === safeInsertionIndex,
      beforeBlockId: blocks[index - 1]?.id ?? null,
      afterBlockId: blocks[index]?.id ?? null,
    })
  );

  const blockEntries = blocks.map((block, blockIndex): EditorSurfaceBlockEntry => {
    const breakKind = resolveBreakKind(block);
    return {
      blockId: block.id,
      blockIndex,
      isBreakBlock: Boolean(breakKind),
      breakKind,
      breakLabel: resolveBreakLabel(breakKind, breakLabels),
      preview: getBlockPreview(block, previewLabels, previewLimit),
    };
  });

  return {
    safeInsertionIndex,
    insertionMarkers,
    blockEntries,
  };
};
