import { create } from "zustand";

import {
  LECTURE_BROADCAST,
  SESSION_POLICY_TEMPLATES,
  cloneSessionPolicy,
  resolveSessionPolicyTemplate,
} from "@core/config/sessionPolicyTemplates";
import type {
  ApprovalMode,
  ProposalType,
  SessionPolicy,
  SessionPolicyPromptProfile,
} from "@core/types/sessionPolicy";

export type SessionPolicyPromptProfileField =
  keyof SessionPolicyPromptProfile;

type SessionPolicyStoreState = {
  activePolicy: SessionPolicy;
  templates: SessionPolicy[];
  setTemplate: (templateId: string) => void;
  setLabel: (label: string) => void;
  setProposalRule: (proposalType: ProposalType, mode: ApprovalMode) => void;
  setMaxParticipants: (value: number) => void;
  setAllowAnonymous: (value: boolean) => void;
  setLLMProviderId: (providerId: string) => void;
  setAutoPassByType: (proposalType: ProposalType, value: boolean) => void;
  setAutoPassLowRiskQuestions: (value: boolean) => void;
  setPromptProfileField: (
    field: SessionPolicyPromptProfileField,
    value: string
  ) => void;
  clearPromptProfile: () => void;
  replacePolicy: (policy: SessionPolicy) => void;
  resetPolicy: () => void;
};

const clampParticipants = (value: number): number => {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.floor(value));
};

const normalizeOptionalText = (value: string): string | undefined => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const hasPromptProfileFields = (value: SessionPolicyPromptProfile): boolean => {
  return (
    typeof value.global === "string" ||
    typeof value.template === "string" ||
    typeof value.session === "string" ||
    typeof value.teacher_override === "string"
  );
};

type SessionPolicyWithAutoPassMap = SessionPolicy & {
  autoPassByType?: Partial<Record<ProposalType, boolean>>;
};

const readAutoPassByType = (
  policy: SessionPolicy
): Partial<Record<ProposalType, boolean>> => {
  const policyWithMap = policy as SessionPolicyWithAutoPassMap;
  const map = policyWithMap.autoPassByType;
  const normalized: Partial<Record<ProposalType, boolean>> = {};
  if (map && typeof map === "object") {
    (Object.keys(map) as ProposalType[]).forEach((proposalType) => {
      if (typeof map[proposalType] === "boolean") {
        normalized[proposalType] = map[proposalType];
      }
    });
  }
  if (typeof policy.autoPassLowRiskQuestions === "boolean") {
    normalized.ai_question = policy.autoPassLowRiskQuestions;
  }
  return normalized;
};

const writeAutoPassByType = (
  policy: SessionPolicy,
  autoPassByType: Partial<Record<ProposalType, boolean>>
): SessionPolicy => {
  const next: SessionPolicyWithAutoPassMap = {
    ...(policy as SessionPolicyWithAutoPassMap),
    autoPassByType: { ...autoPassByType },
    autoPassLowRiskQuestions: autoPassByType.ai_question === true,
  };
  return next;
};

const clonePolicy = (policy: SessionPolicy): SessionPolicy =>
  cloneSessionPolicy({
    ...policy,
    maxParticipants: clampParticipants(policy.maxParticipants),
  });

export const useSessionPolicyStore = create<SessionPolicyStoreState>((set) => ({
  activePolicy: clonePolicy(LECTURE_BROADCAST),
  templates: SESSION_POLICY_TEMPLATES.map((template) => clonePolicy(template)),
  setTemplate: (templateId) =>
    set(() => ({
      activePolicy: resolveSessionPolicyTemplate(templateId),
    })),
  setLabel: (label) =>
    set((state) => ({
      activePolicy: {
        ...state.activePolicy,
        label: label.trim().length > 0 ? label : state.activePolicy.label,
      },
    })),
  setProposalRule: (proposalType, mode) =>
    set((state) => ({
      activePolicy: {
        ...state.activePolicy,
        proposalRules: {
          ...state.activePolicy.proposalRules,
          [proposalType]: mode,
        },
      },
    })),
  setMaxParticipants: (value) =>
    set((state) => ({
      activePolicy: {
        ...state.activePolicy,
        maxParticipants: clampParticipants(value),
      },
    })),
  setAllowAnonymous: (value) =>
    set((state) => ({
      activePolicy: {
        ...state.activePolicy,
        allowAnonymous: value === true,
      },
    })),
  setLLMProviderId: (providerId) =>
    set((state) => ({
      activePolicy: {
        ...state.activePolicy,
        llmProviderId: normalizeOptionalText(providerId),
      },
    })),
  setAutoPassByType: (proposalType, value) =>
    set((state) => {
      const nextAutoPassByType = {
        ...readAutoPassByType(state.activePolicy),
        [proposalType]: value === true,
      };
      return {
        activePolicy: writeAutoPassByType(state.activePolicy, nextAutoPassByType),
      };
    }),
  setAutoPassLowRiskQuestions: (value) =>
    set((state) => {
      const nextAutoPassByType = {
        ...readAutoPassByType(state.activePolicy),
        ai_question: value === true,
      };
      return {
        activePolicy: writeAutoPassByType(state.activePolicy, nextAutoPassByType),
      };
    }),
  setPromptProfileField: (field, value) =>
    set((state) => {
      const nextPromptProfile: SessionPolicyPromptProfile = {
        ...(state.activePolicy.promptProfile ?? {}),
      };
      const normalized = normalizeOptionalText(value);

      if (normalized) {
        nextPromptProfile[field] = normalized;
      } else {
        delete nextPromptProfile[field];
      }

      return {
        activePolicy: {
          ...state.activePolicy,
          promptProfile: hasPromptProfileFields(nextPromptProfile)
            ? nextPromptProfile
            : undefined,
        },
      };
    }),
  clearPromptProfile: () =>
    set((state) => ({
      activePolicy: {
        ...state.activePolicy,
        promptProfile: undefined,
      },
    })),
  replacePolicy: (policy) =>
    set(() => ({
      activePolicy: clonePolicy(policy),
    })),
  resetPolicy: () =>
    set(() => ({
      activePolicy: clonePolicy(LECTURE_BROADCAST),
    })),
}));
