import { NextResponse } from "next/server";

import type { ModuleDraft } from "@features/platform/mod-studio/core/types";
import {
  executeLLMCallOnServer,
  type LLMCallInput,
} from "@features/collaboration/sharing/ai/LLMCallService";

export const dynamic = "force-dynamic";

type ModuleGenerationRequest = {
  description: string;
  providerId?: string;
};

const KNOWN_COMMAND_IDS = [
  "nextStep",
  "prevStep",
  "triggerPlay",
  "triggerStop",
  "toggleAutoPlay",
  "togglePause",
  "setViewMode",
] as const;
const KNOWN_UI_SLOT_NAMES = [
  "chrome-top-toolbar",
  "left-panel",
  "toolbar-inline",
  "toolbar-bottom",
] as const;

const MAX_DESCRIPTION_LENGTH = 1500;
const MODULE_ID_PATTERN = /^[a-z0-9]+(?:_[a-z0-9]+)*$/;

const isKnownUISlotName = (value: unknown): value is ModuleDraft["slot"] =>
  typeof value === "string" &&
  (KNOWN_UI_SLOT_NAMES as readonly string[]).includes(value);

const MOCK_MODULES: ModuleDraft[] = [
  {
    id: "ai_prev_step",
    label: "이전",
    slot: "toolbar-bottom",
    order: 10,
    enabled: true,
    action: {
      commandId: "prevStep",
      payload: {},
    },
  },
  {
    id: "ai_next_step",
    label: "다음",
    slot: "toolbar-bottom",
    order: 20,
    enabled: true,
    action: {
      commandId: "nextStep",
      payload: {},
    },
  },
];

const MODULE_SYSTEM_PROMPT = [
  "You are a UI module designer for a math education whiteboard app.",
  "Given a description, output an array of UI modules as JSON.",
  "Each module must have: id (snake_case), label (Korean or English), slot, order (integer), enabled (true), action.commandId, action.payload ({}).",
  "Valid slots: chrome-top-toolbar, left-panel, toolbar-inline, toolbar-bottom",
  `Known commandIds: ${KNOWN_COMMAND_IDS.join(", ")}`,
  "Ensure unique ids and non-overlapping order values.",
  "Output ONLY valid JSON array, no markdown, no explanation.",
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

const toModuleGenerationRequest = (value: unknown): ModuleGenerationRequest | null => {
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

const cloneModuleDraft = (module: ModuleDraft): ModuleDraft => ({
  id: module.id,
  label: module.label,
  slot: module.slot,
  enabled: Boolean(module.enabled),
  order: Number.isFinite(module.order) ? module.order : 0,
  icon: module.icon,
  action: {
    commandId: module.action.commandId,
    payload: { ...module.action.payload },
  },
});

const cloneModuleDrafts = (modules: ModuleDraft[]): ModuleDraft[] =>
  modules.map(cloneModuleDraft);

const toModuleDraftArray = (raw: unknown): ModuleDraft[] | null => {
  if (!Array.isArray(raw)) return null;

  const modules: ModuleDraft[] = [];
  const idSet = new Set<string>();
  const orderSet = new Set<number>();

  for (const item of raw) {
    if (!isRecord(item)) return null;

    const id = typeof item.id === "string" ? item.id.trim() : "";
    if (id.length === 0 || !MODULE_ID_PATTERN.test(id)) return null;
    if (idSet.has(id)) return null;

    if (!isKnownUISlotName(item.slot)) return null;

    const action = item.action;
    if (!isRecord(action)) return null;
    const commandId =
      typeof action.commandId === "string" ? action.commandId.trim() : "";
    if (commandId.length === 0) return null;

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
      slot: item.slot,
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

const toSuccessResponse = (input: {
  providerId: string;
  model: string;
  mocked: boolean;
  modules: ModuleDraft[];
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
    modules: cloneModuleDrafts(input.modules),
    usage: input.usage ?? {},
  });
};

const toLLMInput = (request: ModuleGenerationRequest): LLMCallInput => ({
  providerId: request.providerId,
  prompt: request.description,
  promptProfile: {
    global: MODULE_SYSTEM_PROMPT,
  },
  temperature: 0.2,
  maxTokens: 1200,
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = (await request.json()) as unknown;
  } catch {
    return toApiError(400, "invalid-json", "Request body must be valid JSON.");
  }

  const input = toModuleGenerationRequest(body);
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
      model: "mock-module-v1",
      mocked: true,
      modules: MOCK_MODULES,
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
      modules: MOCK_MODULES,
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

  const modules = toModuleDraftArray(parsedJson);
  if (!modules) {
    return toApiError(
      422,
      "invalid-module-array",
      "AI response did not provide a valid module array."
    );
  }

  return toSuccessResponse({
    providerId: llmResult.providerId,
    model: llmResult.model,
    mocked: llmResult.mocked,
    modules,
    usage: llmResult.usage,
  });
}
