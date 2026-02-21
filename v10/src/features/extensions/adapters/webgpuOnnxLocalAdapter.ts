import type { NormalizedContent } from "@core/foundation/schemas";
import {
  createProviderAdapterAbiMetadata,
  createProviderAdapterRequestEnvelope,
  createProviderDiagnostics,
  createProviderToolResult,
  toProviderConnectorSuccessResponse,
} from "./providerAbi";
import type { ExtensionAdapter } from "./types";

const WEBGPU_ONNX_LOCAL_ADAPTER_ID = "local.webgpu-onnx";
const WEBGPU_ONNX_LOCAL_PROVIDER = "provider.local.webgpu-onnx";
const WEBGPU_ONNX_LOCAL_TOOL_VERSION = "local-webgpu-onnx-adapter-v1";
const WEBGPU_ONNX_ENDPOINT_KEYS = ["endpoint", "baseUrl", "baseURL", "url", "host"] as const;
const WEBGPU_ONNX_MODEL_KEYS = ["model", "modelId", "modelName"] as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const pickNonEmptyString = (
  source: unknown,
  keys: readonly string[]
): string | null => {
  if (!isRecord(source)) return null;
  for (const key of keys) {
    const candidate = source[key];
    if (typeof candidate !== "string") continue;
    const normalized = candidate.trim();
    if (normalized !== "") return normalized;
  }
  return null;
};

const pickConfigValue = (
  meta: Record<string, unknown>,
  payload: unknown,
  keys: readonly string[]
): string | null =>
  pickNonEmptyString(meta, keys) ??
  pickNonEmptyString(meta.local, keys) ??
  pickNonEmptyString(meta.config, keys) ??
  pickNonEmptyString(payload, keys) ??
  pickNonEmptyString(isRecord(payload) ? payload.local : null, keys) ??
  pickNonEmptyString(isRecord(payload) ? payload.config : null, keys);

const pickLocale = (payload: unknown): string =>
  pickNonEmptyString(payload, ["locale", "lang"]) ?? "ko-KR";

const pickPromptText = (payload: unknown): string =>
  pickNonEmptyString(payload, ["prompt", "text", "instruction", "input"]) ??
  "local webgpu onnx adapter output";

const createNormalizedContent = (
  requestId: string,
  toolId: string,
  payload: unknown,
  endpoint: string,
  model: string
): NormalizedContent => ({
  type: "NormalizedContent",
  version: "0.3.0-draft",
  metadata: {
    locale: pickLocale(payload),
    title: `local:${toolId}`,
    tags: ["provider", "local", "llm", "webgpu-onnx"],
  },
  blocks: [
    {
      id: `${requestId}-text-0`,
      kind: "text",
      text: pickPromptText(payload),
    },
  ],
  renderHints: {
    provider: WEBGPU_ONNX_LOCAL_PROVIDER,
    adapterId: WEBGPU_ONNX_LOCAL_ADAPTER_ID,
    runtime: "local",
    endpoint,
    model,
    deterministic: true,
    requestId,
  },
});

const createMissingConfigError = (missing: readonly string[]) => ({
  ok: false as const,
  error: `${WEBGPU_ONNX_LOCAL_ADAPTER_ID} missing required config: ${missing.join(", ")}.`,
});

export const webgpuOnnxLocalAdapter: ExtensionAdapter = {
  adapterId: WEBGPU_ONNX_LOCAL_ADAPTER_ID,
  supports: ["llm"],
  providerAbi: createProviderAdapterAbiMetadata("llm", WEBGPU_ONNX_LOCAL_PROVIDER),
  invoke: async (request) => {
    const requestEnvelope = createProviderAdapterRequestEnvelope(request, "llm");

    const endpoint = pickConfigValue(
      requestEnvelope.meta,
      requestEnvelope.payload,
      WEBGPU_ONNX_ENDPOINT_KEYS
    );
    const model = pickConfigValue(
      requestEnvelope.meta,
      requestEnvelope.payload,
      WEBGPU_ONNX_MODEL_KEYS
    );

    if (!endpoint || !model) {
      const missing: string[] = [];
      if (!endpoint) missing.push("endpoint");
      if (!model) missing.push("model");
      return createMissingConfigError(missing);
    }

    const normalized = createNormalizedContent(
      requestEnvelope.requestId,
      requestEnvelope.toolId,
      requestEnvelope.payload,
      endpoint,
      model
    );
    const toolResult = createProviderToolResult({
      request: requestEnvelope,
      normalized,
      toolVersion: WEBGPU_ONNX_LOCAL_TOOL_VERSION,
      diagnostics: createProviderDiagnostics(requestEnvelope, {
        warnings: ["local-webgpu-onnx-adapter-simulated"],
        extras: {
          provider: WEBGPU_ONNX_LOCAL_PROVIDER,
          adapterId: WEBGPU_ONNX_LOCAL_ADAPTER_ID,
          runtime: "local",
          endpoint,
          model,
          deterministic: true,
        },
      }),
    });

    return toProviderConnectorSuccessResponse(toolResult);
  },
  health: async () => ({ ok: true, detail: "local webgpu onnx adapter ready" }),
};
