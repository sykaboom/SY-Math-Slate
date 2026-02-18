import type { PromptProfile } from "@core/types/aiApproval";

import { resolvePromptProfile } from "./resolvePromptProfile";

export type LLMCallInput = {
  providerId?: string;
  model?: string;
  prompt: string;
  promptProfile?: PromptProfile;
  temperature?: number;
  maxTokens?: number;
};

export type LLMCallSuccess = {
  ok: true;
  providerId: string;
  model: string;
  text: string;
  mocked: boolean;
  usage: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
};

export type LLMCallFailure = {
  ok: false;
  code:
    | "invalid-request"
    | "provider-not-configured"
    | "provider-failed"
    | "network-failed";
  message: string;
};

export type LLMCallResult = LLMCallSuccess | LLMCallFailure;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const normalizePrompt = (value: string): string => value.replace(/\r\n?/g, "\n").trim();

const toFailure = (
  code: LLMCallFailure["code"],
  message: string
): LLMCallFailure => ({
  ok: false,
  code,
  message,
});

const parseResult = (value: unknown): LLMCallResult => {
  if (!isRecord(value) || typeof value.ok !== "boolean") {
    return toFailure("provider-failed", "Invalid provider response payload.");
  }
  if (value.ok !== true) {
    const message =
      typeof value.message === "string"
        ? value.message
        : "Provider call failed unexpectedly.";
    const code =
      value.code === "invalid-request" ||
      value.code === "provider-not-configured" ||
      value.code === "provider-failed" ||
      value.code === "network-failed"
        ? value.code
        : "provider-failed";
    return toFailure(code, message);
  }

  if (
    typeof value.providerId !== "string" ||
    typeof value.model !== "string" ||
    typeof value.text !== "string"
  ) {
    return toFailure("provider-failed", "Provider response shape is invalid.");
  }

  const usage = isRecord(value.usage) ? value.usage : {};

  return {
    ok: true,
    providerId: value.providerId,
    model: value.model,
    text: value.text,
    mocked: value.mocked === true,
    usage: {
      ...(typeof usage.inputTokens === "number"
        ? { inputTokens: usage.inputTokens }
        : {}),
      ...(typeof usage.outputTokens === "number"
        ? { outputTokens: usage.outputTokens }
        : {}),
      ...(typeof usage.totalTokens === "number"
        ? { totalTokens: usage.totalTokens }
        : {}),
    },
  };
};

export const executeLLMCallOnServer = async (
  input: LLMCallInput,
  options?: { mockMode?: boolean }
): Promise<LLMCallResult> => {
  const prompt = normalizePrompt(input.prompt);
  if (prompt.length === 0) {
    return toFailure("invalid-request", "prompt must be a non-empty string.");
  }

  try {
    const { callAIProvider } = await import("@core/config/aiProviderRegistry");
    const result = await callAIProvider({
      providerId: input.providerId,
      model: input.model,
      prompt,
      systemPrompt: resolvePromptProfile(input.promptProfile),
      temperature: input.temperature,
      maxTokens: input.maxTokens,
      mockMode: options?.mockMode === true,
    });

    if (!result.ok) {
      return toFailure(
        result.code === "invalid-input" ? "invalid-request" : result.code,
        result.message
      );
    }

    return {
      ok: true,
      providerId: result.providerId,
      model: result.model,
      text: result.text,
      mocked: result.mocked,
      usage: result.usage,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error.";
    return toFailure("provider-failed", message);
  }
};

export const callLLMThroughApi = async (
  input: LLMCallInput
): Promise<LLMCallResult> => {
  const prompt = normalizePrompt(input.prompt);
  if (prompt.length === 0) {
    return toFailure("invalid-request", "prompt must be a non-empty string.");
  }

  try {
    const response = await fetch("/api/ai/call", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        providerId: input.providerId,
        model: input.model,
        prompt,
        promptProfile: input.promptProfile,
        temperature: input.temperature,
        maxTokens: input.maxTokens,
      }),
    });

    const body = (await response.json().catch(() => null)) as unknown;
    const parsed = parseResult(body);
    if (response.ok) {
      return parsed;
    }
    if (parsed.ok) {
      return toFailure(
        "provider-failed",
        `API request failed with status ${response.status}.`
      );
    }
    return parsed;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown network error.";
    return toFailure("network-failed", message);
  }
};
