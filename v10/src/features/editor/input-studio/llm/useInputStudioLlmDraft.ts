"use client";

import { useCallback, useMemo, useState } from "react";

import { isNormalizedContent, type NormalizedContent } from "@core/foundation/schemas";
import { executeRegisteredToolRequest } from "@core/runtime/plugin-runtime/connectors";
import { getAdapterInvokerById } from "@features/platform/extensions/adapters";
import { blocksToRawText } from "@features/chrome/layout/dataInput/blockDraft";
import { useLocalStore } from "@features/platform/store/useLocalStore";
import { enqueueOfflineDraftQueueItem } from "@features/editor/input-studio/offlineDraftQueue";
import { buildDraftDiff } from "@features/editor/input-studio/diff/draftDiff";

import { normalizedToDraftBlocks } from "./normalizedToDraftBlocks";
import {
  INPUT_STUDIO_LLM_DRAFT_TOOL_ID,
  INPUT_STUDIO_LLM_DRAFT_ADAPTER_ID,
  type InputStudioLlmDraftError,
  type InputStudioLlmDraftRequest,
  type InputStudioLlmDraftResult,
  type UseInputStudioLlmDraftOptions,
  type UseInputStudioLlmDraftResult,
} from "./types";

const DEFAULT_LOCALE = "ko-KR";
const OFFLINE_DRAFT_QUEUED_ERROR_CODE = "connector-failed" as const;
const OFFLINE_DRAFT_QUEUED_ERROR_MESSAGE =
  "offline-draft-queued: request saved to offline queue.";

const toDraftError = (
  code: InputStudioLlmDraftError["code"],
  message: string
): InputStudioLlmDraftError => ({
  code,
  message,
});

const pickLocale = (
  requestedLocale: string | undefined,
  fallbackLocale: string | undefined
): string => {
  const requested = requestedLocale?.trim();
  if (requested) return requested;
  const fallback = fallbackLocale?.trim();
  if (fallback) return fallback;
  return DEFAULT_LOCALE;
};

export const useInputStudioLlmDraft = ({
  currentBlocks,
  fallbackLocale,
}: UseInputStudioLlmDraftOptions): UseInputStudioLlmDraftResult => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [candidate, setCandidate] =
    useState<UseInputStudioLlmDraftResult["candidate"]>(null);
  const [error, setError] = useState<InputStudioLlmDraftError | null>(null);

  const role = useLocalStore((state) =>
    state.trustedRoleClaim === "host" || state.role === "host" ? "host" : "student"
  );

  const currentRawText = useMemo(() => blocksToRawText(currentBlocks), [currentBlocks]);

  const clearCandidate = useCallback(() => {
    setCandidate(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const requestDraft = useCallback(
    async (request: InputStudioLlmDraftRequest): Promise<InputStudioLlmDraftResult> => {
      const prompt = request.prompt.trim();
      if (prompt === "") {
        const nextError = toDraftError(
          "invalid-prompt",
          "prompt must be a non-empty string."
        );
        setError(nextError);
        return { ok: false, error: nextError };
      }

      const payload = {
        prompt,
        locale: pickLocale(request.locale, fallbackLocale),
        rawText: request.rawText ?? currentRawText,
      };

      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        enqueueOfflineDraftQueueItem({
          prompt,
          locale: payload.locale,
          rawText: payload.rawText,
          meta: request.meta,
          role,
        });
        const nextError = toDraftError(
          OFFLINE_DRAFT_QUEUED_ERROR_CODE,
          OFFLINE_DRAFT_QUEUED_ERROR_MESSAGE
        );
        setError(nextError);
        return { ok: false, error: nextError };
      }

      setIsRequesting(true);
      setError(null);

      try {
        const resolved = await executeRegisteredToolRequest(
          {
            toolId: INPUT_STUDIO_LLM_DRAFT_TOOL_ID,
            payload,
            meta: request.meta,
            role,
          },
          {
            getAdapterById: getAdapterInvokerById,
          }
        );

        if (!resolved.ok) {
          const nextError = toDraftError(resolved.code, resolved.error);
          setError(nextError);
          return { ok: false, error: nextError };
        }

        if (!isNormalizedContent(resolved.toolResult.normalized)) {
          const nextError = toDraftError(
            "invalid-normalized-content",
            "llm draft response must normalize to NormalizedContent."
          );
          setError(nextError);
          return { ok: false, error: nextError };
        }

        const normalized: NormalizedContent = resolved.toolResult.normalized;
        const blocks = normalizedToDraftBlocks(normalized);
        const diff = buildDraftDiff(currentBlocks, blocks);
        const receivedAt = Date.now();
        const nextCandidate = {
          toolId: resolved.toolResult.toolId,
          adapterId: INPUT_STUDIO_LLM_DRAFT_ADAPTER_ID,
          normalized,
          blocks,
          diff,
          receivedAt,
        };

        const result: InputStudioLlmDraftResult = {
          ok: true,
          candidate: nextCandidate,
          toolResult: {
            ...resolved.toolResult,
            normalized,
          },
        };
        setCandidate(nextCandidate);
        return result;
      } catch (requestError) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : "unexpected llm draft request failure.";
        const nextError = toDraftError("unexpected-error", message);
        setError(nextError);
        return { ok: false, error: nextError };
      } finally {
        setIsRequesting(false);
      }
    },
    [currentBlocks, currentRawText, fallbackLocale, role]
  );

  return {
    isRequesting,
    candidate,
    error,
    requestDraft,
    clearCandidate,
    clearError,
  };
};
