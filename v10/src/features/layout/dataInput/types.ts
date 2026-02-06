import type { StepBlock } from "@core/types/canvas";

export type StepBlockDraft = StepBlock;

export type SegmentRefMap = Record<string, HTMLDivElement | null>;
export type SelectionRefMap = Record<string, Range | null>;
export type SegmentHtmlUpdater = (segmentId: string, html: string) => void;
