import type { ImageItem, StepSegment, TextItem } from "@core/types/canvas";
import {
  createDefaultTextSegmentStyle,
  normalizeTextSegmentStyle,
} from "@core/config/typography";
import { sanitizeRichTextHtml } from "@core/sanitize/richTextSanitizer";

import type { StepBlockDraft } from "./types";

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
    segments: [
      createTextSegment(line.trim() === "" ? "&nbsp;" : escapeHtml(line), 0),
    ],
  }));
};
