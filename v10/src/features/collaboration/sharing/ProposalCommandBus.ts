import type {
  ProposalDecision,
  ProposalEnvelopePayload,
  ProposalResultEnvelopePayload,
  ProposalType,
} from "@core/foundation/types/sessionPolicy";

import type {
  BroadcastEnvelope,
  LiveBroadcastTransport,
} from "./transport/LiveBroadcastTransport";

export type CreateProposalCommandInput = {
  shareId: string;
  actorId: string;
  proposalType: ProposalType;
  payload: unknown;
  proposalId?: string;
  baseVersion?: number;
  timestamp?: number;
};

export type CreateProposalResultCommandInput = {
  shareId: string;
  actorId: string;
  proposalId: string;
  decision: ProposalDecision;
  reason?: string;
  targetActorId?: string;
  baseVersion?: number;
  timestamp?: number;
};

const normalizeNonEmptyString = (
  value: string | null | undefined,
  fallback: string
): string => {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
};

const normalizeTimestamp = (value: number | undefined): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) return Date.now();
  return Math.max(0, Math.floor(value));
};

const normalizeBaseVersion = (value: number | undefined): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.floor(value));
};

const createRandomId = (prefix: string): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const toProposalPayload = (
  input: CreateProposalCommandInput,
  shared: {
    opId: string;
    proposalId: string;
    baseVersion: number;
    timestamp: number;
  }
): ProposalEnvelopePayload => ({
  type: "proposal",
  proposalId: shared.proposalId,
  proposalType: input.proposalType,
  actorId: input.actorId,
  payload: input.payload,
  op_id: shared.opId,
  base_version: shared.baseVersion,
  timestamp: shared.timestamp,
});

const toProposalResultPayload = (
  input: CreateProposalResultCommandInput,
  proposalId: string
): ProposalResultEnvelopePayload => ({
  type: "proposal_result",
  proposalId,
  decision: input.decision,
  ...(typeof input.reason === "string" && input.reason.trim().length > 0
    ? { reason: input.reason.trim() }
    : {}),
  ...(typeof input.targetActorId === "string" && input.targetActorId.trim().length > 0
    ? { actorId: input.targetActorId.trim() }
    : {}),
});

export const createProposalEnvelope = (
  input: CreateProposalCommandInput
): BroadcastEnvelope => {
  const timestamp = normalizeTimestamp(input.timestamp);
  const opId = createRandomId("proposal-op");
  const proposalId = normalizeNonEmptyString(input.proposalId, createRandomId("proposal"));
  const baseVersion = normalizeBaseVersion(input.baseVersion);

  return {
    op_id: opId,
    actor_id: normalizeNonEmptyString(input.actorId, "viewer"),
    canvas_id: normalizeNonEmptyString(input.shareId, "unknown"),
    base_version: baseVersion,
    timestamp,
    payload: toProposalPayload(input, {
      opId,
      proposalId,
      baseVersion,
      timestamp,
    }),
  };
};

export const createProposalResultEnvelope = (
  input: CreateProposalResultCommandInput
): BroadcastEnvelope => {
  const timestamp = normalizeTimestamp(input.timestamp);
  const opId = createRandomId("proposal-result-op");
  const proposalId = normalizeNonEmptyString(input.proposalId, createRandomId("proposal"));

  return {
    op_id: opId,
    actor_id: normalizeNonEmptyString(input.actorId, "host"),
    canvas_id: normalizeNonEmptyString(input.shareId, "unknown"),
    base_version: normalizeBaseVersion(input.baseVersion),
    timestamp,
    payload: toProposalResultPayload(input, proposalId),
  };
};

export const publishProposal = (
  transport: LiveBroadcastTransport,
  input: CreateProposalCommandInput
): string | null => {
  const envelope = createProposalEnvelope(input);
  const published = transport.publish(envelope);
  if (!published || envelope.payload.type !== "proposal") return null;
  return envelope.payload.proposalId;
};

export const publishProposalResult = (
  transport: LiveBroadcastTransport,
  input: CreateProposalResultCommandInput
): boolean => {
  const envelope = createProposalResultEnvelope(input);
  return transport.publish(envelope);
};

export const isProposalPayload = (
  payload: BroadcastEnvelope["payload"]
): payload is ProposalEnvelopePayload => {
  return payload.type === "proposal";
};

export const isProposalResultPayload = (
  payload: BroadcastEnvelope["payload"]
): payload is ProposalResultEnvelopePayload => {
  return payload.type === "proposal_result";
};
