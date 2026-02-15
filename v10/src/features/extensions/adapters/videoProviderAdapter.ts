import type { VideoAssetPayload } from "@core/contracts";
import {
  createProviderAdapterAbiMetadata,
  createProviderAdapterRequestEnvelope,
  createProviderDiagnostics,
  createProviderToolResult,
  toProviderConnectorSuccessResponse,
} from "./providerAbi";
import type { ExtensionAdapter } from "./types";

const VIDEO_REFERENCE_PROVIDER = "provider.reference.video";
const VIDEO_REFERENCE_TOOL_VERSION = "provider-reference-video-v1";

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

const createVideoAssetUri = (payload: unknown, requestId: string): string =>
  pickString(
    payload,
    ["mediaRef", "assetRef", "videoRef", "uri"],
    `asset://video/${requestId}.mp4`
  );

const pickLocale = (payload: unknown): string =>
  pickString(payload, ["locale", "lang"], "ko-KR");

const createVideoAssetPayload = (
  requestId: string,
  toolId: string,
  payload: unknown
): VideoAssetPayload => {
  const width = pickOptionalFiniteNumber(payload, ["width", "w"]);
  const height = pickOptionalFiniteNumber(payload, ["height", "h"]);
  const durationMs = pickOptionalFiniteNumber(payload, ["durationMs", "duration"]);
  const frameRate = pickOptionalFiniteNumber(payload, ["frameRate", "fps"]);
  const mimeType = pickString(payload, ["mimeType", "format"], "video/mp4");
  const uri = createVideoAssetUri(payload, requestId);

  return {
    type: "VideoAssetPayload",
    version: "1.0",
    asset: {
      kind: "video",
      assetId: `${requestId}-video-0`,
      uri,
      mimeType,
      ...(durationMs !== null ? { durationMs } : {}),
      ...(width !== null ? { width } : {}),
      ...(height !== null ? { height } : {}),
      ...(frameRate !== null ? { frameRate } : {}),
      metadata: {
        provider: VIDEO_REFERENCE_PROVIDER,
        locale: pickLocale(payload),
        toolId,
      },
    },
    metadata: {
      provider: VIDEO_REFERENCE_PROVIDER,
      deterministic: true,
      requestId,
      toolId,
      uri,
    },
  };
};

export const videoProviderAdapter: ExtensionAdapter = {
  adapterId: "provider.ref.video",
  supports: ["renderer"],
  providerAbi: createProviderAdapterAbiMetadata("video", VIDEO_REFERENCE_PROVIDER),
  invoke: async (request) => {
    const requestEnvelope = createProviderAdapterRequestEnvelope(request, "video");
    const normalized = createVideoAssetPayload(
      requestEnvelope.requestId,
      requestEnvelope.toolId,
      requestEnvelope.payload
    );
    const toolResult = createProviderToolResult({
      request: requestEnvelope,
      normalized,
      toolVersion: VIDEO_REFERENCE_TOOL_VERSION,
      diagnostics: createProviderDiagnostics(requestEnvelope, {
        warnings: ["reference-video-adapter"],
        extras: {
          provider: VIDEO_REFERENCE_PROVIDER,
          deterministic: true,
        },
      }),
    });

    return toProviderConnectorSuccessResponse(toolResult);
  },
  health: async () => ({ ok: true, detail: "provider reference video adapter ready" }),
};
