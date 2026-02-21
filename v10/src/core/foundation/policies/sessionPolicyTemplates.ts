import { isAIProviderId, type AIProviderId } from "@core/foundation/types/aiApproval";
import type {
  ApprovalMode,
  ProposalType,
  SessionPolicy,
  SessionPolicyPromptProfile,
} from "@core/foundation/types/sessionPolicy";

type SessionPolicyWithExtras = SessionPolicy & {
  autoPassByType?: Partial<Record<ProposalType, boolean>>;
  llmModel?: string;
};

const clampParticipants = (value: number): number => {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.floor(value));
};

const DEFAULT_LLM_PROVIDER_ID: AIProviderId = "mock";
const TUTOR_MODERATED_LLM_PROVIDER_ID: AIProviderId = "openai";
const TUTOR_MODERATED_MODEL = "gpt-4o-mini";

const normalizeOptionalText = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const normalizeProviderId = (
  value: unknown,
  fallback: AIProviderId
): AIProviderId => {
  if (isAIProviderId(value)) return value;
  return fallback;
};

const clonePromptProfile = (
  promptProfile: SessionPolicyPromptProfile | undefined
): SessionPolicyPromptProfile | undefined => {
  if (!promptProfile) return undefined;
  const global = normalizeOptionalText(promptProfile.global);
  const template = normalizeOptionalText(promptProfile.template);
  const session = normalizeOptionalText(promptProfile.session);
  const teacherOverride = normalizeOptionalText(promptProfile.teacher_override);
  const hasAnyField =
    global || template || session || teacherOverride ? true : false;
  if (!hasAnyField) return undefined;
  return {
    ...(global ? { global } : {}),
    ...(template ? { template } : {}),
    ...(session ? { session } : {}),
    ...(teacherOverride ? { teacher_override: teacherOverride } : {}),
  };
};

const cloneRules = (
  rules: Record<ProposalType, ApprovalMode>
): Record<ProposalType, ApprovalMode> => ({
  canvas_mutation: rules.canvas_mutation,
  step_navigation: rules.step_navigation,
  viewport_sync: rules.viewport_sync,
  ai_question: rules.ai_question,
});

const cloneAutoPassByType = (
  map: unknown,
  fallbackAIQuestion?: boolean
): Partial<Record<ProposalType, boolean>> | undefined => {
  const next: Partial<Record<ProposalType, boolean>> = {};
  if (map && typeof map === "object" && !Array.isArray(map)) {
    (
      ["canvas_mutation", "step_navigation", "viewport_sync", "ai_question"] as const
    ).forEach((proposalType) => {
      const value = (map as Record<string, unknown>)[proposalType];
      if (typeof value === "boolean") {
        next[proposalType] = value;
      }
    });
  }
  if (typeof fallbackAIQuestion === "boolean") {
    next.ai_question = fallbackAIQuestion;
  }
  return Object.keys(next).length > 0 ? next : undefined;
};

export const cloneSessionPolicy = (policy: SessionPolicy): SessionPolicy => {
  const policyWithExtras = policy as SessionPolicyWithExtras;
  const llmProviderId = normalizeProviderId(
    policy.llmProviderId,
    DEFAULT_LLM_PROVIDER_ID
  );
  const llmModel = normalizeOptionalText(policyWithExtras.llmModel);
  const promptProfile = clonePromptProfile(policy.promptProfile);
  const autoPassByType = cloneAutoPassByType(
    policyWithExtras.autoPassByType,
    policy.autoPassLowRiskQuestions
  );

  return {
    templateId: policy.templateId,
    label: policy.label,
    proposalRules: cloneRules(policy.proposalRules),
    maxParticipants: clampParticipants(policy.maxParticipants),
    allowAnonymous: policy.allowAnonymous === true,
    llmProviderId,
    autoPassLowRiskQuestions: autoPassByType?.ai_question === true,
    ...(promptProfile ? { promptProfile } : {}),
    ...(llmModel ? { llmModel } : {}),
    ...(autoPassByType ? { autoPassByType } : {}),
  } as SessionPolicy;
};

export const LECTURE_BROADCAST: SessionPolicy = {
  templateId: "lecture_broadcast",
  label: "Lecture Broadcast",
  proposalRules: {
    canvas_mutation: "denied",
    step_navigation: "denied",
    viewport_sync: "denied",
    ai_question: "denied",
  },
  maxParticipants: 200,
  allowAnonymous: true,
  llmProviderId: DEFAULT_LLM_PROVIDER_ID,
  autoPassLowRiskQuestions: false,
  autoPassByType: {
    ai_question: false,
  },
} as SessionPolicy;

export const WORKSHOP_COEDIT: SessionPolicy = {
  templateId: "workshop_coedit",
  label: "Workshop Co-edit",
  proposalRules: {
    canvas_mutation: "auto",
    step_navigation: "auto",
    viewport_sync: "auto",
    ai_question: "auto",
  },
  maxParticipants: 30,
  allowAnonymous: true,
  llmProviderId: DEFAULT_LLM_PROVIDER_ID,
  autoPassLowRiskQuestions: true,
  autoPassByType: {
    ai_question: true,
  },
} as SessionPolicy;

export const TUTOR_MODERATED_AI: SessionPolicy = {
  templateId: "tutor_moderated_ai",
  label: "Tutor Moderated AI",
  proposalRules: {
    canvas_mutation: "host_required",
    step_navigation: "denied",
    viewport_sync: "denied",
    ai_question: "host_required",
  },
  maxParticipants: 40,
  allowAnonymous: true,
  llmProviderId: TUTOR_MODERATED_LLM_PROVIDER_ID,
  llmModel: TUTOR_MODERATED_MODEL,
  autoPassLowRiskQuestions: false,
  autoPassByType: {
    ai_question: false,
  },
  promptProfile: {
    global: "You are a patient math tutor.",
    template:
      "Give concise explanations, keep notation accurate, and adapt language for students.",
  },
} as SessionPolicy;

export const SESSION_POLICY_TEMPLATES: SessionPolicy[] = [
  LECTURE_BROADCAST,
  WORKSHOP_COEDIT,
  TUTOR_MODERATED_AI,
].map((template) => cloneSessionPolicy(template));

export const resolveSessionPolicyTemplate = (templateId: string): SessionPolicy => {
  const template = SESSION_POLICY_TEMPLATES.find(
    (entry) => entry.templateId === templateId
  );
  if (!template) {
    return cloneSessionPolicy(LECTURE_BROADCAST);
  }
  return cloneSessionPolicy(template);
};
