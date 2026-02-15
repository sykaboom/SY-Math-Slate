import type { StepBlockKind } from "@core/types/canvas";

import { createBlockId } from "./blockDraft";
import type { StepBlockDraft } from "./types";

export type BreakBlockKind = Exclude<StepBlockKind, "content">;

export type BlockReindexEntry = {
  blockId: string;
  blockIndex: number;
  isBreakBlock: boolean;
  contentOrder: number | null;
};

export type BlockMutationResult = {
  blocks: StepBlockDraft[];
  insertionIndex: number;
};

const isBreakBlock = (block: StepBlockDraft) =>
  Boolean(block.kind) && block.kind !== "content";

export const clampBlockInsertionIndex = (
  insertionIndex: number,
  blockCount: number
) => Math.max(0, Math.min(insertionIndex, blockCount));

export const reindexBlockStructure = (
  blocks: StepBlockDraft[]
): BlockReindexEntry[] => {
  let contentOrder = 0;
  return blocks.map((block, blockIndex) => {
    const breakBlock = isBreakBlock(block);
    const nextContentOrder = breakBlock ? null : contentOrder;
    if (!breakBlock) {
      contentOrder += 1;
    }
    return {
      blockId: block.id,
      blockIndex,
      isBreakBlock: breakBlock,
      contentOrder: nextContentOrder,
    };
  });
};

export const deleteBlockById = (
  blocks: StepBlockDraft[],
  blockId: string,
  insertionIndex: number
): BlockMutationResult => {
  const targetIndex = blocks.findIndex((block) => block.id === blockId);
  if (targetIndex === -1) {
    return {
      blocks,
      insertionIndex: clampBlockInsertionIndex(insertionIndex, blocks.length),
    };
  }

  const nextBlocks = blocks.filter((block) => block.id !== blockId);
  return {
    blocks: nextBlocks,
    insertionIndex: clampBlockInsertionIndex(insertionIndex, nextBlocks.length),
  };
};

export const moveBlockById = (
  blocks: StepBlockDraft[],
  fromId: string,
  toId: string
): StepBlockDraft[] => {
  if (fromId === toId) return blocks;

  const fromIndex = blocks.findIndex((block) => block.id === fromId);
  const toIndex = blocks.findIndex((block) => block.id === toId);
  if (fromIndex === -1 || toIndex === -1) return blocks;

  const next = [...blocks];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
};

export const moveBlockByIndex = (
  blocks: StepBlockDraft[],
  index: number,
  delta: -1 | 1
): StepBlockDraft[] => {
  const targetIndex = index + delta;
  if (targetIndex < 0 || targetIndex >= blocks.length) return blocks;

  const next = [...blocks];
  const [moved] = next.splice(index, 1);
  next.splice(targetIndex, 0, moved);
  return next;
};

export const insertBreakBlockAt = (
  blocks: StepBlockDraft[],
  insertionIndex: number,
  kind: BreakBlockKind
): BlockMutationResult => {
  const safeIndex = clampBlockInsertionIndex(insertionIndex, blocks.length);
  const next = [...blocks];
  next.splice(safeIndex, 0, {
    id: createBlockId(),
    kind,
    segments: [],
  });

  return {
    blocks: next,
    insertionIndex: Math.min(safeIndex + 1, blocks.length + 1),
  };
};
