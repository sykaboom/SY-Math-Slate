import type { StepSegment } from "@core/foundation/types/canvas";
import type { StepBlockDraft } from "@features/layout/dataInput/types";

import type {
  DraftDiffBlockStatus,
  DraftDiffEntry,
  DraftDiffResult,
  DraftDiffSummary,
} from "./types";

const normalizeWhitespace = (value: string): string =>
  value.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();

const decodeHtmlEntities = (value: string): string =>
  value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

const toPlainText = (html: string): string => {
  const withNewlines = html.replace(/<br\s*\/?>/gi, "\n");
  const stripped = withNewlines.replace(/<[^>]*>/g, "");
  return normalizeWhitespace(decodeHtmlEntities(stripped));
};

const segmentFingerprint = (segment: StepSegment): string => {
  if (segment.type === "text") {
    const styleToken = JSON.stringify(segment.style ?? {});
    return `text:${toPlainText(segment.html)}:${styleToken}`;
  }
  const width = segment.width ?? "na";
  const height = segment.height ?? "na";
  return `${segment.type}:${segment.src}:${width}x${height}`;
};

const blockKindToken = (block: StepBlockDraft): string => block.kind ?? "content";

const blockFingerprint = (block: StepBlockDraft): string => {
  if (blockKindToken(block) !== "content") {
    return `kind:${blockKindToken(block)}`;
  }
  const segmentToken = block.segments
    .slice()
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((segment) => segmentFingerprint(segment))
    .join("|");
  return `kind:content:${segmentToken}`;
};

const toStatus = (
  currentBlock: StepBlockDraft | undefined,
  candidateBlock: StepBlockDraft | undefined
): DraftDiffBlockStatus => {
  if (currentBlock && candidateBlock) {
    return blockFingerprint(currentBlock) === blockFingerprint(candidateBlock)
      ? "unchanged"
      : "modified";
  }
  if (!currentBlock && candidateBlock) return "added";
  if (currentBlock && !candidateBlock) return "removed";
  return "unchanged";
};

const createSummary = (entries: DraftDiffEntry[]): DraftDiffSummary => {
  const summary: DraftDiffSummary = {
    totalCurrent: entries.filter((entry) => entry.currentBlock !== null).length,
    totalCandidate: entries.filter((entry) => entry.candidateBlock !== null).length,
    unchanged: 0,
    modified: 0,
    added: 0,
    removed: 0,
    changed: 0,
  };

  entries.forEach((entry) => {
    if (entry.status === "unchanged") {
      summary.unchanged += 1;
      return;
    }
    summary.changed += 1;
    if (entry.status === "modified") summary.modified += 1;
    if (entry.status === "added") summary.added += 1;
    if (entry.status === "removed") summary.removed += 1;
  });

  return summary;
};

export const buildDraftDiff = (
  currentBlocks: StepBlockDraft[],
  candidateBlocks: StepBlockDraft[]
): DraftDiffResult => {
  const maxLength = Math.max(currentBlocks.length, candidateBlocks.length);
  const entries: DraftDiffEntry[] = [];

  for (let index = 0; index < maxLength; index += 1) {
    const currentBlock = currentBlocks[index];
    const candidateBlock = candidateBlocks[index];
    const status = toStatus(currentBlock, candidateBlock);
    const key = candidateBlock?.id ?? currentBlock?.id ?? `draft-diff-${index}`;

    entries.push({
      key,
      status,
      currentIndex: currentBlock ? index : null,
      candidateIndex: candidateBlock ? index : null,
      currentBlock: currentBlock ?? null,
      candidateBlock: candidateBlock ?? null,
    });
  }

  return {
    summary: createSummary(entries),
    blocks: entries,
  };
};
