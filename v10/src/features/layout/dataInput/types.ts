import type { StepBlock } from "@core/types/canvas";
import type { CaretSelectionSnapshot } from "@features/editor-core/selection/caretEngine";

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
export type SelectionRefValue = Range | CaretSelectionSnapshot | null;
export type SelectionRefMap = Record<string, SelectionRefValue>;
export type SegmentHtmlUpdater = (segmentId: string, html: string) => void;
