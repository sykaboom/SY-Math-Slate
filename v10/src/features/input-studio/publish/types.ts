import type { StepSegment, TextSegmentStyle } from "@core/types/canvas";
import type { StepBlockDraft } from "@features/layout/dataInput/types";

const INPUT_STUDIO_DEFAULT_SNAPSHOT_REASON = "input-studio-snapshot";

export type InputStudioPublishSnapshot = {
  id: string;
  createdAt: number;
  reason: string;
  blocks: StepBlockDraft[];
};

export type InputStudioSnapshotApplyResult = {
  snapshot: InputStudioPublishSnapshot;
  blocks: StepBlockDraft[];
};

export type InputStudioPublishApplyResult = {
  rollbackSnapshot: InputStudioPublishSnapshot;
  publishedSnapshot: InputStudioPublishSnapshot;
  appliedBlocks: StepBlockDraft[];
};

const createSnapshotId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `input-studio-snapshot-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const normalizeReason = (reason?: string): string => {
  if (typeof reason !== "string") return INPUT_STUDIO_DEFAULT_SNAPSHOT_REASON;
  const trimmed = reason.trim();
  return trimmed.length > 0 ? trimmed : INPUT_STUDIO_DEFAULT_SNAPSHOT_REASON;
};

const cloneTextSegmentStyle = (
  style: TextSegmentStyle | undefined
): TextSegmentStyle | undefined => (style ? { ...style } : undefined);

const cloneStepSegment = (segment: StepSegment): StepSegment => {
  if (segment.type === "text") {
    return {
      ...segment,
      ...(segment.style ? { style: cloneTextSegmentStyle(segment.style) } : {}),
    };
  }
  return { ...segment };
};

export const cloneStepBlockDrafts = (
  blocks: StepBlockDraft[]
): StepBlockDraft[] =>
  blocks.map((block) => ({
    id: block.id,
    ...(block.kind ? { kind: block.kind } : {}),
    segments: block.segments.map(cloneStepSegment),
  }));

export const createInputStudioPublishSnapshot = (
  blocks: StepBlockDraft[],
  reason?: string
): InputStudioPublishSnapshot => ({
  id: createSnapshotId(),
  createdAt: Date.now(),
  reason: normalizeReason(reason),
  blocks: cloneStepBlockDrafts(blocks),
});
