"use client";

import { useEffect, useMemo, useRef } from "react";

import { useLocalStore } from "@features/store/useLocalStore";
import { useSyncStore } from "@features/store/useSyncStore";

type SyncMessage =
  | {
      type: "state-update";
      seq: number;
      fromRole: "host" | "student";
      payload: {
        globalStep: number;
        sharedViewport: { zoomLevel: number; panOffset: { x: number; y: number } };
        laserPosition: { x: number; y: number } | null;
      };
    }
  | { type: "state-request"; fromRole: "host" | "student" };

const CHANNEL_NAME = "sy-math-slate:session-sync.v1";

const canUseBroadcastChannel = (): boolean =>
  typeof window !== "undefined" && typeof BroadcastChannel !== "undefined";

export function useAsymmetricSessionSync() {
  const role = useLocalStore((state) => state.role);
  const globalStep = useSyncStore((state) => state.globalStep);
  const sharedViewport = useSyncStore((state) => state.sharedViewport);
  const laserPosition = useSyncStore((state) => state.laserPosition);
  const setGlobalStep = useSyncStore((state) => state.setGlobalStep);
  const setSharedViewport = useSyncStore((state) => state.setSharedViewport);
  const setLaserPosition = useSyncStore((state) => state.setLaserPosition);
  const seqRef = useRef(0);

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
    if (!canUseBroadcastChannel()) return;
    const channel = new BroadcastChannel(CHANNEL_NAME);

    const postHostState = () => {
      seqRef.current += 1;
      const message: SyncMessage = {
        type: "state-update",
        seq: seqRef.current,
        fromRole: role,
        payload: {
          globalStep,
          sharedViewport,
          laserPosition,
        },
      };
      channel.postMessage(message);
    };

    if (role === "host") {
      postHostState();
    } else {
      const request: SyncMessage = {
        type: "state-request",
        fromRole: role,
      };
      channel.postMessage(request);
    }

    const handleMessage = (event: MessageEvent<SyncMessage>) => {
      const data = event.data;
      if (!data || typeof data !== "object") return;

      if (role === "host" && data.type === "state-request") {
        postHostState();
        return;
      }

      if (role !== "student" || data.type !== "state-update") {
        return;
      }
      if (data.fromRole !== "host") return;

      setGlobalStep(data.payload.globalStep);
      setSharedViewport(data.payload.sharedViewport);
      setLaserPosition(data.payload.laserPosition);
    };

    channel.addEventListener("message", handleMessage);
    return () => {
      channel.removeEventListener("message", handleMessage);
      channel.close();
    };
  }, [
    globalStep,
    laserPosition,
    role,
    serializedPayload,
    setGlobalStep,
    setLaserPosition,
    setSharedViewport,
    sharedViewport,
  ]);
}
