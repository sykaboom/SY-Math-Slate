import { type ToolResult, validateToolResult } from "@core/contracts";

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
  toolResult?: ToolResult<unknown>;
  error?: string;
};

export interface Connector {
  name: string;
  supports: ConnectorSupports;
  invoke: (request: ConnectorRequest) => Promise<ConnectorResponse>;
}

export type ConnectorToolResultResolution =
  | { ok: true; toolResult: ToolResult<unknown> }
  | { ok: false; error: string };

export const resolveConnectorToolResult = (
  response: ConnectorResponse
): ConnectorToolResultResolution => {
  if (!response.ok) {
    return {
      ok: false,
      error: response.error ?? "connector returned a failed response.",
    };
  }
  if (!response.toolResult) {
    return {
      ok: false,
      error: "connector response is missing toolResult.",
    };
  }
  const validated = validateToolResult(response.toolResult);
  if (!validated.ok) {
    return {
      ok: false,
      error: `invalid toolResult: ${validated.code} (${validated.path})`,
    };
  }
  return { ok: true, toolResult: validated.value };
};
