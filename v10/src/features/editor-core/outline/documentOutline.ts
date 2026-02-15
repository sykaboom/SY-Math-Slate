import type { StepBlock, StepBlockKind, StepSegment } from "@core/types/canvas";

export type DocumentOutlineEntry = {
  stepId: string;
  stepIndex: number;
  kind: StepBlockKind;
  label: string;
  preview: string;
};

const PREVIEW_MAX_LENGTH = 80;
const EMPTY_CONTENT_PREVIEW = "Untitled step";

const normalizeKind = (kind: StepBlock["kind"]): StepBlockKind => kind ?? "content";

const decodeHtmlEntities = (value: string): string => {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
};

const toPlainText = (value: string): string => {
  return decodeHtmlEntities(value)
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const clampPreview = (value: string): string => {
  if (value.length <= PREVIEW_MAX_LENGTH) return value;
  return `${value.slice(0, PREVIEW_MAX_LENGTH - 3).trimEnd()}...`;
};

const sortSegments = (segments: StepSegment[]): StepSegment[] => {
  return [...segments].sort((a, b) => a.orderIndex - b.orderIndex);
};

const buildContentPreview = (segments: StepSegment[]): string => {
  const ordered = sortSegments(segments);
  const textPreview = ordered
    .filter((segment) => segment.type === "text")
    .map((segment) => toPlainText(segment.html))
    .filter((text) => text.length > 0)
    .join(" ")
    .trim();

  if (textPreview.length > 0) {
    return clampPreview(textPreview);
  }

  const imageCount = ordered.filter((segment) => segment.type === "image").length;
  const videoCount = ordered.filter((segment) => segment.type === "video").length;

  if (imageCount > 0 && videoCount > 0) {
    return `${imageCount} image${imageCount > 1 ? "s" : ""}, ${videoCount} video${
      videoCount > 1 ? "s" : ""
    }`;
  }
  if (imageCount > 0) {
    return `${imageCount} image${imageCount > 1 ? "s" : ""}`;
  }
  if (videoCount > 0) {
    return `${videoCount} video${videoCount > 1 ? "s" : ""}`;
  }

  return EMPTY_CONTENT_PREVIEW;
};

const toBreakLabel = (kind: StepBlockKind): string => {
  if (kind === "line-break") return "Line break";
  if (kind === "column-break") return "Column break";
  if (kind === "page-break") return "Page break";
  return "Step";
};

export const buildDocumentOutline = (
  stepBlocks: StepBlock[]
): DocumentOutlineEntry[] => {
  return stepBlocks.map((block, stepIndex) => {
    const kind = normalizeKind(block.kind);
    const preview =
      kind === "content" ? buildContentPreview(block.segments) : toBreakLabel(kind);
    const label = `Step ${stepIndex + 1}: ${preview}`;

    return {
      stepId: block.id,
      stepIndex,
      kind,
      label,
      preview,
    };
  });
};
