import type { NormalizedContent, ToolResult } from "@core/contracts";
import type { ConnectorResponse } from "@core/extensions/connectors";
import type { ExtensionAdapter } from "./types";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const pickText = (payload: unknown): string => {
  if (!isRecord(payload)) return "mock adapter output";
  if (typeof payload.text === "string" && payload.text.trim() !== "") {
    return payload.text;
  }
  if (typeof payload.prompt === "string" && payload.prompt.trim() !== "") {
    return payload.prompt;
  }
  return "mock adapter output";
};

const pickLocale = (payload: unknown): string => {
  if (!isRecord(payload)) return "ko-KR";
  if (typeof payload.locale === "string" && payload.locale.trim() !== "") {
    return payload.locale;
  }
  return "ko-KR";
};

const createMockNormalizedContent = (
  toolId: string,
  payload: unknown
): NormalizedContent => ({
  type: "NormalizedContent",
  version: "0.3.0-draft",
  metadata: {
    locale: pickLocale(payload),
    title: `mock:${toolId}`,
  },
  blocks: [
    {
      id: `${toolId}-text-0`,
      kind: "text",
      text: pickText(payload),
    },
  ],
});

const createMockToolResult = (
  toolId: string,
  adapterId: string,
  payload: unknown
): ToolResult<NormalizedContent> => ({
  toolId,
  toolVersion: "0.3.0-draft",
  status: "ok",
  raw: {
    adapterId,
    payload,
  },
  normalized: createMockNormalizedContent(toolId, payload),
  diagnostics: {
    latencyMs: 0,
    warnings: ["mock-adapter-response"],
  },
});

const okResponse = (toolResult: ToolResult<NormalizedContent>): ConnectorResponse => ({
  ok: true,
  toolResult,
});

export const mockAdapter: ExtensionAdapter = {
  adapterId: "local.mock",
  supports: ["llm", "tts", "renderer", "transformer", "validator"],
  invoke: async (request) =>
    okResponse(createMockToolResult(request.toolId, request.adapterId, request.payload)),
  health: async () => ({ ok: true, detail: "mock adapter ready" }),
};
