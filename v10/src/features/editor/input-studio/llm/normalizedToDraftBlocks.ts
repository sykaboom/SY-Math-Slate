import { normalizeTextSegmentStyle } from "@core/ui/theming/engine/typography";
import type { NormalizedBlock, NormalizedContent } from "@core/foundation/schemas";
import type { StepBlockDraft } from "@features/chrome/layout/dataInput/types";
import {
  createBlockId,
  normalizeBlocksDraft,
  sanitizeDraftHtml,
} from "@features/chrome/layout/dataInput/blockDraft";

const DEFAULT_MEDIA_WIDTH = 1280;
const DEFAULT_MEDIA_HEIGHT = 720;
const FALLBACK_MATH_LATEX = "\\square";
const EXTERNAL_MEDIA_PREFIX = "asset://external/";

type NormalizedToDraftOptions = {
  mediaWidth?: number;
  mediaHeight?: number;
};

type NormalizedBreakKind = Extract<NormalizedBlock, { kind: "break" }>["breakKind"];

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim() !== "";

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const toRichTextHtml = (value: string): string => {
  const html = value
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => (line.length > 0 ? escapeHtml(line) : "&nbsp;"))
    .join("<br/>");
  return sanitizeDraftHtml(html);
};

const toBreakKind = (breakKind: NormalizedBreakKind): StepBlockDraft["kind"] => {
  if (breakKind === "column-break") return "column-break";
  if (breakKind === "page-break") return "page-break";
  return "line-break";
};

const toMediaSrc = (mediaRef: string, fallbackId: string): string => {
  const trimmed = mediaRef.trim();
  if (!trimmed.startsWith(EXTERNAL_MEDIA_PREFIX)) {
    return trimmed;
  }
  const encoded = trimmed.slice(EXTERNAL_MEDIA_PREFIX.length);
  if (!encoded) return `asset://missing/${fallbackId}`;
  try {
    const decoded = decodeURIComponent(encoded).trim();
    return decoded !== "" ? decoded : `asset://missing/${fallbackId}`;
  } catch {
    return `asset://missing/${fallbackId}`;
  }
};

const buildUniqueBlockId = (rawId: unknown, used: Set<string>): string => {
  const base = isNonEmptyString(rawId) ? rawId.trim() : createBlockId();
  if (!used.has(base)) {
    used.add(base);
    return base;
  }
  let suffix = 1;
  while (used.has(`${base}-${suffix}`)) {
    suffix += 1;
  }
  const nextId = `${base}-${suffix}`;
  used.add(nextId);
  return nextId;
};

const mapNormalizedBlock = (
  block: NormalizedBlock,
  style: ReturnType<typeof normalizeTextSegmentStyle>,
  usedBlockIds: Set<string>,
  options: Required<NormalizedToDraftOptions>
): StepBlockDraft => {
  const blockId = buildUniqueBlockId(block.id, usedBlockIds);

  if (block.kind === "break") {
    return {
      id: blockId,
      kind: toBreakKind(block.breakKind),
      segments: [],
    };
  }

  if (block.kind === "media") {
    const src = isNonEmptyString(block.mediaRef)
      ? toMediaSrc(block.mediaRef, blockId)
      : `asset://missing/${blockId}`;
    return {
      id: blockId,
      kind: "content",
      segments: [
        {
          id: `${blockId}:media:0`,
          type: block.mediaType === "video" ? "video" : "image",
          src,
          width: options.mediaWidth,
          height: options.mediaHeight,
          orderIndex: 0,
        },
      ],
    };
  }

  const rawText =
    block.kind === "math"
      ? `$$${isNonEmptyString(block.latex) ? block.latex.trim() : FALLBACK_MATH_LATEX}$$`
      : block.text;

  return {
    id: blockId,
    kind: "content",
    segments: [
      {
        id: `${blockId}:text:0`,
        type: "text",
        html: toRichTextHtml(rawText),
        style,
        orderIndex: 0,
      },
    ],
  };
};

export const normalizedToDraftBlocks = (
  normalized: NormalizedContent,
  options?: NormalizedToDraftOptions
): StepBlockDraft[] => {
  const resolvedOptions: Required<NormalizedToDraftOptions> = {
    mediaWidth:
      options && Number.isFinite(options.mediaWidth) && options.mediaWidth
        ? Math.max(1, Math.floor(options.mediaWidth))
        : DEFAULT_MEDIA_WIDTH,
    mediaHeight:
      options && Number.isFinite(options.mediaHeight) && options.mediaHeight
        ? Math.max(1, Math.floor(options.mediaHeight))
        : DEFAULT_MEDIA_HEIGHT,
  };
  const style = normalizeTextSegmentStyle(normalized.style);
  const usedBlockIds = new Set<string>();
  const mappedBlocks = normalized.blocks.map((block) =>
    mapNormalizedBlock(block, style, usedBlockIds, resolvedOptions)
  );
  return normalizeBlocksDraft(mappedBlocks);
};
