import { NextResponse } from "next/server";

import {
  executeLLMCallOnServer,
  type LLMCallInput,
} from "@features/sharing/ai/LLMCallService";
import {
  THEME_JSON_SCHEMA_MARKER,
  validateThemeJson,
} from "@features/mod-studio/theme/themeJsonIO";

export const dynamic = "force-dynamic";

const THEME_TOKEN_KEYS = [
  "surface",
  "surface-soft",
  "surface-overlay",
  "text",
  "text-muted",
  "text-subtle",
  "border",
  "border-strong",
  "accent",
  "accent-soft",
  "accent-strong",
  "accent-text",
  "success",
  "success-soft",
  "warning",
  "warning-soft",
  "danger",
  "danger-soft",
] as const;

type ThemeTokenKey = (typeof THEME_TOKEN_KEYS)[number];
type ThemeTokenRecord = Record<ThemeTokenKey, string>;

type ThemeGenerationRequest = {
  description: string;
  providerId?: string;
};

const DEFAULT_THEME_LABEL = "AI Generated Theme";
const MAX_DESCRIPTION_LENGTH = 1500;
const RGBA_PATTERN =
  /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(0(?:\.\d+)?|1(?:\.0+)?)\s*\)$/i;

const MOCK_THEME_TOKENS: ThemeTokenRecord = {
  surface: "rgba(36, 29, 23, 0.95)",
  "surface-soft": "rgba(54, 43, 33, 0.9)",
  "surface-overlay": "rgba(24, 20, 16, 0.82)",
  text: "rgba(242, 224, 197, 0.98)",
  "text-muted": "rgba(214, 189, 158, 0.86)",
  "text-subtle": "rgba(184, 155, 121, 0.76)",
  border: "rgba(147, 113, 74, 0.48)",
  "border-strong": "rgba(181, 138, 88, 0.74)",
  accent: "rgba(214, 151, 63, 1)",
  "accent-soft": "rgba(214, 151, 63, 0.3)",
  "accent-strong": "rgba(236, 173, 79, 1)",
  "accent-text": "rgba(31, 21, 12, 0.95)",
  success: "rgba(124, 182, 118, 1)",
  "success-soft": "rgba(124, 182, 118, 0.28)",
  warning: "rgba(237, 181, 88, 1)",
  "warning-soft": "rgba(237, 181, 88, 0.3)",
  danger: "rgba(226, 112, 97, 1)",
  "danger-soft": "rgba(226, 112, 97, 0.26)",
};

const THEME_SYSTEM_PROMPT = [
  "You are a theme color designer for a math education whiteboard app.",
  "Given a mood/style description, output EXACTLY 18 CSS color tokens as JSON.",
  "All values must be valid CSS rgba() strings.",
  `Token keys: ${THEME_TOKEN_KEYS.join(", ")}.`,
  "Ensure sufficient contrast (WCAG AA) between text and surface.",
  "Output ONLY valid JSON, no markdown, no explanation.",
].join("\n");

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const toApiError = (
  status: number,
  code: string,
  message: string
): NextResponse => {
  return NextResponse.json(
    {
      ok: false,
      code,
      message,
    },
    { status }
  );
};

const normalizeDescription = (value: unknown): string => {
  if (typeof value !== "string") return "";
  return value.replace(/\r\n?/g, "\n").trim();
};

const normalizeProviderId = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
};

const toThemeGenerationRequest = (
  value: unknown
): ThemeGenerationRequest | null => {
  if (!isRecord(value)) return null;
  return {
    description: normalizeDescription(value.description),
    providerId: normalizeProviderId(value.providerId),
  };
};

const parseJsonText = (value: string): { ok: true; value: unknown } | { ok: false } => {
  try {
    return { ok: true, value: JSON.parse(value) as unknown };
  } catch {
    return { ok: false };
  }
};

const parseStructuredJsonPayload = (rawText: string): unknown | null => {
  const trimmed = rawText.trim();
  if (trimmed.length === 0) return null;

  const direct = parseJsonText(trimmed);
  if (direct.ok) return direct.value;

  const fencedMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (!fencedMatch) return null;
  const fencedParsed = parseJsonText(fencedMatch[1]);
  return fencedParsed.ok ? fencedParsed.value : null;
};

const isMockModeEnabled = (): boolean => {
  const raw = process.env.AI_MOCK_MODE;
  if (typeof raw !== "string") return false;
  const normalized = raw.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
};

const isValidRgbaToken = (value: string): boolean => {
  const match = value.trim().match(RGBA_PATTERN);
  if (!match) return false;

  const red = Number.parseInt(match[1], 10);
  const green = Number.parseInt(match[2], 10);
  const blue = Number.parseInt(match[3], 10);
  const alpha = Number.parseFloat(match[4]);

  if (
    !Number.isInteger(red) ||
    !Number.isInteger(green) ||
    !Number.isInteger(blue) ||
    !Number.isFinite(alpha)
  ) {
    return false;
  }

  return (
    red >= 0 &&
    red <= 255 &&
    green >= 0 &&
    green <= 255 &&
    blue >= 0 &&
    blue <= 255 &&
    alpha >= 0 &&
    alpha <= 1
  );
};

const toThemeTokenRecord = (value: Record<string, string>): ThemeTokenRecord | null => {
  const result = {} as ThemeTokenRecord;

  for (const tokenKey of THEME_TOKEN_KEYS) {
    const tokenValue = value[tokenKey];
    if (typeof tokenValue !== "string") return null;
    const normalizedValue = tokenValue.trim();
    if (normalizedValue.length === 0 || !isValidRgbaToken(normalizedValue)) return null;
    result[tokenKey] = normalizedValue;
  }

  return result;
};

const validateGeneratedTokens = (
  generatedTokens: unknown,
  description: string
): ThemeTokenRecord | null => {
  const validated = validateThemeJson({
    syMathSlateTheme: THEME_JSON_SCHEMA_MARKER,
    label: DEFAULT_THEME_LABEL,
    description,
    globalTokens: generatedTokens,
    moduleScopedTokens: {},
  });

  if (!validated.ok) return null;
  return toThemeTokenRecord(validated.value.globalTokens);
};

const buildMockThemeTokens = (): ThemeTokenRecord => ({ ...MOCK_THEME_TOKENS });

const toSuccessResponse = (input: {
  providerId: string;
  model: string;
  mocked: boolean;
  tokens: ThemeTokenRecord;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
}): NextResponse => {
  return NextResponse.json({
    ok: true,
    providerId: input.providerId,
    model: input.model,
    mocked: input.mocked,
    tokens: input.tokens,
    usage: input.usage ?? {},
  });
};

const toLLMInput = (request: ThemeGenerationRequest): LLMCallInput => ({
  providerId: request.providerId,
  prompt: request.description,
  promptProfile: {
    global: THEME_SYSTEM_PROMPT,
  },
  temperature: 0.2,
  maxTokens: 900,
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = (await request.json()) as unknown;
  } catch {
    return toApiError(400, "invalid-json", "Request body must be valid JSON.");
  }

  const input = toThemeGenerationRequest(body);
  if (!input) {
    return toApiError(400, "invalid-body", "Request body must be an object.");
  }
  if (input.description.length === 0) {
    return toApiError(
      400,
      "invalid-request",
      "description must be a non-empty string."
    );
  }
  if (input.description.length > MAX_DESCRIPTION_LENGTH) {
    return toApiError(
      400,
      "invalid-request",
      `description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer.`
    );
  }

  if (isMockModeEnabled()) {
    return toSuccessResponse({
      providerId: "mock",
      model: "mock-theme-v1",
      mocked: true,
      tokens: buildMockThemeTokens(),
      usage: {},
    });
  }

  const llmResult = await executeLLMCallOnServer(toLLMInput(input));
  if (!llmResult.ok) {
    const status =
      llmResult.code === "invalid-request"
        ? 400
        : llmResult.code === "provider-not-configured"
          ? 503
          : 502;
    return toApiError(status, llmResult.code, llmResult.message);
  }

  if (llmResult.mocked) {
    return toSuccessResponse({
      providerId: llmResult.providerId,
      model: llmResult.model,
      mocked: true,
      tokens: buildMockThemeTokens(),
      usage: llmResult.usage,
    });
  }

  const parsedJson = parseStructuredJsonPayload(llmResult.text);
  if (parsedJson === null) {
    return toApiError(
      502,
      "invalid-structured-output",
      "AI response was not valid JSON."
    );
  }

  const validatedTokens = validateGeneratedTokens(parsedJson, input.description);
  if (!validatedTokens) {
    return toApiError(
      422,
      "invalid-theme-tokens",
      "AI response did not provide a valid 18-token rgba theme set."
    );
  }

  return toSuccessResponse({
    providerId: llmResult.providerId,
    model: llmResult.model,
    mocked: llmResult.mocked,
    tokens: validatedTokens,
    usage: llmResult.usage,
  });
}
