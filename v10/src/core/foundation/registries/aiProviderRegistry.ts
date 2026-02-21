import type { AIProviderId } from "@core/foundation/types/aiApproval";
import { isAIProviderId } from "@core/foundation/types/aiApproval";

export type AIProviderRegistryEntry = {
  id: AIProviderId;
  label: string;
  defaultModel: string;
  requiresApiKey: boolean;
};

export type AIProviderResolutionReason =
  | "requested-provider"
  | "default-openai"
  | "mock-mode-enabled"
  | "fallback-mock-no-openai-key";

export type ResolveAIProviderResult =
  | {
      ok: true;
      provider: AIProviderRegistryEntry;
      reason: AIProviderResolutionReason;
      hasOpenAIKey: boolean;
      mockModeEnabled: boolean;
    }
  | {
      ok: false;
      code: "unsupported-provider" | "provider-unavailable";
      message: string;
      hasOpenAIKey: boolean;
      mockModeEnabled: boolean;
    };

export type ResolveAIProviderOptions = {
  requestedProviderId?: unknown;
  openAIApiKey?: unknown;
  aiMockMode?: unknown;
};

export type AIProviderCallInput = {
  providerId?: string;
  model?: string;
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  mockMode?: boolean;
};

export type AIProviderCallOutput = {
  ok: true;
  providerId: AIProviderId;
  model: string;
  text: string;
  mocked: boolean;
  usage: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
};

export type AIProviderCallFailure = {
  ok: false;
  code: "invalid-input" | "provider-not-configured" | "provider-failed";
  message: string;
};

export type AIProviderCallResult = AIProviderCallOutput | AIProviderCallFailure;

const TRUE_LIKE_VALUES = new Set(["1", "true", "yes", "on"]);

const PROVIDER_REGISTRY: Record<AIProviderId, AIProviderRegistryEntry> = {
  openai: {
    id: "openai",
    label: "OpenAI",
    defaultModel: "gpt-4o-mini",
    requiresApiKey: true,
  },
  mock: {
    id: "mock",
    label: "Mock",
    defaultModel: "mock-llm-v1",
    requiresApiKey: false,
  },
};

const DEFAULT_OPENAI_MODEL = PROVIDER_REGISTRY.openai.defaultModel;
const DEFAULT_MOCK_MODEL = PROVIDER_REGISTRY.mock.defaultModel;
const OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions";

const toNormalizedString = (value: unknown): string => {
  if (typeof value !== "string") return "";
  return value.trim();
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const toResolvedRequestedProviderId = (
  value: unknown
): AIProviderId | null | "invalid" => {
  if (value === undefined || value === null) return null;
  const normalized = toNormalizedString(value);
  if (normalized.length === 0) return null;
  return isAIProviderId(normalized) ? normalized : "invalid";
};

export const isMockModeEnabled = (value: unknown): boolean => {
  if (typeof value === "boolean") return value;
  const normalized = toNormalizedString(value).toLowerCase();
  if (normalized.length === 0) return false;
  return TRUE_LIKE_VALUES.has(normalized);
};

export const hasOpenAIApiKey = (value: unknown): boolean =>
  toNormalizedString(value).length > 0;

export const getAIProvider = (providerId: AIProviderId): AIProviderRegistryEntry =>
  PROVIDER_REGISTRY[providerId];

export const listAIProviders = (): AIProviderRegistryEntry[] => [
  PROVIDER_REGISTRY.openai,
  PROVIDER_REGISTRY.mock,
];

export const resolveAIProvider = (
  options: ResolveAIProviderOptions = {}
): ResolveAIProviderResult => {
  const hasOpenAIKey = hasOpenAIApiKey(options.openAIApiKey);
  const mockModeEnabled = isMockModeEnabled(options.aiMockMode);
  const requestedProviderId = toResolvedRequestedProviderId(options.requestedProviderId);

  if (requestedProviderId === "invalid") {
    return {
      ok: false,
      code: "unsupported-provider",
      message: "Requested AI provider is not supported.",
      hasOpenAIKey,
      mockModeEnabled,
    };
  }

  if (requestedProviderId === "mock") {
    return {
      ok: true,
      provider: PROVIDER_REGISTRY.mock,
      reason: "requested-provider",
      hasOpenAIKey,
      mockModeEnabled,
    };
  }

  if (requestedProviderId === "openai") {
    if (hasOpenAIKey) {
      return {
        ok: true,
        provider: PROVIDER_REGISTRY.openai,
        reason: "requested-provider",
        hasOpenAIKey,
        mockModeEnabled,
      };
    }
    if (mockModeEnabled) {
      return {
        ok: true,
        provider: PROVIDER_REGISTRY.mock,
        reason: "fallback-mock-no-openai-key",
        hasOpenAIKey,
        mockModeEnabled,
      };
    }
    return {
      ok: false,
      code: "provider-unavailable",
      message: "OpenAI provider is requested but OPENAI_API_KEY is not configured.",
      hasOpenAIKey,
      mockModeEnabled,
    };
  }

  if (mockModeEnabled) {
    return {
      ok: true,
      provider: PROVIDER_REGISTRY.mock,
      reason: "mock-mode-enabled",
      hasOpenAIKey,
      mockModeEnabled,
    };
  }

  if (hasOpenAIKey) {
    return {
      ok: true,
      provider: PROVIDER_REGISTRY.openai,
      reason: "default-openai",
      hasOpenAIKey,
      mockModeEnabled,
    };
  }

  return {
    ok: false,
    code: "provider-unavailable",
    message:
      "No AI provider is available. Configure OPENAI_API_KEY or set AI_MOCK_MODE=true.",
    hasOpenAIKey,
    mockModeEnabled,
  };
};

const normalizePrompt = (value: string): string => value.replace(/\r\n?/g, "\n").trim();

const normalizeModel = (value: string | undefined, fallback: string): string => {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
};

const normalizeTemperature = (value: number | undefined): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0.2;
  return Math.min(2, Math.max(0, value));
};

const normalizeMaxTokens = (value: number | undefined): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) return 700;
  const integer = Math.floor(value);
  if (integer < 32) return 32;
  return Math.min(4096, integer);
};

const readErrorMessage = (body: unknown, fallback: string): string => {
  if (!isRecord(body) || !isRecord(body.error) || typeof body.error.message !== "string") {
    return fallback;
  }
  const trimmed = body.error.message.trim();
  return trimmed.length > 0 ? trimmed : fallback;
};

const extractOpenAIText = (body: unknown): string => {
  if (!isRecord(body)) return "";
  if (!Array.isArray(body.choices) || body.choices.length === 0) return "";
  const first = body.choices[0];
  if (!isRecord(first) || !isRecord(first.message)) return "";
  const content = first.message.content;
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === "string") return item;
        if (isRecord(item) && typeof item.text === "string") return item.text;
        return "";
      })
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
      .join("\n");
  }
  return "";
};

const callMockProvider = async (
  input: AIProviderCallInput
): Promise<AIProviderCallOutput> => {
  const prompt = normalizePrompt(input.prompt);
  const preview = prompt.slice(0, 220);
  const suffix = prompt.length > preview.length ? "..." : "";

  return {
    ok: true,
    providerId: "mock",
    model: normalizeModel(input.model, DEFAULT_MOCK_MODEL),
    text: `[MOCK 응답] ${preview || "질문이 비어 있습니다."}${suffix}`,
    mocked: true,
    usage: {},
  };
};

const callOpenAIProvider = async (
  input: AIProviderCallInput,
  apiKey: string
): Promise<AIProviderCallResult> => {
  const prompt = normalizePrompt(input.prompt);
  if (prompt.length === 0) {
    return {
      ok: false,
      code: "invalid-input",
      message: "Prompt must be non-empty.",
    };
  }

  const messages: Array<{ role: "system" | "user"; content: string }> = [];
  const systemPrompt = toNormalizedString(input.systemPrompt);
  if (systemPrompt.length > 0) {
    messages.push({ role: "system", content: systemPrompt });
  }
  messages.push({ role: "user", content: prompt });

  try {
    const response = await fetch(OPENAI_ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: normalizeModel(input.model, DEFAULT_OPENAI_MODEL),
        messages,
        temperature: normalizeTemperature(input.temperature),
        max_tokens: normalizeMaxTokens(input.maxTokens),
      }),
    });

    const body = (await response.json().catch(() => null)) as unknown;
    if (!response.ok) {
      return {
        ok: false,
        code: "provider-failed",
        message: readErrorMessage(
          body,
          `OpenAI request failed (status ${response.status}).`
        ),
      };
    }

    const text = extractOpenAIText(body);
    if (text.length === 0) {
      return {
        ok: false,
        code: "provider-failed",
        message: "OpenAI response did not include usable text output.",
      };
    }

    const usage = isRecord(body) && isRecord(body.usage) ? body.usage : {};
    return {
      ok: true,
      providerId: "openai",
      model: normalizeModel(input.model, DEFAULT_OPENAI_MODEL),
      text,
      mocked: false,
      usage: {
        ...(typeof usage.prompt_tokens === "number"
          ? { inputTokens: usage.prompt_tokens }
          : {}),
        ...(typeof usage.completion_tokens === "number"
          ? { outputTokens: usage.completion_tokens }
          : {}),
        ...(typeof usage.total_tokens === "number"
          ? { totalTokens: usage.total_tokens }
          : {}),
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown provider error.";
    return {
      ok: false,
      code: "provider-failed",
      message,
    };
  }
};

export const callAIProvider = async (
  input: AIProviderCallInput
): Promise<AIProviderCallResult> => {
  const prompt = normalizePrompt(input.prompt);
  if (prompt.length === 0) {
    return {
      ok: false,
      code: "invalid-input",
      message: "Prompt must be non-empty.",
    };
  }

  const openAIApiKey = process.env.OPENAI_API_KEY;
  const resolution = resolveAIProvider({
    requestedProviderId: input.providerId,
    openAIApiKey,
    aiMockMode: input.mockMode === true ? "true" : process.env.AI_MOCK_MODE,
  });

  if (!resolution.ok) {
    return {
      ok: false,
      code: "provider-not-configured",
      message: resolution.message,
    };
  }

  if (resolution.provider.id === "mock") {
    return callMockProvider(input);
  }

  if (!hasOpenAIApiKey(openAIApiKey)) {
    return {
      ok: false,
      code: "provider-not-configured",
      message: "OPENAI_API_KEY is not configured.",
    };
  }

  return callOpenAIProvider(input, openAIApiKey as string);
};
