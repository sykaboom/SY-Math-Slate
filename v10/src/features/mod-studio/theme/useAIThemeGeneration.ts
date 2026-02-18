"use client";

import { useCallback, useState } from "react";

import {
  THEME_GLOBAL_TOKEN_KEYS,
  type ThemeGlobalTokenMap,
} from "@core/config/themeTokens";
import { useModStudioStore } from "@features/store/useModStudioStore";
import { useTokenDraftStore } from "@features/store/useTokenDraftStore";

import { validateThemeJson, THEME_JSON_SCHEMA_MARKER } from "./themeJsonIO";
import { applyThemeDraftPreview } from "./themeIsolation";

type GenerateAIThemeInput = {
  description: string;
  providerId?: string;
};

type AIThemeGenerationMetadata = {
  providerId: string;
  model: string;
  mocked: boolean;
};

export type UseAIThemeGenerationResult = {
  isGenerating: boolean;
  errorMessage: string;
  statusMessage: string;
  lastGeneration: AIThemeGenerationMetadata | null;
  hasGeneratedTheme: boolean;
  generateTheme: (input: GenerateAIThemeInput) => Promise<boolean>;
  applyLastGeneratedPreview: () => boolean;
  clearMessages: () => void;
};

const FALLBACK_THEME_LABEL = "AI Generated Theme";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const normalizeDescription = (value: string): string =>
  value.replace(/\r\n?/g, "\n").trim();

const normalizeProviderId = (value: string | undefined): string | undefined => {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
};

const toValidatedThemeTokens = (
  tokens: unknown,
  description: string
): ThemeGlobalTokenMap | null => {
  const validated = validateThemeJson({
    syMathSlateTheme: THEME_JSON_SCHEMA_MARKER,
    label: FALLBACK_THEME_LABEL,
    description,
    globalTokens: tokens,
    moduleScopedTokens: {},
  });
  if (!validated.ok) return null;
  return validated.value.globalTokens;
};

const readErrorMessage = (payload: unknown, fallbackStatus: number): string => {
  if (isRecord(payload) && typeof payload.message === "string") {
    const trimmed = payload.message.trim();
    if (trimmed.length > 0) {
      return trimmed;
    }
  }
  return `AI theme request failed (status ${fallbackStatus}).`;
};

export function useAIThemeGeneration(): UseAIThemeGenerationResult {
  const themeDraft = useModStudioStore((state) => state.draft.theme);
  const setThemeToken = useModStudioStore((state) => state.setThemeToken);
  const replaceDraft = useTokenDraftStore((state) => state.replaceDraft);

  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [lastGeneration, setLastGeneration] =
    useState<AIThemeGenerationMetadata | null>(null);
  const [lastGeneratedTokens, setLastGeneratedTokens] =
    useState<ThemeGlobalTokenMap | null>(null);

  const applyGeneratedTheme = useCallback(
    (tokens: ThemeGlobalTokenMap) => {
      replaceDraft(tokens);

      for (const tokenKey of THEME_GLOBAL_TOKEN_KEYS) {
        const tokenValue = tokens[tokenKey];
        if (typeof tokenValue !== "string") continue;
        setThemeToken(tokenKey, tokenValue);
      }

      applyThemeDraftPreview(
        tokens,
        themeDraft.moduleScopedTokens,
        themeDraft.presetId
      );
    },
    [replaceDraft, setThemeToken, themeDraft.moduleScopedTokens, themeDraft.presetId]
  );

  const generateTheme = useCallback(
    async (input: GenerateAIThemeInput): Promise<boolean> => {
      if (isGenerating) return false;

      const description = normalizeDescription(input.description);
      if (description.length === 0) {
        setErrorMessage("Theme description is required.");
        setStatusMessage("");
        return false;
      }

      const providerId = normalizeProviderId(input.providerId);

      setIsGenerating(true);
      setErrorMessage("");
      setStatusMessage("");

      try {
        const response = await fetch("/api/ai/theme", {
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
          setErrorMessage(readErrorMessage(payload, response.status));
          return false;
        }

        if (
          !isRecord(payload) ||
          payload.ok !== true ||
          typeof payload.providerId !== "string" ||
          typeof payload.model !== "string" ||
          typeof payload.mocked !== "boolean"
        ) {
          setErrorMessage("AI theme response shape is invalid.");
          return false;
        }

        const validatedTokens = toValidatedThemeTokens(payload.tokens, description);
        if (!validatedTokens) {
          setErrorMessage("AI theme response did not contain a valid token set.");
          return false;
        }

        applyGeneratedTheme(validatedTokens);
        setLastGeneratedTokens(validatedTokens);
        setLastGeneration({
          providerId: payload.providerId,
          model: payload.model,
          mocked: payload.mocked,
        });
        setStatusMessage(
          `Generated theme via ${payload.providerId}/${payload.model}${
            payload.mocked ? " (mock)" : ""
          }.`
        );
        return true;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unknown network error while generating theme.";
        setErrorMessage(message);
        return false;
      } finally {
        setIsGenerating(false);
      }
    },
    [applyGeneratedTheme, isGenerating]
  );

  const applyLastGeneratedPreview = useCallback((): boolean => {
    if (!lastGeneratedTokens) return false;
    applyGeneratedTheme(lastGeneratedTokens);
    setErrorMessage("");
    setStatusMessage("Reapplied latest AI-generated preview.");
    return true;
  }, [applyGeneratedTheme, lastGeneratedTokens]);

  const clearMessages = useCallback(() => {
    setErrorMessage("");
    setStatusMessage("");
  }, []);

  return {
    isGenerating,
    errorMessage,
    statusMessage,
    lastGeneration,
    hasGeneratedTheme: lastGeneratedTokens !== null,
    generateTheme,
    applyLastGeneratedPreview,
    clearMessages,
  };
}
