"use client";

import { useEffect, useMemo, useRef } from "react";

import { useLocalStore } from "@features/platform/store/useLocalStore";
import type { HostEnvelopeCursor } from "@features/platform/store/useSyncStore";
import { useSyncStore } from "@features/platform/store/useSyncStore";

import { createRealtimeBackplane } from "./realtime/backplane";
import { resolveEnvelopeConflict } from "./realtime/conflictPolicy";
import {
  createStateRequestEnvelope,
  createStateUpdateEnvelope,
  type SessionSyncStatePayload,
} from "./realtime/messageEnvelope";
import { evaluateStudentSyncEnvelope } from "./realtime/roleSyncGuard";

const createSyncSourceId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `session-sync:${crypto.randomUUID()}`;
  }
  return `session-sync:${Date.now().toString(36)}:${Math.random()
    .toString(36)
    .slice(2, 10)}`;
};

export function useAsymmetricSessionSync() {
  const role = useLocalStore((state) => state.role);
  const trustedRoleClaim = useLocalStore((state) => state.trustedRoleClaim);
  const globalStep = useSyncStore((state) => state.globalStep);
  const sharedViewport = useSyncStore((state) => state.sharedViewport);
  const laserPosition = useSyncStore((state) => state.laserPosition);
  const lastHostEnvelopeCursor = useSyncStore(
    (state) => state.lastHostEnvelopeCursor
  );
  const setGlobalStep = useSyncStore((state) => state.setGlobalStep);
  const setSharedViewport = useSyncStore((state) => state.setSharedViewport);
  const setLaserPosition = useSyncStore((state) => state.setLaserPosition);
  const setLastHostEnvelopeCursor = useSyncStore(
    (state) => state.setLastHostEnvelopeCursor
  );
  const clearLastHostEnvelopeCursor = useSyncStore(
    (state) => state.clearLastHostEnvelopeCursor
  );
  const setRemotePresence = useSyncStore((state) => state.setRemotePresence);
  const clearRemotePresence = useSyncStore((state) => state.clearRemotePresence);

  const effectiveRole =
    trustedRoleClaim === "host" ? "host" : "student";
  const seqRef = useRef(0);
  const sourceIdRef = useRef<string>(createSyncSourceId());
  const payloadRef = useRef<SessionSyncStatePayload>({
    globalStep,
    sharedViewport,
    laserPosition,
  });
  const appliedCursorRef = useRef<HostEnvelopeCursor | null>(
    lastHostEnvelopeCursor
  );
  const publishHostStateRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    payloadRef.current = {
      globalStep,
      sharedViewport,
      laserPosition,
    };
  }, [globalStep, laserPosition, sharedViewport]);

  useEffect(() => {
    appliedCursorRef.current = lastHostEnvelopeCursor;
  }, [lastHostEnvelopeCursor]);

  const serializedPayload = useMemo(
    () =>
      JSON.stringify({
        globalStep,
        sharedViewport,
        laserPosition,
      }),
    [globalStep, laserPosition, sharedViewport]
  );

  useEffect(() => {
    if (effectiveRole !== "student") {
      appliedCursorRef.current = null;
      clearRemotePresence();
      if (lastHostEnvelopeCursor !== null) {
        clearLastHostEnvelopeCursor();
      }
    }
  }, [
    clearLastHostEnvelopeCursor,
    clearRemotePresence,
    effectiveRole,
    lastHostEnvelopeCursor,
  ]);

  useEffect(() => {
    const backplane = createRealtimeBackplane();

    const publishHostState = () => {
      if (effectiveRole !== "host") return;
      seqRef.current += 1;
      backplane.publish(
        createStateUpdateEnvelope({
          sourceId: sourceIdRef.current,
          fromRole: "host",
          seq: seqRef.current,
          payload: payloadRef.current,
        })
      );
    };

    publishHostStateRef.current = publishHostState;

    const unsubscribe = backplane.subscribe((envelope) => {
      if (effectiveRole === "host") {
        if (envelope.kind === "state-request") {
          publishHostState();
        }
        return;
      }

      const decision = evaluateStudentSyncEnvelope({
        localRole: role,
        trustedRoleClaim,
        envelope,
        lastAppliedCursor: appliedCursorRef.current,
      });
      if (!decision.allow) return;

      const conflict = resolveEnvelopeConflict({
        current: appliedCursorRef.current,
        incoming: {
          sourceId: decision.envelope.sourceId,
          seq: decision.envelope.seq,
          sentAt: decision.envelope.sentAt,
        },
      });
      if (conflict.decision !== "accept") return;

      const nextCursor: HostEnvelopeCursor = {
        sourceId: conflict.nextCursor.sourceId,
        seq: conflict.nextCursor.seq,
        sentAt: conflict.nextCursor.sentAt,
      };

      setGlobalStep(decision.envelope.payload.globalStep);
      setSharedViewport(decision.envelope.payload.sharedViewport);
      setLaserPosition(decision.envelope.payload.laserPosition);
      setRemotePresence({
        sourceId: nextCursor.sourceId,
        seq: nextCursor.seq,
        sentAt: nextCursor.sentAt,
        laserPosition: decision.envelope.payload.laserPosition,
      });

      appliedCursorRef.current = nextCursor;
      setLastHostEnvelopeCursor(nextCursor);
    });

    backplane.connect();

    if (effectiveRole === "student") {
      backplane.publish(
        createStateRequestEnvelope({
          sourceId: sourceIdRef.current,
          fromRole: "student",
        })
      );
    }

    return () => {
      unsubscribe();
      publishHostStateRef.current = null;
      backplane.close();
    };
  }, [
    clearRemotePresence,
    effectiveRole,
    role,
    setGlobalStep,
    setLaserPosition,
    setLastHostEnvelopeCursor,
    setRemotePresence,
    setSharedViewport,
    trustedRoleClaim,
  ]);

  useEffect(() => {
    if (effectiveRole !== "host") return;
    publishHostStateRef.current?.();
  }, [effectiveRole, serializedPayload]);
}
