import type { ProposalType, SessionPolicy } from "@core/types/sessionPolicy";

export type QuestionState =
  | "awaiting_teacher_approval"
  | "approved_sending_to_llm"
  | "awaiting_teacher_review"
  | "forwarded_to_student"
  | "rejected";

export type QuestionQueueEntry = {
  id: string;
  actorId: string;
  question: string;
  modifiedQuestion?: string;
  llmResponse?: string;
  modifiedResponse?: string;
  state: QuestionState;
  createdAt: number;
  updatedAt: number;
  op_id: string;
  base_version: number;
};

export type PromptProfile = {
  global?: string;
  template?: string;
  session?: string;
  teacher_override?: string;
};

export const REASK_PRESET_IDS = ["shorter", "simpler", "example", "retry"] as const;

export type ReAskPresetId = (typeof REASK_PRESET_IDS)[number];

export type ReAskPreset = {
  id: ReAskPresetId;
  label: string;
  prompt: string;
};

export const DEFAULT_REASK_PRESETS: ReAskPreset[] = [
  {
    id: "shorter",
    label: "더 짧게",
    prompt: "Please provide a shorter explanation.",
  },
  {
    id: "simpler",
    label: "더 쉽게",
    prompt: "Explain more simply for students.",
  },
  {
    id: "example",
    label: "예시 추가",
    prompt: "Include a concrete example.",
  },
  {
    id: "retry",
    label: "다시 시도",
    prompt: "",
  },
];

export type JsonSafePrimitive = string | number | boolean | null;
export type JsonSafeValue =
  | JsonSafePrimitive
  | JsonSafeValue[]
  | { [key: string]: JsonSafeValue };

export const AI_PROVIDER_IDS = ["openai", "mock"] as const;
export type AIProviderId = (typeof AI_PROVIDER_IDS)[number];

export const LLM_CALL_ERROR_CODES = [
  "invalid-request",
  "unsupported-provider",
  "provider-unavailable",
  "openai-http-error",
  "openai-invalid-response",
  "network-error",
  "client-http-error",
  "client-invalid-response",
  "internal-error",
] as const;

export type LLMCallErrorCode = (typeof LLM_CALL_ERROR_CODES)[number];

export type LLMCallRequest = {
  prompt: string;
  providerId?: AIProviderId;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  promptProfile?: PromptProfile;
  metadata?: Record<string, JsonSafeValue>;
};

export type LLMCallSuccessResponse = {
  ok: true;
  providerId: AIProviderId;
  model: string;
  outputText: string;
  requestId: string;
  mocked: boolean;
};

export type LLMCallErrorResponse = {
  ok: false;
  code: LLMCallErrorCode;
  message: string;
  retryable: boolean;
  providerId?: AIProviderId;
  requestId?: string;
  status?: number;
};

export type LLMCallResponse = LLMCallSuccessResponse | LLMCallErrorResponse;

export type SessionAIPolicyConfig = {
  llmProviderId?: AIProviderId;
  llmModel?: string;
  autoPassByType?: Partial<Record<ProposalType, boolean>>;
  promptProfile?: PromptProfile;
};

type SessionPolicyWithAIExtras = SessionPolicy & {
  llmModel?: string;
  autoPassByType?: Partial<Record<ProposalType, boolean>>;
  aiConfig?: SessionAIPolicyConfig;
};

const MAX_JSON_SAFE_DEPTH = 12;

const PROMPT_PROFILE_KEYS = [
  "global",
  "template",
  "session",
  "teacher_override",
] as const;

const LLM_CALL_ERROR_CODE_SET = new Set<string>(LLM_CALL_ERROR_CODES);
const AI_PROVIDER_ID_SET = new Set<string>(AI_PROVIDER_IDS);
const PROMPT_PROFILE_KEY_SET = new Set<string>(PROMPT_PROFILE_KEYS);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const normalizeOptionalText = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isPositiveInteger = (value: unknown): value is number =>
  isFiniteNumber(value) && Number.isInteger(value) && value > 0;

const isJsonSafeValueInternal = (value: unknown, depth: number): boolean => {
  if (value === null) return true;

  if (typeof value === "string" || typeof value === "boolean") {
    return true;
  }
  if (typeof value === "number") {
    return Number.isFinite(value);
  }

  if (depth >= MAX_JSON_SAFE_DEPTH) return false;

  if (Array.isArray(value)) {
    return value.every((item) => isJsonSafeValueInternal(item, depth + 1));
  }

  if (isRecord(value)) {
    return Object.values(value).every((item) =>
      isJsonSafeValueInternal(item, depth + 1)
    );
  }

  return false;
};

export const isJsonSafeValue = (value: unknown): value is JsonSafeValue =>
  isJsonSafeValueInternal(value, 0);

export const isAIProviderId = (value: unknown): value is AIProviderId =>
  typeof value === "string" && AI_PROVIDER_ID_SET.has(value);

export const isPromptProfile = (value: unknown): value is PromptProfile => {
  if (!isRecord(value)) return false;

  for (const [key, profileValue] of Object.entries(value)) {
    if (!PROMPT_PROFILE_KEY_SET.has(key)) return false;
    if (profileValue !== undefined && typeof profileValue !== "string") return false;
  }

  return true;
};

const toPromptProfile = (value: unknown): PromptProfile | undefined => {
  if (!isRecord(value)) return undefined;
  const global = normalizeOptionalText(value.global);
  const template = normalizeOptionalText(value.template);
  const session = normalizeOptionalText(value.session);
  const teacherOverride = normalizeOptionalText(value.teacher_override);
  if (!global && !template && !session && !teacherOverride) return undefined;
  return {
    ...(global ? { global } : {}),
    ...(template ? { template } : {}),
    ...(session ? { session } : {}),
    ...(teacherOverride ? { teacher_override: teacherOverride } : {}),
  };
};

const normalizeAutoPassByType = (
  value: unknown,
  fallbackAIQuestion?: boolean
): Partial<Record<ProposalType, boolean>> | undefined => {
  const next: Partial<Record<ProposalType, boolean>> = {};
  if (isRecord(value)) {
    if (typeof value.canvas_mutation === "boolean") {
      next.canvas_mutation = value.canvas_mutation;
    }
    if (typeof value.step_navigation === "boolean") {
      next.step_navigation = value.step_navigation;
    }
    if (typeof value.viewport_sync === "boolean") {
      next.viewport_sync = value.viewport_sync;
    }
    if (typeof value.ai_question === "boolean") {
      next.ai_question = value.ai_question;
    }
  }
  if (typeof fallbackAIQuestion === "boolean") {
    next.ai_question = fallbackAIQuestion;
  }
  return Object.keys(next).length > 0 ? next : undefined;
};

export const readSessionAIConfig = (
  policy: SessionPolicy | null | undefined
): SessionAIPolicyConfig | null => {
  if (!policy) return null;
  const policyWithExtras = policy as SessionPolicyWithAIExtras;
  const nestedConfig = isRecord(policyWithExtras.aiConfig)
    ? policyWithExtras.aiConfig
    : null;

  const llmProviderIdCandidate =
    nestedConfig?.llmProviderId ?? policy.llmProviderId;
  const llmProviderId = isAIProviderId(llmProviderIdCandidate)
    ? llmProviderIdCandidate
    : undefined;
  const llmModel = normalizeOptionalText(
    nestedConfig?.llmModel ?? policyWithExtras.llmModel
  );
  const autoPassByType = normalizeAutoPassByType(
    nestedConfig?.autoPassByType ?? policyWithExtras.autoPassByType,
    policy.autoPassLowRiskQuestions
  );
  const promptProfile =
    toPromptProfile(nestedConfig?.promptProfile) ?? toPromptProfile(policy.promptProfile);

  if (!llmProviderId && !llmModel && !autoPassByType && !promptProfile) {
    return null;
  }

  return {
    ...(llmProviderId ? { llmProviderId } : {}),
    ...(llmModel ? { llmModel } : {}),
    ...(autoPassByType ? { autoPassByType } : {}),
    ...(promptProfile ? { promptProfile } : {}),
  };
};

export const isLLMCallRequest = (value: unknown): value is LLMCallRequest => {
  if (!isRecord(value)) return false;
  if (!isNonEmptyString(value.prompt)) return false;

  if (value.providerId !== undefined && !isAIProviderId(value.providerId)) {
    return false;
  }

  if (value.model !== undefined && !isNonEmptyString(value.model)) {
    return false;
  }

  if (value.temperature !== undefined && !isFiniteNumber(value.temperature)) {
    return false;
  }

  if (value.maxTokens !== undefined && !isPositiveInteger(value.maxTokens)) {
    return false;
  }

  if (value.promptProfile !== undefined && !isPromptProfile(value.promptProfile)) {
    return false;
  }

  if (value.metadata !== undefined) {
    if (!isRecord(value.metadata)) return false;
    const metaValues = Object.values(value.metadata);
    if (!metaValues.every((metaValue) => isJsonSafeValue(metaValue))) {
      return false;
    }
  }

  return true;
};

export const isLLMCallResponse = (value: unknown): value is LLMCallResponse => {
  if (!isRecord(value) || typeof value.ok !== "boolean") return false;

  if (value.ok) {
    return (
      isAIProviderId(value.providerId) &&
      isNonEmptyString(value.model) &&
      isNonEmptyString(value.outputText) &&
      isNonEmptyString(value.requestId) &&
      typeof value.mocked === "boolean"
    );
  }

  if (
    typeof value.code !== "string" ||
    !LLM_CALL_ERROR_CODE_SET.has(value.code) ||
    typeof value.message !== "string" ||
    typeof value.retryable !== "boolean"
  ) {
    return false;
  }

  if (value.providerId !== undefined && !isAIProviderId(value.providerId)) {
    return false;
  }
  if (value.requestId !== undefined && typeof value.requestId !== "string") {
    return false;
  }
  if (value.status !== undefined && !isFiniteNumber(value.status)) {
    return false;
  }

  return true;
};
