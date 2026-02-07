import type { StepBlock } from "@core/types/canvas";

export type StepBlockDraft = StepBlock;
export type RawSyncReason =
  | "stable-id"
  | "normalized-text"
  | "positional-fallback"
  | "new";

export interface RawSyncDecision {
  lineIndex: number;
  reason: RawSyncReason;
  matchedBlockId?: string;
}

export interface RawSyncResult {
  blocks: StepBlockDraft[];
  unmatchedBlocks: StepBlockDraft[];
  decisions: RawSyncDecision[];
}

export type SegmentRefMap = Record<string, HTMLDivElement | null>;
export type SelectionRefMap = Record<string, Range | null>;
export type SegmentHtmlUpdater = (segmentId: string, html: string) => void;
