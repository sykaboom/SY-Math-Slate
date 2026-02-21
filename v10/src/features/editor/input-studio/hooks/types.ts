import type { ReactNode } from "react";

import type {
  EditorSurfaceBlockEntry,
  EditorSurfaceBreakLabels,
  EditorSurfaceModel,
  EditorSurfacePreviewLabels,
} from "@features/editor/editor-core/model/editorSurface";
import type { BreakBlockKind } from "@features/chrome/layout/dataInput/blockStructureOps";
import type {
  RawSyncDecision,
  StepBlockDraft,
} from "@features/chrome/layout/dataInput/types";

export type InputStudioMode = "compact" | "advanced";
export type InputStudioTab = "input" | "blocks";

export type InputStudioBlocksUpdater =
  | StepBlockDraft[]
  | ((previousBlocks: StepBlockDraft[]) => StepBlockDraft[]);

export type InputStudioApplyResult =
  | {
      ok: true;
      blocks: StepBlockDraft[];
    }
  | {
      ok: false;
      reason: "unmatched-blocks";
      unmatchedCount: number;
    };

export interface UseInputStudioHeadlessOptions {
  isOpen: boolean;
  sourceBlocks: StepBlockDraft[];
  fallbackBlocks?: StepBlockDraft[];
  insertionIndex: number;
  onInsertionIndexChange?: (nextIndex: number) => void;
  onApplyBlocks?: (nextBlocks: StepBlockDraft[]) => void;
  editorSurfacePreviewLabels?: Partial<EditorSurfacePreviewLabels>;
  editorSurfaceBreakLabels?: Partial<EditorSurfaceBreakLabels>;
}

export interface InputStudioHeadlessDerivedState {
  rawText: string;
  rawLines: string[];
  isSingleLine: boolean;
  lineHeight: number;
  lineHeightClass: string;
  blocks: StepBlockDraft[];
  unmatchedBlocks: StepBlockDraft[];
  syncDecisions: RawSyncDecision[];
  hasUnmatchedBlocks: boolean;
  canApply: boolean;
  safeInsertionIndex: number;
  editorSurface: EditorSurfaceModel;
  contentOrderByBlockId: Record<string, number | null>;
}

export interface InputStudioHeadlessHandlers {
  setRawTextDraft: (value: string) => void;
  setBlocksDraft: (updater: InputStudioBlocksUpdater) => void;
  handleRawChange: (value: string) => void;
  updateBlocksFromRaw: (value: string) => void;
  restoreUnmatchedBlocks: () => void;
  discardUnmatchedBlocks: () => void;
  deleteBlock: (blockId: string) => void;
  moveBlock: (fromId: string, toId: string) => void;
  moveBlockByIndex: (index: number, delta: -1 | 1) => void;
  insertBreakBlock: (kind: BreakBlockKind) => void;
  syncRawFromBlocks: (nextBlocks?: StepBlockDraft[]) => void;
  applyDraft: () => InputStudioApplyResult;
}

export type InputStudioHeadlessResult = InputStudioHeadlessDerivedState &
  InputStudioHeadlessHandlers;

export interface InputStudioHeaderSectionProps {
  mode: InputStudioMode;
  onModeChange: (mode: InputStudioMode) => void;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  compactLabel?: string;
  advancedLabel?: string;
  closeLabel?: string;
  className?: string;
}

export interface InputStudioRawSectionProps {
  rawText: string;
  onRawTextChange: (nextRawText: string) => void;
  onRawScroll?: (scrollTop: number) => void;
  label?: string;
  helperText?: string;
  placeholder?: string;
  syncDecisionCount?: number;
  syncDecisionSummaryText?: string;
  disabled?: boolean;
  className?: string;
}

export interface InputStudioInsertionMarkerRenderArgs {
  index: number;
  isActive: boolean;
  onSelect: () => void;
}

export interface InputStudioBlockRenderArgs {
  block: StepBlockDraft;
  blockEntry: EditorSurfaceBlockEntry;
  index: number;
  stepNumber: number | null;
  isExpanded: boolean;
}

export interface InputStudioBlocksSectionProps {
  blocks: StepBlockDraft[];
  editorSurface: EditorSurfaceModel;
  contentOrderByBlockId: Record<string, number | null>;
  expandedBlockId: string | null;
  onExpandedBlockChange: (nextBlockId: string | null) => void;
  onMoveBlock: (fromId: string, toId: string) => void;
  onMoveBlockByIndex: (index: number, delta: -1 | 1) => void;
  onDeleteBlock: (blockId: string) => void;
  onInsertionIndexChange: (index: number) => void;
  onInsertBreakBlock: (kind: BreakBlockKind) => void;
  renderExpandedContent?: (args: InputStudioBlockRenderArgs) => ReactNode;
  renderInsertionMarker?: (args: InputStudioInsertionMarkerRenderArgs) => ReactNode;
  label?: string;
  lineBreakLabel?: string;
  columnBreakLabel?: string;
  pageBreakLabel?: string;
  className?: string;
}

export interface InputStudioActionsSectionProps {
  onClose: () => void;
  onRestoreLayoutSnapshot?: () => void;
  canRestoreLayoutSnapshot?: boolean;
  onAutoLayout?: () => void | Promise<void>;
  isAutoLayoutRunning?: boolean;
  onApply: () => void;
  canApply: boolean;
  unmatchedBlockCount?: number;
  onRestoreUnmatchedBlocks?: () => void;
  onDiscardUnmatchedBlocks?: () => void;
  closeLabel?: string;
  restoreLabel?: string;
  autoLayoutLabel?: string;
  autoLayoutRunningLabel?: string;
  applyLabel?: string;
  unmatchedTitle?: string;
  unmatchedBody?: string;
  className?: string;
}
