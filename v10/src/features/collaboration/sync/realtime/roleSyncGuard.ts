import type { LocalRole } from "@features/platform/store/useLocalStore";

import type {
  SessionSyncEnvelope,
  SessionSyncStateUpdateEnvelope,
} from "./messageEnvelope";

export type RoleSyncCursor = {
  sourceId: string;
  seq: number;
};

export type StudentSyncGuardRejectReason =
  | "non-student-runtime"
  | "unsupported-envelope-kind"
  | "non-host-envelope"
  | "stale-or-duplicate-envelope";

type StudentSyncGuardAllow = {
  allow: true;
  envelope: SessionSyncStateUpdateEnvelope;
  nextCursor: RoleSyncCursor;
};

type StudentSyncGuardDeny = {
  allow: false;
  reason: StudentSyncGuardRejectReason;
};

export type StudentSyncGuardDecision = StudentSyncGuardAllow | StudentSyncGuardDeny;

type EvaluateStudentSyncEnvelopeInput = {
  localRole: LocalRole;
  trustedRoleClaim: LocalRole | null;
  envelope: SessionSyncEnvelope;
  lastAppliedCursor: RoleSyncCursor | null;
};

const resolveEffectiveRole = (
  trustedRoleClaim: LocalRole | null
): LocalRole => {
  if (trustedRoleClaim === "host") return "host";
  return "student";
};

const isMonotonicEnvelope = (
  envelope: SessionSyncStateUpdateEnvelope,
  lastAppliedCursor: RoleSyncCursor | null
): boolean => {
  if (!lastAppliedCursor) return true;
  if (lastAppliedCursor.sourceId !== envelope.sourceId) return true;
  return envelope.seq > lastAppliedCursor.seq;
};

export const evaluateStudentSyncEnvelope = (
  input: EvaluateStudentSyncEnvelopeInput
): StudentSyncGuardDecision => {
  const effectiveRole = resolveEffectiveRole(input.trustedRoleClaim);
  if (effectiveRole !== "student") {
    return {
      allow: false,
      reason: "non-student-runtime",
    };
  }

  if (input.envelope.kind !== "state-update") {
    return {
      allow: false,
      reason: "unsupported-envelope-kind",
    };
  }

  if (input.envelope.fromRole !== "host") {
    return {
      allow: false,
      reason: "non-host-envelope",
    };
  }

  if (!isMonotonicEnvelope(input.envelope, input.lastAppliedCursor)) {
    return {
      allow: false,
      reason: "stale-or-duplicate-envelope",
    };
  }

  return {
    allow: true,
    envelope: input.envelope,
    nextCursor: {
      sourceId: input.envelope.sourceId,
      seq: input.envelope.seq,
    },
  };
};
