"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { LiveSessionMeta } from "@core/foundation/types/snapshot";
import type { ProposalType } from "@core/foundation/types/sessionPolicy";

import {
  isProposalResultPayload,
  publishProposal,
} from "./ProposalCommandBus";
import {
  createLiveBroadcastTransport,
  type LiveBroadcastConnectionState,
  type LiveBroadcastTransport,
} from "./transport/LiveBroadcastTransport";

export type ParticipantProposalStatus = "pending" | "approved" | "rejected";

export type ParticipantProposalEntry = {
  proposalId: string;
  proposalType: ProposalType;
  status: ParticipantProposalStatus;
  reason: string | null;
  createdAt: number;
  updatedAt: number;
};

export type SubmitParticipantProposalInput = {
  proposalType: ProposalType;
  payload: unknown;
  baseVersion?: number;
};

export type UseParticipantSessionOptions = {
  shareId: string | null;
  actorId: string;
  liveSession?: LiveSessionMeta;
  enabled?: boolean;
};

export type UseParticipantSessionState = {
  connectionState: LiveBroadcastConnectionState;
  proposals: ParticipantProposalEntry[];
  latestProposal: ParticipantProposalEntry | null;
  submitProposal: (input: SubmitParticipantProposalInput) => string | null;
  clearResolvedProposals: () => void;
};

const normalizeTimestamp = (value: number): number => {
  if (!Number.isFinite(value)) return Date.now();
  return Math.max(0, Math.floor(value));
};

const sortByUpdatedAtDesc = (
  proposals: ParticipantProposalEntry[]
): ParticipantProposalEntry[] =>
  [...proposals].sort((a, b) => {
    if (a.updatedAt !== b.updatedAt) {
      return b.updatedAt - a.updatedAt;
    }
    return a.proposalId < b.proposalId ? -1 : 1;
  });

const upsertProposal = (
  entries: ParticipantProposalEntry[],
  nextEntry: ParticipantProposalEntry
): ParticipantProposalEntry[] => {
  const index = entries.findIndex((entry) => entry.proposalId === nextEntry.proposalId);
  if (index < 0) {
    return sortByUpdatedAtDesc([...entries, nextEntry]);
  }

  const updated = [...entries];
  updated[index] = nextEntry;
  return sortByUpdatedAtDesc(updated);
};

export const useParticipantSession = (
  options: UseParticipantSessionOptions
): UseParticipantSessionState => {
  const [connectionState, setConnectionState] =
    useState<LiveBroadcastConnectionState>("idle");
  const [proposals, setProposals] = useState<ParticipantProposalEntry[]>([]);
  const transportRef = useRef<LiveBroadcastTransport | null>(null);

  const submitProposal = useCallback(
    (input: SubmitParticipantProposalInput): string | null => {
      const transport = transportRef.current;
      if (!transport || !options.shareId) return null;

      const proposalId = publishProposal(transport, {
        shareId: options.shareId,
        actorId: options.actorId,
        proposalType: input.proposalType,
        payload: input.payload,
        baseVersion: input.baseVersion,
      });

      if (!proposalId) return null;

      const now = Date.now();
      setProposals((previous) =>
        upsertProposal(previous, {
          proposalId,
          proposalType: input.proposalType,
          status: "pending",
          reason: null,
          createdAt: now,
          updatedAt: now,
        })
      );

      return proposalId;
    },
    [options.actorId, options.shareId]
  );

  const clearResolvedProposals = useCallback(() => {
    setProposals((previous) => previous.filter((entry) => entry.status === "pending"));
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
        setConnectionState("idle");
      });
      return;
    }

    const activeShareId = options.shareId;
    const activeActorId = options.actorId;
    const transport = createLiveBroadcastTransport({
      shareId: activeShareId,
      endpoint: options.liveSession.relayUrl,
    });
    transportRef.current = transport;

    const unsubscribeState = transport.subscribeState((state) => {
      setConnectionState(state);
    });

    const unsubscribeEnvelope = transport.subscribe((envelope) => {
      if (envelope.canvas_id !== activeShareId) return;
      const proposalResult = envelope.payload;
      if (!isProposalResultPayload(proposalResult)) return;
      if (proposalResult.actorId && proposalResult.actorId !== activeActorId) {
        return;
      }

      setProposals((previous) => {
        const currentEntry = previous.find(
          (entry) => entry.proposalId === proposalResult.proposalId
        );
        if (!currentEntry) return previous;

        const nextStatus: ParticipantProposalStatus =
          proposalResult.decision === "approved" ? "approved" : "rejected";

        return upsertProposal(previous, {
          ...currentEntry,
          status: nextStatus,
          reason:
            typeof proposalResult.reason === "string" &&
            proposalResult.reason.trim().length > 0
              ? proposalResult.reason
              : null,
          updatedAt: normalizeTimestamp(envelope.timestamp),
        });
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
    options.actorId,
    options.enabled,
    options.liveSession?.enabled,
    options.liveSession?.relayUrl,
    options.shareId,
  ]);

  const latestProposal = useMemo(() => proposals[0] ?? null, [proposals]);

  return {
    connectionState,
    proposals,
    latestProposal,
    submitProposal,
    clearResolvedProposals,
  };
};
