import type { ImageAssetPayload } from "@core/contracts";
import {
  createProviderAdapterAbiMetadata,
  createProviderAdapterRequestEnvelope,
  createProviderDiagnostics,
  createProviderToolResult,
  toProviderConnectorSuccessResponse,
} from "./providerAbi";
import type { ExtensionAdapter } from "./types";

const IMAGE_REFERENCE_PROVIDER = "provider.reference.image";
const IMAGE_REFERENCE_TOOL_VERSION = "provider-reference-image-v1";

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

const pickOptionalFiniteNumber = (
  payload: unknown,
  keys: readonly string[]
): number | null => {
  if (!isRecord(payload)) return null;
  for (const key of keys) {
    const candidate = payload[key];
    if (typeof candidate === "number" && Number.isFinite(candidate)) {
      return candidate;
    }
  }
  return null;
};

const createImageAssetUri = (payload: unknown, requestId: string): string =>
  pickString(
    payload,
    ["mediaRef", "assetRef", "imageRef", "uri"],
    `asset://image/${requestId}.png`
  );

const pickLocale = (payload: unknown): string =>
  pickString(payload, ["locale", "lang"], "ko-KR");

const createImageAssetPayload = (
  requestId: string,
  toolId: string,
  payload: unknown
): ImageAssetPayload => {
  const width = pickOptionalFiniteNumber(payload, ["width", "w"]);
  const height = pickOptionalFiniteNumber(payload, ["height", "h"]);
  const altText = pickString(payload, ["altText", "prompt", "text"], "");
  const mimeType = pickString(payload, ["mimeType", "format"], "image/png");
  const uri = createImageAssetUri(payload, requestId);

  return {
    type: "ImageAssetPayload",
    version: "1.0",
    asset: {
      kind: "image",
      assetId: `${requestId}-image-0`,
      uri,
      mimeType,
      ...(width !== null ? { width } : {}),
      ...(height !== null ? { height } : {}),
      ...(altText !== "" ? { altText } : {}),
      metadata: {
        provider: IMAGE_REFERENCE_PROVIDER,
        locale: pickLocale(payload),
        toolId,
      },
    },
    metadata: {
      provider: IMAGE_REFERENCE_PROVIDER,
      deterministic: true,
      requestId,
      toolId,
      uri,
    },
  };
};

export const imageProviderAdapter: ExtensionAdapter = {
  adapterId: "provider.ref.image",
  supports: ["renderer"],
  providerAbi: createProviderAdapterAbiMetadata("image", IMAGE_REFERENCE_PROVIDER),
  invoke: async (request) => {
    const requestEnvelope = createProviderAdapterRequestEnvelope(request, "image");
    const normalized = createImageAssetPayload(
      requestEnvelope.requestId,
      requestEnvelope.toolId,
      requestEnvelope.payload
    );
    const toolResult = createProviderToolResult({
      request: requestEnvelope,
      normalized,
      toolVersion: IMAGE_REFERENCE_TOOL_VERSION,
      diagnostics: createProviderDiagnostics(requestEnvelope, {
        warnings: ["reference-image-adapter"],
        extras: {
          provider: IMAGE_REFERENCE_PROVIDER,
          deterministic: true,
        },
      }),
    });

    return toProviderConnectorSuccessResponse(toolResult);
  },
  health: async () => ({ ok: true, detail: "provider reference image adapter ready" }),
};
