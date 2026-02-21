import type { NormalizedContent } from "@core/foundation/schemas";
import {
  createProviderAdapterAbiMetadata,
  createProviderAdapterRequestEnvelope,
  createProviderDiagnostics,
  createProviderToolResult,
  toProviderConnectorSuccessResponse,
} from "./providerAbi";
import type { ExtensionAdapter } from "./types";

const LLM_REFERENCE_PROVIDER = "provider.reference.llm";
const LLM_REFERENCE_TOOL_VERSION = "provider-reference-llm-v1";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const pickString = (
  payload: unknown,
  keys: readonly string[],
  fallback: string
): string => {
  if (!isRecord(payload)) return fallback;
  for (const key of keys) {
    const candidate = payload[key];
    if (typeof candidate !== "string") continue;
    const normalized = candidate.trim();
    if (normalized !== "") return normalized;
  }
  return fallback;
};

const pickLocale = (payload: unknown): string =>
  pickString(payload, ["locale", "lang"], "ko-KR");

const pickDraftText = (payload: unknown): string =>
  pickString(
    payload,
    ["text", "prompt", "rawText", "instruction"],
    "reference llm output"
  );

const createLlmNormalizedContent = (
  requestId: string,
  toolId: string,
  payload: unknown
): NormalizedContent => ({
  type: "NormalizedContent",
  version: "0.3.0-draft",
  metadata: {
    locale: pickLocale(payload),
    title: `provider:${toolId}`,
    tags: ["provider", "reference", "llm"],
  },
  blocks: [
    {
      id: `${requestId}-text-0`,
      kind: "text",
      text: pickDraftText(payload),
    },
  ],
  renderHints: {
    provider: LLM_REFERENCE_PROVIDER,
    deterministic: true,
    requestId,
  },
});

export const llmProviderAdapter: ExtensionAdapter = {
  adapterId: "provider.ref.llm",
  supports: ["llm"],
  providerAbi: createProviderAdapterAbiMetadata("llm", LLM_REFERENCE_PROVIDER),
  invoke: async (request) => {
    const requestEnvelope = createProviderAdapterRequestEnvelope(request, "llm");
    const normalized = createLlmNormalizedContent(
      requestEnvelope.requestId,
      requestEnvelope.toolId,
      requestEnvelope.payload
    );
    const toolResult = createProviderToolResult({
      request: requestEnvelope,
      normalized,
      toolVersion: LLM_REFERENCE_TOOL_VERSION,
      diagnostics: createProviderDiagnostics(requestEnvelope, {
        warnings: ["reference-llm-adapter"],
        extras: {
          provider: LLM_REFERENCE_PROVIDER,
          deterministic: true,
        },
      }),
    });

    return toProviderConnectorSuccessResponse(toolResult);
  },
  health: async () => ({ ok: true, detail: "provider reference llm adapter ready" }),
};
