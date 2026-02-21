import type { StepSegment, TextSegmentStyle } from "@core/foundation/types/canvas";
import { normalizeTextSegmentStyle } from "@core/ui/theming/engine/typography";

import {
  createMediaSegment,
  createTextSegment,
  normalizeSegments,
  sanitizeDraftHtml,
} from "./blockDraft";
import type { StepBlockDraft } from "./types";

const FONT_SIZE_PATTERN_PX = /^(\d+(?:\.\d+)?)px$/i;

const parseFontSizePx = (
  value: string | undefined,
  fallback: number
): number => {
  if (!value) return fallback;
  const match = value.trim().match(FONT_SIZE_PATTERN_PX);
  if (!match) return fallback;
  const parsed = Number(match[1]);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.round(parsed);
};

const clampFontSizePx = (value: number, minPx: number, maxPx: number) =>
  Math.max(minPx, Math.min(maxPx, value));

const updateBlockSegments = (
  blocks: StepBlockDraft[],
  blockId: string,
  updater: (segments: StepSegment[]) => StepSegment[]
): StepBlockDraft[] => {
  let changed = false;
  const nextBlocks = blocks.map((block) => {
    if (block.id !== blockId) return block;
    changed = true;
    return {
      ...block,
      segments: normalizeSegments(updater(block.segments)),
    };
  });
  return changed ? nextBlocks : blocks;
};

const normalizeSegmentHtml = (html: string) => {
  const sanitized = sanitizeDraftHtml(html);
  return sanitized.trim() === "" ? "&nbsp;" : sanitized;
};

export type InlineEditCommand =
  | {
      type: "segment/set-html";
      segmentId: string;
      html: string;
    }
  | {
      type: "block/update-text-style";
      blockId: string;
      segmentId: string;
      partialStyle: Partial<TextSegmentStyle>;
    }
  | {
      type: "block/adjust-text-font-size";
      blockId: string;
      segmentId: string;
      deltaPx: number;
      minPx: number;
      maxPx: number;
      fallbackPx: number;
    }
  | {
      type: "block/add-text-segment";
      blockId: string;
      html?: string;
    }
  | {
      type: "block/add-media-segment";
      blockId: string;
      mediaType: "image" | "video";
      src: string;
      width: number;
      height: number;
    }
  | {
      type: "block/remove-segment";
      blockId: string;
      segmentId: string;
      fallbackTextHtml?: string;
    }
  | {
      type: "block/move-segment";
      blockId: string;
      fromId: string;
      toId: string;
    };

const reduceSetSegmentHtml = (
  blocks: StepBlockDraft[],
  command: Extract<InlineEditCommand, { type: "segment/set-html" }>
): StepBlockDraft[] => {
  let changed = false;
  const normalizedHtml = normalizeSegmentHtml(command.html);
  const nextBlocks = blocks.map((block) => {
    let blockChanged = false;
    const nextSegments = block.segments.map((segment) => {
      if (segment.id !== command.segmentId || segment.type !== "text") {
        return segment;
      }
      blockChanged = true;
      changed = true;
      return {
        ...segment,
        html: normalizedHtml,
      };
    });

    if (!blockChanged) return block;
    return {
      ...block,
      segments: nextSegments,
    };
  });

  return changed ? nextBlocks : blocks;
};

const reduceUpdateTextStyle = (
  blocks: StepBlockDraft[],
  command: Extract<InlineEditCommand, { type: "block/update-text-style" }>
): StepBlockDraft[] => {
  return updateBlockSegments(blocks, command.blockId, (segments) =>
    segments.map((segment) => {
      if (segment.id !== command.segmentId || segment.type !== "text") {
        return segment;
      }
      return {
        ...segment,
        style: normalizeTextSegmentStyle({
          ...segment.style,
          ...command.partialStyle,
        }),
      };
    })
  );
};

const reduceAdjustTextFontSize = (
  blocks: StepBlockDraft[],
  command: Extract<InlineEditCommand, { type: "block/adjust-text-font-size" }>
): StepBlockDraft[] => {
  return updateBlockSegments(blocks, command.blockId, (segments) =>
    segments.map((segment) => {
      if (segment.id !== command.segmentId || segment.type !== "text") {
        return segment;
      }
      const normalizedStyle = normalizeTextSegmentStyle(segment.style);
      const currentPx = parseFontSizePx(
        normalizedStyle.fontSize,
        command.fallbackPx
      );
      const nextPx = clampFontSizePx(
        currentPx + command.deltaPx,
        command.minPx,
        command.maxPx
      );
      if (nextPx === currentPx) return segment;

      return {
        ...segment,
        style: normalizeTextSegmentStyle({
          ...normalizedStyle,
          fontSize: `${nextPx}px`,
        }),
      };
    })
  );
};

const reduceAddTextSegment = (
  blocks: StepBlockDraft[],
  command: Extract<InlineEditCommand, { type: "block/add-text-segment" }>
): StepBlockDraft[] => {
  return updateBlockSegments(blocks, command.blockId, (segments) => [
    ...segments,
    createTextSegment(command.html ?? "&nbsp;", segments.length),
  ]);
};

const reduceAddMediaSegment = (
  blocks: StepBlockDraft[],
  command: Extract<InlineEditCommand, { type: "block/add-media-segment" }>
): StepBlockDraft[] => {
  return updateBlockSegments(blocks, command.blockId, (segments) => [
    ...segments,
    createMediaSegment(
      command.mediaType,
      command.src,
      command.width,
      command.height,
      segments.length
    ),
  ]);
};

const reduceRemoveSegment = (
  blocks: StepBlockDraft[],
  command: Extract<InlineEditCommand, { type: "block/remove-segment" }>
): StepBlockDraft[] => {
  return updateBlockSegments(blocks, command.blockId, (segments) => {
    const next = segments.filter((segment) => segment.id !== command.segmentId);
    const hasText = next.some((segment) => segment.type === "text");
    if (hasText) return next;

    return [createTextSegment(command.fallbackTextHtml ?? "&nbsp;", 0), ...next];
  });
};

const reduceMoveSegment = (
  blocks: StepBlockDraft[],
  command: Extract<InlineEditCommand, { type: "block/move-segment" }>
): StepBlockDraft[] => {
  if (command.fromId === command.toId) return blocks;

  return updateBlockSegments(blocks, command.blockId, (segments) => {
    const fromIndex = segments.findIndex((segment) => segment.id === command.fromId);
    const toIndex = segments.findIndex((segment) => segment.id === command.toId);
    if (fromIndex === -1 || toIndex === -1) return segments;

    const next = [...segments];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    return next;
  });
};

export const reduceInlineEditCommand = (
  blocks: StepBlockDraft[],
  command: InlineEditCommand
): StepBlockDraft[] => {
  switch (command.type) {
    case "segment/set-html":
      return reduceSetSegmentHtml(blocks, command);
    case "block/update-text-style":
      return reduceUpdateTextStyle(blocks, command);
    case "block/adjust-text-font-size":
      return reduceAdjustTextFontSize(blocks, command);
    case "block/add-text-segment":
      return reduceAddTextSegment(blocks, command);
    case "block/add-media-segment":
      return reduceAddMediaSegment(blocks, command);
    case "block/remove-segment":
      return reduceRemoveSegment(blocks, command);
    case "block/move-segment":
      return reduceMoveSegment(blocks, command);
    default:
      return blocks;
  }
};

export const reduceInlineEditCommands = (
  blocks: StepBlockDraft[],
  commands: InlineEditCommand[]
): StepBlockDraft[] => {
  return commands.reduce(reduceInlineEditCommand, blocks);
};
