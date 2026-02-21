import { NextResponse } from "next/server";

import {
  executeLLMCallOnServer,
  type LLMCallInput,
} from "@features/collaboration/sharing/ai/LLMCallService";

export const dynamic = "force-dynamic";

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

const toLLMCallInput = (value: unknown): LLMCallInput | null => {
  if (!isRecord(value)) return null;
  return {
    providerId: typeof value.providerId === "string" ? value.providerId : undefined,
    model: typeof value.model === "string" ? value.model : undefined,
    prompt: typeof value.prompt === "string" ? value.prompt : "",
    promptProfile: isRecord(value.promptProfile)
      ? (value.promptProfile as LLMCallInput["promptProfile"])
      : undefined,
    temperature:
      typeof value.temperature === "number" ? value.temperature : undefined,
    maxTokens: typeof value.maxTokens === "number" ? value.maxTokens : undefined,
  };
};

const isMockModeEnabled = (): boolean => {
  const raw = process.env.AI_MOCK_MODE;
  if (typeof raw !== "string") return false;
  const normalized = raw.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
};

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = (await request.json()) as unknown;
  } catch {
    return toApiError(400, "invalid-json", "Request body must be valid JSON.");
  }

  const input = toLLMCallInput(body);
  if (!input) {
    return toApiError(400, "invalid-body", "Request body must be an object.");
  }

  const result = await executeLLMCallOnServer(input, {
    mockMode: isMockModeEnabled(),
  });

  if (!result.ok) {
    const status =
      result.code === "invalid-request"
        ? 400
        : result.code === "provider-not-configured"
          ? 503
          : 502;
    return toApiError(status, result.code, result.message);
  }

  return NextResponse.json(result);
}
