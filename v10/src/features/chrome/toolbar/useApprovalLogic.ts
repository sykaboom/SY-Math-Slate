"use client";

import { useCallback, useMemo } from "react";

import type { NormalizedBlock, NormalizedContent } from "@core/foundation/schemas";
import { isNormalizedContent } from "@core/foundation/schemas";
import { normalizeTextSegmentStyle } from "@core/ui/theming/engine/typography";
import { dispatchCommand } from "@core/runtime/command/commandBus";
import { sanitizeRichTextHtml } from "@core/security/sanitization/richTextSanitizer";
import type { StepBlock } from "@core/foundation/types/canvas";
import {
  cloneInputStudioDraftBlocks,
  isInputStudioDraftQueueMeta,
  parseInputStudioDraftQueueEnvelope,
} from "@features/editor/input-studio/approval/inputStudioApproval";
import { useCanvasStore } from "@features/platform/store/useCanvasStore";
import { useDocStore } from "@features/platform/store/useDocStore";
import { useSyncStore, type PendingAIQueueEntry } from "@features/platform/store/useSyncStore";

const DEFAULT_MEDIA_WIDTH = 1280;
const DEFAULT_MEDIA_HEIGHT = 720;
const FALLBACK_MATH_LATEX = "\\square";
const EXTERNAL_MEDIA_PREFIX = "asset://external/";

export type ApprovalCounts = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
};

export type UseApprovalLogicResult = {
  entries: PendingAIQueueEntry[];
  counts: ApprovalCounts;
  approve: (id: string) => void;
  reject: (id: string) => void;
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

type CommandQueueMeta = {
  queueType: "command";
  commandId: string;
  idempotencyKey?: string;
};

const toCommandQueueMeta = (entry: PendingAIQueueEntry): CommandQueueMeta | null => {
  if (!entry.meta || !isRecord(entry.meta)) return null;
  if (entry.meta.queueType !== "command") return null;
  if (!isNonEmptyString(entry.meta.commandId)) return null;
  const idempotencyKey = isNonEmptyString(entry.meta.idempotencyKey)
    ? entry.meta.idempotencyKey.trim()
    : undefined;
  return {
    queueType: "command",
    commandId: entry.meta.commandId.trim(),
    ...(idempotencyKey ? { idempotencyKey } : {}),
  };
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const toRichTextHtml = (value: unknown): string => {
  if (!isNonEmptyString(value)) {
    return "&nbsp;";
  }
  const html = value
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => (line.length > 0 ? escapeHtml(line) : "&nbsp;"))
    .join("<br/>");
  return sanitizeRichTextHtml(html, { ensureNotEmpty: true });
};

const toMediaSrc = (mediaRef: unknown, fallbackId: string): string => {
  if (!isNonEmptyString(mediaRef)) {
    return `asset://missing/${fallbackId}`;
  }
  const trimmed = mediaRef.trim();
  if (!trimmed.startsWith(EXTERNAL_MEDIA_PREFIX)) {
    return trimmed;
  }
  const encoded = trimmed.slice(EXTERNAL_MEDIA_PREFIX.length);
  if (!encoded) return trimmed;
  try {
    const decoded = decodeURIComponent(encoded);
    return decoded.trim().length > 0 ? decoded : trimmed;
  } catch {
    return trimmed;
  }
};

const toBreakKind = (value: unknown): StepBlock["kind"] => {
  if (value === "line-break") return "line-break";
  if (value === "column-break") return "column-break";
  if (value === "page-break") return "page-break";
  return "line-break";
};

const toUniqueId = (candidate: unknown, fallback: string, used: Set<string>) => {
  const base = isNonEmptyString(candidate) ? candidate.trim() : fallback;
  if (!used.has(base)) {
    used.add(base);
    return base;
  }
  let suffix = 1;
  while (used.has(`${base}-${suffix}`)) {
    suffix += 1;
  }
  const next = `${base}-${suffix}`;
  used.add(next);
  return next;
};

const mapNormalizedBlockToStepBlock = (
  block: NormalizedBlock,
  index: number,
  entryId: string,
  style: ReturnType<typeof normalizeTextSegmentStyle>,
  usedBlockIds: Set<string>
): StepBlock => {
  const blockId = toUniqueId(block.id, `approval-${entryId}-block-${index}`, usedBlockIds);

  if (block.kind === "break") {
    return {
      id: blockId,
      kind: toBreakKind(block.breakKind),
      segments: [],
    };
  }

  if (block.kind === "media") {
    return {
      id: blockId,
      kind: "content",
      segments: [
        {
          id: `${blockId}:media:0`,
          type: block.mediaType === "video" ? "video" : "image",
          src: toMediaSrc(block.mediaRef, blockId),
          width: DEFAULT_MEDIA_WIDTH,
          height: DEFAULT_MEDIA_HEIGHT,
          orderIndex: 0,
        },
      ],
    };
  }

  const rawText =
    block.kind === "math"
      ? `$$${isNonEmptyString(block.latex) ? block.latex.trim() : FALLBACK_MATH_LATEX}$$`
      : block.text;

  return {
    id: blockId,
    kind: "content",
    segments: [
      {
        id: `${blockId}:text:0`,
        type: "text",
        html: toRichTextHtml(rawText),
        style,
        orderIndex: 0,
      },
    ],
  };
};

const mapNormalizedContentToStepBlocks = (
  normalized: NormalizedContent,
  entryId: string
): StepBlock[] => {
  if (!Array.isArray(normalized.blocks)) return [];
  const style = normalizeTextSegmentStyle(normalized.style);
  const usedBlockIds = new Set<string>();
  return normalized.blocks.map((block, index) =>
    mapNormalizedBlockToStepBlock(block, index, entryId, style, usedBlockIds)
  );
};

const buildCounts = (entries: PendingAIQueueEntry[]): ApprovalCounts => {
  return entries.reduce<ApprovalCounts>(
    (acc, entry) => {
      if (entry.status === "pending") acc.pending += 1;
      if (entry.status === "approved") acc.approved += 1;
      if (entry.status === "rejected") acc.rejected += 1;
      acc.total += 1;
      return acc;
    },
    { total: 0, pending: 0, approved: 0, rejected: 0 }
  );
};

export function useApprovalLogic(): UseApprovalLogicResult {
  const queue = useSyncStore((state) => state.pendingAIQueue);
  const markApproved = useSyncStore((state) => state.markApproved);
  const markRejected = useSyncStore((state) => state.markRejected);
  const removeQueueEntry = useSyncStore((state) => state.removeQueueEntry);

  const entries = useMemo(
    () => queue.filter((entry) => entry.status === "pending"),
    [queue]
  );
  const counts = useMemo(() => buildCounts(queue), [queue]);

  const approve = useCallback(
    (id: string) => {
      const entry = queue.find((candidate) => candidate.id === id);
      if (!entry) return;

      const commandQueueMeta = toCommandQueueMeta(entry);
      if (commandQueueMeta) {
        void dispatchCommand(commandQueueMeta.commandId, entry.payload, {
          role: "host",
          idempotencyKey: commandQueueMeta.idempotencyKey,
          meta: entry.meta ?? undefined,
        })
          .then((result) => {
            if (!result.ok) return;
            markApproved(id);
            removeQueueEntry(id);
          })
          .catch(() => undefined);
        return;
      }

      const inputStudioQueue = parseInputStudioDraftQueueEnvelope(
        entry.meta,
        entry.payload
      );
      if (inputStudioQueue) {
        const canvas = useCanvasStore.getState();
        canvas.importStepBlocks(
          cloneInputStudioDraftBlocks(inputStudioQueue.payload.draftBlocks)
        );
        useDocStore.getState().syncFromCanvas(useCanvasStore.getState());
        markApproved(id);
        removeQueueEntry(id);
        return;
      }

      if (isInputStudioDraftQueueMeta(entry.meta)) {
        markRejected(id);
        removeQueueEntry(id);
        return;
      }

      const normalized = entry.toolResult?.normalized;
      if (isNormalizedContent(normalized)) {
        const incomingBlocks = mapNormalizedContentToStepBlocks(normalized, entry.id);
        if (incomingBlocks.length > 0) {
          const canvas = useCanvasStore.getState();
          const mergedBlocks = [...canvas.stepBlocks, ...incomingBlocks];
          canvas.importStepBlocks(mergedBlocks);
          useDocStore.getState().syncFromCanvas(useCanvasStore.getState());
        }
      }

      markApproved(id);
      removeQueueEntry(id);
    },
    [markApproved, markRejected, queue, removeQueueEntry]
  );

  const reject = useCallback(
    (id: string) => {
      const entry = queue.find((candidate) => candidate.id === id);
      if (!entry) return;
      markRejected(id);
      removeQueueEntry(id);
    },
    [markRejected, queue, removeQueueEntry]
  );

  return {
    entries,
    counts,
    approve,
    reject,
  };
}
