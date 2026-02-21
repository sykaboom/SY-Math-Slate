"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { LiveSessionMeta } from "@core/foundation/types/snapshot";
import type {
  ApprovalMode,
  ProposalDecision,
  ProposalEnvelopePayload,
  ProposalType,
  SessionPolicy,
} from "@core/foundation/types/sessionPolicy";

import {
  isProposalPayload,
  publishProposalResult,
} from "./ProposalCommandBus";
import {
  createLiveBroadcastTransport,
  type LiveBroadcastConnectionState,
  type LiveBroadcastTransport,
} from "./transport/LiveBroadcastTransport";

export type PendingSessionProposal = {
  proposalId: string;
  proposalType: ProposalType;
  actorId: string;
  payload: unknown;
  opId: string;
  baseVersion: number;
  timestamp: number;
  queuedAt: number;
};

export type HostProposalDecisionLogEntry = {
  proposalId: string;
  decision: ProposalDecision;
  decidedAt: number;
  reason: string | null;
};

export type UseHostPolicyEngineOptions = {
  shareId: string | null;
  hostActorId: string;
  policy: SessionPolicy;
  liveSession?: LiveSessionMeta;
  enabled?: boolean;
  onProposalApproved?: (proposal: PendingSessionProposal) => void;
};

export type UseHostPolicyEngineState = {
  connectionState: LiveBroadcastConnectionState;
  pendingProposals: PendingSessionProposal[];
  recentDecisions: HostProposalDecisionLogEntry[];
  approveProposal: (proposalId: string, reason?: string) => boolean;
  rejectProposal: (proposalId: string, reason?: string) => boolean;
  decideProposal: (
    proposalId: string,
    decision: ProposalDecision,
    reason?: string
  ) => boolean;
  clearDecisionLog: () => void;
};

const normalizeTimestamp = (value: number): number => {
  if (!Number.isFinite(value)) return Date.now();
  return Math.max(0, Math.floor(value));
};

const trimReason = (value: string | undefined): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const resolveProposalMode = (
  policy: SessionPolicy,
  proposalType: ProposalType
): ApprovalMode => {
  return policy.proposalRules[proposalType] ?? "denied";
};

const toPendingProposal = (
  payload: ProposalEnvelopePayload,
  fallbackEnvelope: {
    op_id: string;
    base_version: number;
    timestamp: number;
  }
): PendingSessionProposal => ({
  proposalId: payload.proposalId,
  proposalType: payload.proposalType,
  actorId: payload.actorId,
  payload: payload.payload,
  opId: payload.op_id || fallbackEnvelope.op_id,
  baseVersion: Number.isFinite(payload.base_version)
    ? payload.base_version
    : fallbackEnvelope.base_version,
  timestamp: normalizeTimestamp(payload.timestamp || fallbackEnvelope.timestamp),
  queuedAt: Date.now(),
});

const appendDecision = (
  current: HostProposalDecisionLogEntry[],
  next: HostProposalDecisionLogEntry
): HostProposalDecisionLogEntry[] => {
  const nextEntries = [next, ...current.filter((entry) => entry.proposalId !== next.proposalId)];
  return nextEntries.slice(0, 50);
};

export const useHostPolicyEngine = (
  options: UseHostPolicyEngineOptions
): UseHostPolicyEngineState => {
  const [connectionState, setConnectionState] =
    useState<LiveBroadcastConnectionState>("idle");
  const [pendingProposals, setPendingProposals] = useState<PendingSessionProposal[]>([]);
  const [recentDecisions, setRecentDecisions] = useState<HostProposalDecisionLogEntry[]>([]);
  const transportRef = useRef<LiveBroadcastTransport | null>(null);
  const policyRef = useRef<SessionPolicy>(options.policy);
  const onProposalApprovedRef = useRef(options.onProposalApproved);

  useEffect(() => {
    policyRef.current = options.policy;
  }, [options.policy]);

  useEffect(() => {
    onProposalApprovedRef.current = options.onProposalApproved;
  }, [options.onProposalApproved]);

  const decideProposal = useCallback(
    (proposalId: string, decision: ProposalDecision, reason?: string): boolean => {
      const proposal = pendingProposals.find((entry) => entry.proposalId === proposalId);
      const transport = transportRef.current;
      if (!proposal || !transport || !options.shareId) return false;

      const normalizedReason = trimReason(reason);
      const published = publishProposalResult(transport, {
        shareId: options.shareId,
        actorId: options.hostActorId,
        proposalId: proposal.proposalId,
        decision,
        reason: normalizedReason ?? undefined,
        targetActorId: proposal.actorId,
        baseVersion: proposal.baseVersion,
      });
      if (!published) return false;

      setPendingProposals((previous) =>
        previous.filter((entry) => entry.proposalId !== proposal.proposalId)
      );
      setRecentDecisions((previous) =>
        appendDecision(previous, {
          proposalId: proposal.proposalId,
          decision,
          reason: normalizedReason,
          decidedAt: Date.now(),
        })
      );

      if (decision === "approved") {
        onProposalApprovedRef.current?.(proposal);
      }
      return true;
    },
    [options.hostActorId, options.shareId, pendingProposals]
  );

  const approveProposal = useCallback(
    (proposalId: string, reason?: string): boolean => {
      return decideProposal(proposalId, "approved", reason);
    },
    [decideProposal]
  );

  const rejectProposal = useCallback(
    (proposalId: string, reason?: string): boolean => {
      return decideProposal(proposalId, "rejected", reason);
    },
    [decideProposal]
  );

  const clearDecisionLog = useCallback(() => {
    setRecentDecisions([]);
  }, []);

  useEffect(() => {
    const shouldEnable =
      options.enabled !== false &&
      Boolean(options.shareId) &&
      Boolean(options.liveSession?.enabled) &&
      Boolean(options.liveSession?.relayUrl);

    if (!shouldEnable || !options.shareId || !options.liveSession?.relayUrl) {
      transportRef.current?.close();
      transportRef.current = null;
      void Promise.resolve().then(() => {
        setPendingProposals([]);
        setConnectionState("idle");
      });
      return;
    }

    const activeShareId = options.shareId;
    const activeHostActorId = options.hostActorId;
    const transport = createLiveBroadcastTransport({
      shareId: activeShareId,
      endpoint: options.liveSession.relayUrl,
    });
    transportRef.current = transport;

    const unsubscribeState = transport.subscribeState((nextState) => {
      setConnectionState(nextState);
    });

    const unsubscribeEnvelope = transport.subscribe((envelope) => {
      if (envelope.canvas_id !== activeShareId) return;
      if (!isProposalPayload(envelope.payload)) return;
      if (envelope.actor_id === activeHostActorId) return;

      const payload = envelope.payload;
      const approvalMode = resolveProposalMode(policyRef.current, payload.proposalType);
      const pending = toPendingProposal(payload, {
        op_id: envelope.op_id,
        base_version: envelope.base_version,
        timestamp: envelope.timestamp,
      });

      if (approvalMode === "denied") {
        void publishProposalResult(transport, {
          shareId: activeShareId,
          actorId: activeHostActorId,
          proposalId: pending.proposalId,
          decision: "rejected",
          reason: "Policy denied this proposal type.",
          targetActorId: pending.actorId,
          baseVersion: pending.baseVersion,
        });
        setRecentDecisions((previous) =>
          appendDecision(previous, {
            proposalId: pending.proposalId,
            decision: "rejected",
            reason: "Policy denied this proposal type.",
            decidedAt: Date.now(),
          })
        );
        return;
      }

      if (approvalMode === "auto") {
        const approved = publishProposalResult(transport, {
          shareId: activeShareId,
          actorId: activeHostActorId,
          proposalId: pending.proposalId,
          decision: "approved",
          targetActorId: pending.actorId,
          baseVersion: pending.baseVersion,
        });
        if (approved) {
          setRecentDecisions((previous) =>
            appendDecision(previous, {
              proposalId: pending.proposalId,
              decision: "approved",
              reason: null,
              decidedAt: Date.now(),
            })
          );
          onProposalApprovedRef.current?.(pending);
        }
        return;
      }

      setPendingProposals((previous) => {
        if (previous.some((entry) => entry.proposalId === pending.proposalId)) {
          return previous;
        }
        return [pending, ...previous];
      });
    });

    transport.connect();

    return () => {
      unsubscribeEnvelope();
      unsubscribeState();
      transport.close();
      if (transportRef.current === transport) {
        transportRef.current = null;
      }
    };
  }, [
    options.enabled,
    options.hostActorId,
    options.liveSession?.enabled,
    options.liveSession?.relayUrl,
    options.shareId,
  ]);

  return useMemo(
    () => ({
      connectionState,
      pendingProposals,
      recentDecisions,
      approveProposal,
      rejectProposal,
      decideProposal,
      clearDecisionLog,
    }),
    [
      approveProposal,
      clearDecisionLog,
      connectionState,
      decideProposal,
      pendingProposals,
      recentDecisions,
      rejectProposal,
    ]
  );
};
