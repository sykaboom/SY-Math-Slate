import {
  type SessionSyncEnvelope,
  validateSessionSyncEnvelope,
} from "./messageEnvelope";

export const DEFAULT_SESSION_SYNC_CHANNEL_NAME = "sy-math-slate:session-sync.v1";

const REALTIME_ENDPOINT_ENV_KEYS = [
  "NEXT_PUBLIC_SYNC_REALTIME_URL",
] as const;

export type RealtimeBackplaneTransport =
  | "websocket"
  | "broadcast-channel"
  | "none";

export type RealtimeBackplaneListener = (envelope: SessionSyncEnvelope) => void;

export type RealtimeBackplane = {
  connect: () => void;
  publish: (envelope: SessionSyncEnvelope) => boolean;
  subscribe: (listener: RealtimeBackplaneListener) => () => void;
  close: () => void;
  getTransport: () => RealtimeBackplaneTransport;
};

export type CreateRealtimeBackplaneOptions = {
  channelName?: string;
  internetEndpoint?: string | null;
};

const isClientRuntime = (): boolean => typeof window !== "undefined";

const isBroadcastChannelAvailable = (): boolean =>
  isClientRuntime() && typeof BroadcastChannel !== "undefined";

const isWebSocketAvailable = (): boolean =>
  isClientRuntime() && typeof WebSocket !== "undefined";

const normalizeEndpoint = (value: string | null | undefined): string | null => {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};

const resolveEndpointFromEnv = (): string | null => {
  for (const key of REALTIME_ENDPOINT_ENV_KEYS) {
    const value = process.env[key];
    const normalized = normalizeEndpoint(value);
    if (normalized) return normalized;
  }
  return null;
};

const parseIncomingEnvelope = (value: unknown): SessionSyncEnvelope | null => {
  const result = validateSessionSyncEnvelope(value);
  return result.ok ? result.value : null;
};

const parseWebSocketMessageData = (rawData: unknown): unknown => {
  if (typeof rawData !== "string") {
    return null;
  }
  try {
    return JSON.parse(rawData) as unknown;
  } catch {
    return null;
  }
};

export const createRealtimeBackplane = (
  options: CreateRealtimeBackplaneOptions = {}
): RealtimeBackplane => {
  const listeners = new Set<RealtimeBackplaneListener>();
  const channelName = options.channelName ?? DEFAULT_SESSION_SYNC_CHANNEL_NAME;
  const resolvedEndpoint =
    normalizeEndpoint(options.internetEndpoint ?? undefined) ??
    resolveEndpointFromEnv();

  let connectStarted = false;
  let transport: RealtimeBackplaneTransport = "none";
  let webSocket: WebSocket | null = null;
  let channel: BroadcastChannel | null = null;
  let websocketOutbox: SessionSyncEnvelope[] = [];
  let teardown: (() => void) | null = null;

  const emitEnvelope = (value: unknown) => {
    const envelope = parseIncomingEnvelope(value);
    if (!envelope) return;
    listeners.forEach((listener) => listener(envelope));
  };

  const tryConnectWebSocket = (): boolean => {
    if (!resolvedEndpoint || !isWebSocketAvailable()) return false;
    try {
      webSocket = new WebSocket(resolvedEndpoint);
    } catch {
      webSocket = null;
      return false;
    }

    const handleOpen = () => {
      if (!webSocket || webSocket.readyState !== WebSocket.OPEN) return;
      if (websocketOutbox.length === 0) return;
      const queued = [...websocketOutbox];
      websocketOutbox = [];
      queued.forEach((envelope) => {
        try {
          webSocket?.send(JSON.stringify(envelope));
        } catch {
          // Ignore send failures and preserve deny-by-default behavior.
        }
      });
    };

    const handleMessage = (event: MessageEvent<unknown>) => {
      const parsed = parseWebSocketMessageData(event.data);
      emitEnvelope(parsed);
    };

    webSocket.addEventListener("open", handleOpen);
    webSocket.addEventListener("message", handleMessage);

    teardown = () => {
      if (!webSocket) return;
      webSocket.removeEventListener("open", handleOpen);
      webSocket.removeEventListener("message", handleMessage);
      try {
        webSocket.close();
      } catch {
        // Ignore close failures.
      }
      webSocket = null;
      websocketOutbox = [];
    };

    transport = "websocket";
    return true;
  };

  const tryConnectBroadcastChannel = (): boolean => {
    if (!isBroadcastChannelAvailable()) return false;
    channel = new BroadcastChannel(channelName);

    const handleMessage = (event: MessageEvent<unknown>) => {
      emitEnvelope(event.data);
    };

    channel.addEventListener("message", handleMessage);
    teardown = () => {
      if (!channel) return;
      channel.removeEventListener("message", handleMessage);
      channel.close();
      channel = null;
    };

    transport = "broadcast-channel";
    return true;
  };

  return {
    connect: () => {
      if (connectStarted) return;
      connectStarted = true;

      const connectedViaWebSocket = tryConnectWebSocket();
      if (connectedViaWebSocket) {
        return;
      }
      const connectedViaBroadcastChannel = tryConnectBroadcastChannel();
      if (connectedViaBroadcastChannel) {
        return;
      }
      transport = "none";
      teardown = null;
    },
    publish: (envelope) => {
      const validation = validateSessionSyncEnvelope(envelope);
      if (!validation.ok) return false;
      const normalizedEnvelope = validation.value;

      if (transport === "websocket") {
        if (!webSocket) return false;
        if (webSocket.readyState === WebSocket.OPEN) {
          try {
            webSocket.send(JSON.stringify(normalizedEnvelope));
            return true;
          } catch {
            return false;
          }
        }
        if (webSocket.readyState === WebSocket.CONNECTING) {
          websocketOutbox.push(normalizedEnvelope);
          return true;
        }
        return false;
      }

      if (transport === "broadcast-channel" && channel) {
        channel.postMessage(normalizedEnvelope);
        return true;
      }
      return false;
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    close: () => {
      listeners.clear();
      if (teardown) {
        teardown();
      }
      teardown = null;
      connectStarted = false;
      transport = "none";
      websocketOutbox = [];
      webSocket = null;
      channel = null;
    },
    getTransport: () => transport,
  };
};
