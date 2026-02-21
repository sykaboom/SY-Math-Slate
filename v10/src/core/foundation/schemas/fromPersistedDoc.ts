import type {
  CanvasItem,
  PersistedSlateDoc,
  StepBlock,
  StepBlockKind,
  StepSegment,
} from "@core/foundation/types/canvas";

import type {
  NormalizedBlock,
  NormalizedBreakKind,
  NormalizedContent,
  NormalizedContentAudioCue,
  NormalizedContentMetadata,
  NormalizedContentStyle,
  NormalizedMediaType,
} from "./normalizedContent";
import {
  type NormalizedContentValidationResult,
  validateNormalizedContent,
} from "./normalizedContent";

export type PersistedDocMapOptions = {
  locale?: string;
  metadata?: Partial<Omit<NormalizedContentMetadata, "locale">>;
  style?: NormalizedContentStyle;
  audio?: NormalizedContentAudioCue[];
  renderHints?: Record<string, unknown>;
  includeBreakBlocks?: boolean;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const stripHtml = (value: string) =>
  value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const extractPureMathLatex = (value: string): string | null => {
  const plain = stripHtml(value);
  if (!plain) return null;
  const display = plain.match(/^\$\$([\s\S]+)\$\$$/);
  if (display) return display[1].trim() || null;
  const inline = plain.match(/^\$([^$]+)\$$/);
  if (inline) return inline[1].trim() || null;
  return null;
};

const toMediaRef = (src: string) =>
  src.startsWith("asset://") ? src : `asset://external/${encodeURIComponent(src)}`;

const toBreakKind = (kind?: StepBlockKind): NormalizedBreakKind | undefined => {
  if (kind === "line-break") return "line-break";
  if (kind === "column-break") return "column-break";
  if (kind === "page-break") return "page-break";
  return undefined;
};

const toSegmentBlocks = (blockId: string, segments: StepSegment[]): NormalizedBlock[] => {
  const normalized: NormalizedBlock[] = [];
  const ordered = [...segments].sort((a, b) => a.orderIndex - b.orderIndex);

  ordered.forEach((segment, index) => {
    const segmentBlockId = `${blockId}:${segment.id || index}`;
    if (segment.type === "text") {
      const latex = extractPureMathLatex(segment.html);
      if (latex) {
        normalized.push({
          id: segmentBlockId,
          kind: "math",
          latex,
        });
        return;
      }
      normalized.push({
        id: segmentBlockId,
        kind: "text",
        text: segment.html,
      });
      return;
    }
    if (segment.type === "image" || segment.type === "video") {
      const mediaType: NormalizedMediaType =
        segment.type === "video" ? "video" : "image";
      normalized.push({
        id: segmentBlockId,
        kind: "media",
        mediaRef: toMediaRef(segment.src),
        mediaType,
      });
    }
  });

  return normalized;
};

const toBlocksFromStepBlocks = (
  stepBlocks: StepBlock[],
  includeBreakBlocks: boolean
): NormalizedBlock[] => {
  const normalized: NormalizedBlock[] = [];
  stepBlocks.forEach((block, index) => {
    const safeBlockId = block.id || `block-${index}`;
    if (block.kind && block.kind !== "content") {
      if (!includeBreakBlocks) return;
      normalized.push({
        id: `${safeBlockId}:break`,
        kind: "break",
        breakKind: toBreakKind(block.kind),
      });
      return;
    }
    normalized.push(...toSegmentBlocks(safeBlockId, block.segments));
  });
  return normalized;
};

const pushFallbackTextOrMath = (
  target: NormalizedBlock[],
  blockId: string,
  content: string
) => {
  const latex = extractPureMathLatex(content);
  if (latex) {
    target.push({ id: blockId, kind: "math", latex });
    return;
  }
  target.push({ id: blockId, kind: "text", text: content });
};

const toBlocksFromPagesFallback = (doc: PersistedSlateDoc): NormalizedBlock[] => {
  const normalized: NormalizedBlock[] = [];
  doc.pageOrder.forEach((pageId, pageIndex) => {
    const items = doc.pages[pageId] ?? [];
    items.forEach((item: CanvasItem, itemIndex) => {
      const baseId = `p${pageIndex}:${item.id || itemIndex}`;
      if (item.type === "text") {
        pushFallbackTextOrMath(normalized, `${baseId}:text`, item.content);
        return;
      }
      if (item.type === "math") {
        normalized.push({
          id: `${baseId}:math`,
          kind: "math",
          latex: item.latex,
        });
        return;
      }
      if (item.type === "image") {
        normalized.push({
          id: `${baseId}:media`,
          kind: "media",
          mediaRef: toMediaRef(item.src),
          mediaType: item.mediaType === "video" ? "video" : "image",
        });
      }
    });
  });
  return normalized;
};

export const isPersistedSlateDocLike = (value: unknown): value is PersistedSlateDoc => {
  if (!isRecord(value)) return false;
  if (!isRecord(value.pages)) return false;
  if (!Array.isArray(value.pageOrder)) return false;
  return value.pageOrder.every((pageId) => typeof pageId === "string");
};

export const mapPersistedDocToNormalizedContent = (
  doc: PersistedSlateDoc,
  options?: PersistedDocMapOptions
): NormalizedContentValidationResult => {
  const locale = options?.locale ?? "ko-KR";
  const includeBreakBlocks = options?.includeBreakBlocks ?? true;
  const stepBlocks = Array.isArray(doc.stepBlocks) ? doc.stepBlocks : [];

  const blocks =
    stepBlocks.length > 0
      ? toBlocksFromStepBlocks(stepBlocks, includeBreakBlocks)
      : toBlocksFromPagesFallback(doc);

  const metadata: NormalizedContentMetadata = {
    locale,
    ...options?.metadata,
  };

  const payload: NormalizedContent = {
    type: "NormalizedContent",
    version: "0.3.0-draft",
    metadata,
    blocks,
    ...(options?.style ? { style: options.style } : {}),
    ...(options?.audio ? { audio: options.audio } : {}),
    ...(options?.renderHints ? { renderHints: options.renderHints } : {}),
  };

  return validateNormalizedContent(payload);
};
