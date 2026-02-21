"use client";

import { useCallback, useState } from "react";

import { listAppCommands } from "@core/runtime/command/commandBus";
import { isKnownUISlotName } from "@core/runtime/plugin-runtime/registry";
import type { ModuleDraft } from "@features/mod-studio/core/types";
import { useModStudioStore } from "@features/store/useModStudioStore";

type GenerateAIModuleInput = {
  description: string;
  providerId?: string;
};

type AIModuleGenerationMetadata = {
  providerId: string;
  model: string;
  mocked: boolean;
};

type AIModuleGenerationRequest = {
  description: string;
  providerId?: string;
};

export type UseAIModuleGenerationResult = {
  isGenerating: boolean;
  errorMessage: string;
  statusMessage: string;
  lastGeneration: AIModuleGenerationMetadata | null;
  lastGeneratedModules: ModuleDraft[];
  hasGeneratedModules: boolean;
  canRetry: boolean;
  generateModules: (input: GenerateAIModuleInput) => Promise<boolean>;
  retryLastRequest: () => Promise<boolean>;
  applyLastGeneratedModules: () => boolean;
  clearMessages: () => void;
};

const MODULE_ID_PATTERN = /^[a-z0-9]+(?:_[a-z0-9]+)*$/;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const normalizeDescription = (value: string): string =>
  value.replace(/\r\n?/g, "\n").trim();

const normalizeProviderId = (value: string | undefined): string | undefined => {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
};

const readErrorMessage = (payload: unknown, fallbackStatus: number): string => {
  if (isRecord(payload) && typeof payload.message === "string") {
    const trimmed = payload.message.trim();
    if (trimmed.length > 0) {
      return trimmed;
    }
  }
  return `AI module request failed (status ${fallbackStatus}).`;
};

const validateModuleArray = (
  raw: unknown,
  knownCommandIds?: Set<string>
): ModuleDraft[] | null => {
  if (!Array.isArray(raw)) return null;

  const modules: ModuleDraft[] = [];
  const idSet = new Set<string>();
  const orderSet = new Set<number>();

  for (const item of raw) {
    if (!isRecord(item)) return null;

    const id = typeof item.id === "string" ? item.id.trim() : "";
    if (id.length === 0 || !MODULE_ID_PATTERN.test(id)) return null;
    if (idSet.has(id)) return null;

    const { slot } = item;
    if (!isKnownUISlotName(slot)) return null;

    const action = item.action;
    if (!isRecord(action)) return null;
    const commandId =
      typeof action.commandId === "string" ? action.commandId.trim() : "";
    if (commandId.length === 0) return null;

    if (
      knownCommandIds &&
      knownCommandIds.size > 0 &&
      !knownCommandIds.has(commandId)
    ) {
      return null;
    }

    const order =
      typeof item.order === "number" && Number.isFinite(item.order)
        ? Math.round(item.order)
        : modules.length;
    if (orderSet.has(order)) return null;

    idSet.add(id);
    orderSet.add(order);

    modules.push({
      id,
      label:
        typeof item.label === "string" && item.label.trim().length > 0
          ? item.label.trim()
          : id,
      slot,
      enabled: item.enabled !== false,
      order,
      action: {
        commandId,
        payload: {},
      },
    });
  }

  return modules.length > 0 ? modules : null;
};

export function useAIModuleGeneration(): UseAIModuleGenerationResult {
  const upsertModuleDraft = useModStudioStore((state) => state.upsertModuleDraft);
  const setLastPublishResult = useModStudioStore(
    (state) => state.setLastPublishResult
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [lastGeneration, setLastGeneration] =
    useState<AIModuleGenerationMetadata | null>(null);
  const [lastGeneratedModules, setLastGeneratedModules] = useState<ModuleDraft[]>([]);
  const [lastRequest, setLastRequest] = useState<AIModuleGenerationRequest | null>(
    null
  );

  const applyGeneratedModules = useCallback(
    (modules: ModuleDraft[]) => {
      modules.forEach((module) => {
        upsertModuleDraft(module);
      });
    },
    [upsertModuleDraft]
  );

  const generateModules = useCallback(
    async (input: GenerateAIModuleInput): Promise<boolean> => {
      if (isGenerating) return false;

      const description = normalizeDescription(input.description);
      if (description.length === 0) {
        setErrorMessage("Module description is required.");
        setStatusMessage("");
        setLastPublishResult({
          ok: false,
          message: "ai module generation failed: empty description.",
        });
        return false;
      }

      const providerId = normalizeProviderId(input.providerId);
      setLastRequest({ description, ...(providerId ? { providerId } : {}) });
      setIsGenerating(true);
      setErrorMessage("");
      setStatusMessage("");

      try {
        const response = await fetch("/api/ai/module", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            description,
            ...(providerId ? { providerId } : {}),
          }),
        });

        const payload = (await response.json().catch(() => null)) as unknown;
        if (!response.ok) {
          const message = readErrorMessage(payload, response.status);
          setErrorMessage(message);
          setLastPublishResult({
            ok: false,
            message: `ai module generation failed: ${message}`,
          });
          return false;
        }

        if (
          !isRecord(payload) ||
          payload.ok !== true ||
          typeof payload.providerId !== "string" ||
          typeof payload.model !== "string" ||
          typeof payload.mocked !== "boolean"
        ) {
          const message = "AI module response shape is invalid.";
          setErrorMessage(message);
          setLastPublishResult({
            ok: false,
            message: `ai module generation failed: ${message}`,
          });
          return false;
        }

        const knownCommandIds = new Set(
          listAppCommands().map((command) => command.id)
        );
        const validatedModules = validateModuleArray(
          payload.modules,
          knownCommandIds
        );
        if (!validatedModules) {
          const message =
            "AI module response was invalid or included unknown commandId.";
          setErrorMessage(message);
          setLastPublishResult({
            ok: false,
            message: `ai module generation failed: ${message}`,
          });
          return false;
        }

        applyGeneratedModules(validatedModules);
        setLastGeneratedModules(validatedModules);
        setLastGeneration({
          providerId: payload.providerId,
          model: payload.model,
          mocked: payload.mocked,
        });
        setStatusMessage(
          `Generated ${validatedModules.length} modules via ${payload.providerId}/${payload.model}${
            payload.mocked ? " (mock)" : ""
          }.`
        );
        setLastPublishResult({
          ok: true,
          message: `ai module generation applied (${validatedModules.length} modules).`,
        });
        return true;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unknown network error while generating modules.";
        setErrorMessage(message);
        setLastPublishResult({
          ok: false,
          message: `ai module generation failed: ${message}`,
        });
        return false;
      } finally {
        setIsGenerating(false);
      }
    },
    [applyGeneratedModules, isGenerating, setLastPublishResult]
  );

  const retryLastRequest = useCallback(async (): Promise<boolean> => {
    if (!lastRequest) return false;
    return generateModules(lastRequest);
  }, [generateModules, lastRequest]);

  const applyLastGeneratedModules = useCallback((): boolean => {
    if (lastGeneratedModules.length === 0) return false;
    applyGeneratedModules(lastGeneratedModules);
    setErrorMessage("");
    setStatusMessage("Reapplied latest AI-generated modules.");
    setLastPublishResult({
      ok: true,
      message: `ai module generation reapplied (${lastGeneratedModules.length} modules).`,
    });
    return true;
  }, [applyGeneratedModules, lastGeneratedModules, setLastPublishResult]);

  const clearMessages = useCallback(() => {
    setErrorMessage("");
    setStatusMessage("");
  }, []);

  return {
    isGenerating,
    errorMessage,
    statusMessage,
    lastGeneration,
    lastGeneratedModules,
    hasGeneratedModules: lastGeneratedModules.length > 0,
    canRetry: lastRequest !== null,
    generateModules,
    retryLastRequest,
    applyLastGeneratedModules,
    clearMessages,
  };
}
