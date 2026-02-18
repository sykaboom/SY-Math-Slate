export const PROPOSAL_TYPES = [
  "canvas_mutation",
  "step_navigation",
  "viewport_sync",
  "ai_question",
] as const;

export type ProposalType = (typeof PROPOSAL_TYPES)[number];

export const APPROVAL_MODES = ["auto", "host_required", "denied"] as const;

export type ApprovalMode = (typeof APPROVAL_MODES)[number];

export type ProposalDecision = "approved" | "rejected";

export type SessionPolicyPromptProfile = {
  global?: string;
  template?: string;
  session?: string;
  teacher_override?: string;
};

export type SessionPolicy = {
  templateId: string;
  label: string;
  proposalRules: Record<ProposalType, ApprovalMode>;
  maxParticipants: number;
  allowAnonymous: boolean;
  llmProviderId?: string;
  autoPassLowRiskQuestions?: boolean;
  promptProfile?: SessionPolicyPromptProfile;
};

export type ProposalEnvelopePayload = {
  type: "proposal";
  proposalId: string;
  proposalType: ProposalType;
  actorId: string;
  payload: unknown;
  op_id: string;
  base_version: number;
  timestamp: number;
};

export type ProposalResultEnvelopePayload = {
  type: "proposal_result";
  proposalId: string;
  decision: ProposalDecision;
  reason?: string;
  actorId?: string;
};

export const isProposalType = (value: unknown): value is ProposalType => {
  return typeof value === "string" && PROPOSAL_TYPES.includes(value as ProposalType);
};

export const isApprovalMode = (value: unknown): value is ApprovalMode => {
  return typeof value === "string" && APPROVAL_MODES.includes(value as ApprovalMode);
};

export const isProposalDecision = (value: unknown): value is ProposalDecision => {
  return value === "approved" || value === "rejected";
};
