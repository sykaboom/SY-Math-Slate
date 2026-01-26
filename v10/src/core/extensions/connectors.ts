export type ConnectorSupports = {
  tts?: boolean;
  llm?: boolean;
  export?: boolean;
  audio?: boolean;
};

export type ConnectorRequest = {
  type: string;
  payload?: unknown;
  meta?: Record<string, unknown>;
};

export type ConnectorResponse = {
  ok: boolean;
  data?: unknown;
  error?: string;
};

export interface Connector {
  name: string;
  supports: ConnectorSupports;
  invoke: (request: ConnectorRequest) => Promise<ConnectorResponse>;
}
