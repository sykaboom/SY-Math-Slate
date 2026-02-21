import type { PersistedCanvasV2 } from "@core/foundation/types/canvas";
import type {
  ProposalEnvelopePayload,
  ProposalResultEnvelopePayload,
} from "@core/foundation/types/sessionPolicy";
import {
  isProposalDecision,
  isProposalType,
} from "@core/foundation/types/sessionPolicy";

export type SharedViewportState = {
  x: number;
  y: number;
  scale: number;
};

export type BroadcastEnvelope = {
  op_id: string;
  actor_id: string;
  canvas_id: string;
  base_version: number;
  timestamp: number;
  payload:
    | {
        type: "snapshot";
        canvas: PersistedCanvasV2;
      }
    | {
        type: "step_change";
        step: number;
      }
    | {
        type: "viewport_sync";
        viewport: SharedViewportState;
      }
    | {
        type: "session_end";
      }
    | ProposalEnvelopePayload
    | ProposalResultEnvelopePayload;
};

export type LiveBroadcastConnectionState =
  | "idle"
  | "disabled"
  | "connecting"
  | "open"
  | "closed"
  | "error";

export type LiveBroadcastListener = (envelope: BroadcastEnvelope) => void;

export type LiveBroadcastStateListener = (
  state: LiveBroadcastConnectionState
) => void;

export type LiveBroadcastTransport = {
  connect: () => void;
  publish: (envelope: BroadcastEnvelope) => boolean;
  subscribe: (listener: LiveBroadcastListener) => () => void;
  subscribeState: (listener: LiveBroadcastStateListener) => () => void;
  close: () => void;
  getState: () => LiveBroadcastConnectionState;
};

export type CreateLiveBroadcastTransportOptions = {
  shareId: string;
  endpoint?: string | null;
  autoReconnect?: boolean;
  reconnectDelayMs?: number;
};

const DEFAULT_RECONNECT_DELAY_MS = 1_000;

const normalizeString = (value: string | null | undefined): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const resolveEndpoint = (options: CreateLiveBroadcastTransportOptions): string | null => {
  const configured =
    normalizeString(options.endpoint) ??
    normalizeString(process.env.NEXT_PUBLIC_SHARE_LIVE_WS_URL);
  if (!configured) return null;

  const withShareId = configured.includes("{shareId}")
    ? configured.replaceAll("{shareId}", encodeURIComponent(options.shareId))
    : configured;

  const maybeWs = withShareId
    .replace(/^http:\/\//i, "ws://")
    .replace(/^https:\/\//i, "wss://");

  try {
    const url = new URL(maybeWs);
    if (!url.searchParams.has("shareId")) {
      url.searchParams.set("shareId", options.shareId);
    }
    return url.toString();
  } catch {
    return maybeWs;
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const isFiniteNumber = (value: unknown): value is number => {
  return typeof value === "number" && Number.isFinite(value);
};

const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === "string" && value.length > 0;
};

const hasCanvasCoreShape = (value: unknown): value is PersistedCanvasV2 => {
  if (!isRecord(value)) return false;
  if (!isFiniteNumber(value.version)) return false;
  if (!isRecord(value.pages)) return false;
  if (!Array.isArray(value.pageOrder)) return false;
  if (!value.pageOrder.every((entry) => typeof entry === "string")) return false;
  if (typeof value.currentPageId !== "string" || value.currentPageId.length === 0) {
    return false;
  }
  if (!isFiniteNumber(value.currentStep)) return false;
  if (!isRecord(value.pageColumnCounts)) return false;
  if (!Array.isArray(value.stepBlocks)) return false;
  if (!(value.anchorMap === null || isRecord(value.anchorMap))) return false;
  if (!isRecord(value.audioByStep)) return false;
  if (!(value.animationModInput === null || isRecord(value.animationModInput))) {
    return false;
  }
  return true;
};

const parseEnvelope = (value: unknown): BroadcastEnvelope | null => {
  if (!isRecord(value)) return null;
  if (typeof value.op_id !== "string" || value.op_id.length === 0) return null;
  if (typeof value.actor_id !== "string" || value.actor_id.length === 0) return null;
  if (typeof value.canvas_id !== "string" || value.canvas_id.length === 0) return null;
  if (!isFiniteNumber(value.base_version)) return null;
  if (!isFiniteNumber(value.timestamp)) return null;
  if (!isRecord(value.payload) || typeof value.payload.type !== "string") return null;

  if (value.payload.type === "snapshot") {
    if (!hasCanvasCoreShape(value.payload.canvas)) return null;
    return {
      op_id: value.op_id,
      actor_id: value.actor_id,
      canvas_id: value.canvas_id,
      base_version: value.base_version,
      timestamp: value.timestamp,
      payload: {
        type: "snapshot",
        canvas: value.payload.canvas,
      },
    };
  }

  if (value.payload.type === "step_change") {
    if (!isFiniteNumber(value.payload.step)) return null;
    return {
      op_id: value.op_id,
      actor_id: value.actor_id,
      canvas_id: value.canvas_id,
      base_version: value.base_version,
      timestamp: value.timestamp,
      payload: {
        type: "step_change",
        step: value.payload.step,
      },
    };
  }

  if (value.payload.type === "viewport_sync") {
    if (!isRecord(value.payload.viewport)) return null;
    if (!isFiniteNumber(value.payload.viewport.x)) return null;
    if (!isFiniteNumber(value.payload.viewport.y)) return null;
    if (!isFiniteNumber(value.payload.viewport.scale)) return null;
    return {
      op_id: value.op_id,
      actor_id: value.actor_id,
      canvas_id: value.canvas_id,
      base_version: value.base_version,
      timestamp: value.timestamp,
      payload: {
        type: "viewport_sync",
        viewport: {
          x: value.payload.viewport.x,
          y: value.payload.viewport.y,
          scale: value.payload.viewport.scale,
        },
      },
    };
  }

  if (value.payload.type === "session_end") {
    return {
      op_id: value.op_id,
      actor_id: value.actor_id,
      canvas_id: value.canvas_id,
      base_version: value.base_version,
      timestamp: value.timestamp,
      payload: {
        type: "session_end",
      },
    };
  }

  if (value.payload.type === "proposal") {
    if (!isNonEmptyString(value.payload.proposalId)) return null;
    if (!isProposalType(value.payload.proposalType)) return null;
    if (!isNonEmptyString(value.payload.actorId)) return null;
    if (!isNonEmptyString(value.payload.op_id)) return null;
    if (!isFiniteNumber(value.payload.base_version)) return null;
    if (!isFiniteNumber(value.payload.timestamp)) return null;

    return {
      op_id: value.op_id,
      actor_id: value.actor_id,
      canvas_id: value.canvas_id,
      base_version: value.base_version,
      timestamp: value.timestamp,
      payload: {
        type: "proposal",
        proposalId: value.payload.proposalId,
        proposalType: value.payload.proposalType,
        actorId: value.payload.actorId,
        payload: value.payload.payload,
        op_id: value.payload.op_id,
        base_version: value.payload.base_version,
        timestamp: value.payload.timestamp,
      },
    };
  }

  if (value.payload.type === "proposal_result") {
    if (!isNonEmptyString(value.payload.proposalId)) return null;
    if (!isProposalDecision(value.payload.decision)) return null;
    if (
      value.payload.reason !== undefined &&
      typeof value.payload.reason !== "string"
    ) {
      return null;
    }
    if (
      value.payload.actorId !== undefined &&
      typeof value.payload.actorId !== "string"
    ) {
      return null;
    }

    return {
      op_id: value.op_id,
      actor_id: value.actor_id,
      canvas_id: value.canvas_id,
      base_version: value.base_version,
      timestamp: value.timestamp,
      payload: {
        type: "proposal_result",
        proposalId: value.payload.proposalId,
        decision: value.payload.decision,
        ...(value.payload.reason !== undefined
          ? { reason: value.payload.reason }
          : {}),
        ...(value.payload.actorId !== undefined
          ? { actorId: value.payload.actorId }
          : {}),
      },
    };
  }

  return null;
};

const parseMessageData = (raw: unknown): BroadcastEnvelope | null => {
  if (typeof raw !== "string") return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    return parseEnvelope(parsed);
  } catch {
    return null;
  }
};

export const createLiveBroadcastTransport = (
  options: CreateLiveBroadcastTransportOptions
): LiveBroadcastTransport => {
  const listeners = new Set<LiveBroadcastListener>();
  const stateListeners = new Set<LiveBroadcastStateListener>();
  const endpoint = resolveEndpoint(options);
  const reconnectDelayMs = Math.max(
    100,
    options.reconnectDelayMs ?? DEFAULT_RECONNECT_DELAY_MS
  );
  const autoReconnect = options.autoReconnect ?? true;

  let state: LiveBroadcastConnectionState = "idle";
  let connectRequested = false;
  let isClosing = false;
  let socket: WebSocket | null = null;
  let reconnectTimer: number | null = null;
  let outbox: BroadcastEnvelope[] = [];

  const setState = (nextState: LiveBroadcastConnectionState) => {
    if (state === nextState) return;
    state = nextState;
    stateListeners.forEach((listener) => listener(nextState));
  };

  const clearReconnectTimer = () => {
    if (reconnectTimer === null) return;
    window.clearTimeout(reconnectTimer);
    reconnectTimer = null;
  };

  const scheduleReconnect = () => {
    if (!autoReconnect || isClosing || !connectRequested) return;
    clearReconnectTimer();
    reconnectTimer = window.setTimeout(() => {
      reconnectTimer = null;
      openSocket();
    }, reconnectDelayMs);
  };

  function openSocket() {
    if (!connectRequested) return;
    if (typeof window === "undefined" || typeof WebSocket === "undefined") {
      setState("disabled");
      return;
    }
    if (!endpoint) {
      setState("disabled");
      return;
    }

    setState("connecting");

    try {
      socket = new WebSocket(endpoint);
    } catch {
      socket = null;
      setState("error");
      scheduleReconnect();
      return;
    }

    socket.addEventListener("open", () => {
      setState("open");
      if (!socket || socket.readyState !== WebSocket.OPEN || outbox.length === 0) {
        return;
      }
      const queued = [...outbox];
      outbox = [];
      queued.forEach((envelope) => {
        try {
          socket?.send(JSON.stringify(envelope));
        } catch {
          outbox.push(envelope);
        }
      });
    });

    socket.addEventListener("message", (event) => {
      const envelope = parseMessageData(event.data);
      if (!envelope) return;
      listeners.forEach((listener) => listener(envelope));
    });

    socket.addEventListener("error", () => {
      setState("error");
    });

    socket.addEventListener("close", () => {
      socket = null;
      if (isClosing || !connectRequested) {
        setState("closed");
        return;
      }
      setState("closed");
      scheduleReconnect();
    });
  }

  return {
    connect: () => {
      if (connectRequested) return;
      connectRequested = true;
      isClosing = false;
      openSocket();
    },
    publish: (envelope) => {
      const validEnvelope = parseEnvelope(envelope);
      if (!validEnvelope) return false;

      if (!socket) {
        if (state === "connecting") {
          outbox.push(validEnvelope);
          return true;
        }
        return false;
      }

      if (socket.readyState === WebSocket.CONNECTING) {
        outbox.push(validEnvelope);
        return true;
      }

      if (socket.readyState !== WebSocket.OPEN) {
        return false;
      }

      try {
        socket.send(JSON.stringify(validEnvelope));
        return true;
      } catch {
        return false;
      }
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    subscribeState: (listener) => {
      stateListeners.add(listener);
      listener(state);
      return () => {
        stateListeners.delete(listener);
      };
    },
    close: () => {
      connectRequested = false;
      isClosing = true;
      clearReconnectTimer();
      outbox = [];
      if (socket) {
        try {
          socket.close();
        } catch {
          // noop
        }
      }
      socket = null;
      setState("closed");
    },
    getState: () => state,
  };
};
