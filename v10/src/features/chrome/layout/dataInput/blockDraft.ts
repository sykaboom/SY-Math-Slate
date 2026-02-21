import type { ImageItem, StepSegment, TextItem } from "@core/foundation/types/canvas";
import {
  createDefaultTextSegmentStyle,
  normalizeTextSegmentStyle,
} from "@core/ui/theming/engine/typography";
import { sanitizeRichTextHtml } from "@core/security/sanitization/richTextSanitizer";

import type { RawSyncResult, StepBlockDraft } from "./types";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const toPlainText = (html: string) => {
  const div = document.createElement("div");
  div.innerHTML = html;
  return (div.textContent ?? "").replace(/\u00a0/g, "");
};

const normalizeForMatch = (value: string) =>
  value.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();

const toRawLineHtml = (line: string) =>
  line.trim() === "" ? "&nbsp;" : escapeHtml(line);

const STABLE_ID_TOKEN = /^\s*\[#([A-Za-z0-9._:-]+)\]\s*(.*)$/;

const parseStableIdToken = (line: string) => {
  const match = line.match(STABLE_ID_TOKEN);
  if (!match) {
    return {
      stableId: null as string | null,
      displayLine: line,
    };
  }
  return {
    stableId: match[1],
    displayLine: match[2] ?? "",
  };
};

const getBlockNormalizedText = (block: StepBlockDraft) => {
  if (block.kind && block.kind !== "content") return "";
  return normalizeForMatch(
    block.segments
      .filter((segment) => segment.type === "text")
      .map((segment) => toPlainText(segment.html))
      .join(" ")
  );
};

const rewriteBlockTextFromRaw = (
  block: StepBlockDraft,
  lineHtml: string,
  normalizedLine: string
): StepBlockDraft => {
  if (block.kind && block.kind !== "content") return block;
  const currentNormalized = getBlockNormalizedText(block);
  if (currentNormalized === normalizedLine) return block;

  const firstTextIndex = block.segments.findIndex(
    (segment) => segment.type === "text"
  );
  if (firstTextIndex < 0) {
    return {
      ...block,
      segments: normalizeSegments([
        createTextSegment(sanitizeDraftHtml(lineHtml), 0),
        ...block.segments,
      ]),
    };
  }

  const preserved = block.segments.filter(
    (segment, index) => segment.type !== "text" || index === firstTextIndex
  );
  const nextSegments = preserved.map((segment, index) => {
    if (segment.type !== "text") {
      return {
        ...segment,
        orderIndex: index,
      };
    }
    return {
      ...segment,
      html: sanitizeDraftHtml(lineHtml),
      style: normalizeTextSegmentStyle(segment.style),
      orderIndex: index,
    };
  });

  return {
    ...block,
    segments: normalizeSegments(nextSegments),
  };
};

export const createBlockId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `block-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const createSegmentId = () => createBlockId();

export const sanitizeDraftHtml = (value: string) =>
  sanitizeRichTextHtml(value, { ensureNotEmpty: true });

export const createTextSegment = (
  value: string,
  orderIndex = 0
): StepSegment => ({
  id: createSegmentId(),
  type: "text",
  html: value,
  style: createDefaultTextSegmentStyle(),
  orderIndex,
});

export const createMediaSegment = (
  type: "image" | "video",
  src: string,
  width: number,
  height: number,
  orderIndex: number
): StepSegment => ({
  id: createSegmentId(),
  type,
  src,
  width,
  height,
  orderIndex,
});

export const normalizeSegments = (segments: StepSegment[]) =>
  segments.map((segment, index) => ({
    ...segment,
    orderIndex: index,
  }));

const normalizeSegmentDraft = (
  segment: StepSegment,
  index: number
): StepSegment => {
  if (segment.type !== "text") {
    return {
      ...segment,
      orderIndex: index,
    };
  }
  return {
    ...segment,
    html: sanitizeDraftHtml(segment.html),
    style: normalizeTextSegmentStyle(segment.style),
    orderIndex: index,
  };
};

export const normalizeBlocksDraft = (
  drafts: StepBlockDraft[]
): StepBlockDraft[] => {
  return drafts.map((block) => {
    if (block.kind && block.kind !== "content") {
      return {
        ...block,
        segments: [],
      };
    }
    const normalizedSegments = block.segments.map((segment, index) =>
      normalizeSegmentDraft(segment, index)
    );
    return {
      ...block,
      segments: normalizedSegments,
    };
  });
};

export const buildBlocksFromFlowItems = (
  items: Array<TextItem | ImageItem>
): StepBlockDraft[] => {
  const grouped = new Map<number, StepSegment[]>();
  items.forEach((item, index) => {
    const stepIndex =
      item.type === "text"
        ? item.stepIndex
        : typeof item.stepIndex === "number"
          ? item.stepIndex
          : 0;
    const current = grouped.get(stepIndex) ?? [];
    if (item.type === "text") {
      current.push({
        id: item.segmentId ?? createSegmentId(),
        type: "text",
        html: item.content || "&nbsp;",
        style: normalizeTextSegmentStyle(item.style),
        orderIndex: index,
      });
    } else if (item.type === "image") {
      current.push({
        id: item.segmentId ?? createSegmentId(),
        type: item.mediaType === "video" ? "video" : "image",
        src: item.src,
        width: item.w,
        height: item.h,
        orderIndex: index,
      });
    }
    grouped.set(stepIndex, current);
  });

  const sortedSteps = Array.from(grouped.entries())
    .sort(([a], [b]) => a - b)
    .map(([, segments]) => ({
      id: createBlockId(),
      segments: normalizeSegments(
        segments.sort((a, b) => a.orderIndex - b.orderIndex)
      ),
    }));

  return sortedSteps;
};

export const blocksToRawText = (drafts: StepBlockDraft[]) =>
  drafts
    .filter((block) => !block.kind || block.kind === "content")
    .map((block) => {
      const textSegments = block.segments.filter(
        (segment) => segment.type === "text"
      );
      if (textSegments.length === 0) return "";
      return textSegments
        .map((segment) => toPlainText(segment.html))
        .join(" ");
    })
    .join("\n");

export const createBlocksFromRawText = (value: string): StepBlockDraft[] => {
  const lines = value.split(/\r?\n/);
  return lines.map((line) => ({
    id: createBlockId(),
    segments: [createTextSegment(toRawLineHtml(line), 0)],
  }));
};

export const syncBlocksFromRawText = (
  rawValue: string,
  previousBlocks: StepBlockDraft[]
): RawSyncResult => {
  const lines = rawValue.split(/\r?\n/);
  const parsedLines = lines.map((line, lineIndex) => {
    const { stableId, displayLine } = parseStableIdToken(line);
    return {
      lineIndex,
      stableId,
      html: toRawLineHtml(displayLine),
      normalized: normalizeForMatch(displayLine),
    };
  });

  const existingContentBlocks = previousBlocks
    .filter((block) => !block.kind || block.kind === "content")
    .map((block, contentIndex) => ({
      block,
      contentIndex,
      normalized: getBlockNormalizedText(block),
    }));
  const preservedNonContentBlocks = previousBlocks.filter(
    (block) => Boolean(block.kind) && block.kind !== "content"
  );

  const usedContentIndices = new Set<number>();
  const decisions: RawSyncResult["decisions"] = [];
  const nextBlocks: StepBlockDraft[] = [];

  const findNearestUnused = (targetIndex: number, maxDistance = 2) => {
    for (let distance = 0; distance <= maxDistance; distance += 1) {
      const candidates = existingContentBlocks.filter((entry) => {
        if (usedContentIndices.has(entry.contentIndex)) return false;
        return Math.abs(entry.contentIndex - targetIndex) === distance;
      });
      if (candidates.length > 0) {
        return candidates[0];
      }
    }
    return null;
  };

  parsedLines.forEach((line) => {
    let matched = null as (typeof existingContentBlocks)[number] | null;
    let reason: RawSyncResult["decisions"][number]["reason"] = "new";

    if (line.stableId) {
      const stableMatched = existingContentBlocks.find(
        (entry) =>
          entry.block.id === line.stableId &&
          !usedContentIndices.has(entry.contentIndex)
      );
      if (stableMatched) {
        matched = stableMatched;
        reason = "stable-id";
      }
    }

    if (!matched) {
      const textMatched = existingContentBlocks.find(
        (entry) =>
          entry.normalized === line.normalized &&
          !usedContentIndices.has(entry.contentIndex)
      );
      if (textMatched) {
        matched = textMatched;
        reason = "normalized-text";
      }
    }

    if (!matched) {
      const fallbackMatched = findNearestUnused(line.lineIndex, 2);
      if (fallbackMatched) {
        matched = fallbackMatched;
        reason = "positional-fallback";
      }
    }

    if (!matched) {
      const created: StepBlockDraft = {
        id: createBlockId(),
        segments: [createTextSegment(line.html, 0)],
      };
      nextBlocks.push(created);
      decisions.push({
        lineIndex: line.lineIndex,
        reason: "new",
      });
      return;
    }

    usedContentIndices.add(matched.contentIndex);
    nextBlocks.push(
      rewriteBlockTextFromRaw(matched.block, line.html, line.normalized)
    );
    decisions.push({
      lineIndex: line.lineIndex,
      reason,
      matchedBlockId: matched.block.id,
    });
  });

  const unmatchedContentBlocks = existingContentBlocks
    .filter((entry) => !usedContentIndices.has(entry.contentIndex))
    .map((entry) => entry.block);

  const normalizedBlocks = normalizeBlocksDraft(nextBlocks);
  const normalizedUnmatched = normalizeBlocksDraft([
    ...preservedNonContentBlocks,
    ...unmatchedContentBlocks,
  ]);

  return {
    blocks: normalizedBlocks,
    unmatchedBlocks: normalizedUnmatched,
    decisions,
  };
};
