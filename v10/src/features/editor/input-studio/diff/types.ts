import type { StepBlockDraft } from "@features/chrome/layout/dataInput/types";

export type DraftDiffBlockStatus = "added" | "removed" | "modified" | "unchanged";

export type DraftDiffSummary = {
  totalCurrent: number;
  totalCandidate: number;
  unchanged: number;
  modified: number;
  added: number;
  removed: number;
  changed: number;
};

export type DraftDiffEntry = {
  key: string;
  status: DraftDiffBlockStatus;
  currentIndex: number | null;
  candidateIndex: number | null;
  currentBlock: StepBlockDraft | null;
  candidateBlock: StepBlockDraft | null;
};

export type DraftDiffResult = {
  summary: DraftDiffSummary;
  blocks: DraftDiffEntry[];
};
