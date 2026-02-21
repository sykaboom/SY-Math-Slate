import type { AudioAssetPayload } from "@core/foundation/schemas";
import {
  createProviderAdapterAbiMetadata,
  createProviderAdapterRequestEnvelope,
  createProviderDiagnostics,
  createProviderToolResult,
  toProviderConnectorSuccessResponse,
} from "./providerAbi";
import type { ExtensionAdapter } from "./types";

const AUDIO_REFERENCE_PROVIDER = "provider.reference.audio";
const AUDIO_REFERENCE_TOOL_VERSION = "provider-reference-audio-v1";

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

const pickLocale = (payload: unknown): string =>
  pickString(payload, ["locale", "lang"], "ko-KR");

const pickDescriptionText = (payload: unknown): string =>
  pickString(payload, ["text", "script", "prompt", "rawText"], "reference audio script");

const createAudioAssetUri = (payload: unknown, requestId: string): string =>
  pickString(
    payload,
    ["assetRef", "audioRef", "mediaRef", "uri"],
    `asset://audio/${requestId}.mp3`
  );

const createAudioAssetPayload = (
  requestId: string,
  toolId: string,
  payload: unknown
): AudioAssetPayload => {
  const durationMs = pickOptionalFiniteNumber(payload, ["durationMs", "duration"]);
  const sampleRateHz = pickOptionalFiniteNumber(payload, ["sampleRateHz", "sampleRate"]);
  const channels = pickOptionalFiniteNumber(payload, ["channels"]);
  const mimeType = pickString(payload, ["mimeType", "format"], "audio/mpeg");
  const uri = createAudioAssetUri(payload, requestId);
  const transcriptRef = pickString(payload, ["transcriptRef"], "");

  return {
    type: "AudioAssetPayload",
    version: "1.0",
    asset: {
      kind: "audio",
      assetId: `${requestId}-audio-0`,
      uri,
      mimeType,
      ...(durationMs !== null ? { durationMs } : {}),
      ...(sampleRateHz !== null ? { sampleRateHz } : {}),
      ...(channels !== null ? { channels } : {}),
      ...(transcriptRef !== "" ? { transcriptRef } : {}),
      metadata: {
        provider: AUDIO_REFERENCE_PROVIDER,
        locale: pickLocale(payload),
        toolId,
        description: pickDescriptionText(payload),
      },
    },
    metadata: {
      provider: AUDIO_REFERENCE_PROVIDER,
      deterministic: true,
      requestId,
      toolId,
      uri,
    },
  };
};

export const audioProviderAdapter: ExtensionAdapter = {
  adapterId: "provider.ref.audio",
  supports: ["tts"],
  providerAbi: createProviderAdapterAbiMetadata("audio", AUDIO_REFERENCE_PROVIDER),
  invoke: async (request) => {
    const requestEnvelope = createProviderAdapterRequestEnvelope(request, "audio");
    const normalized = createAudioAssetPayload(
      requestEnvelope.requestId,
      requestEnvelope.toolId,
      requestEnvelope.payload
    );
    const toolResult = createProviderToolResult({
      request: requestEnvelope,
      normalized,
      toolVersion: AUDIO_REFERENCE_TOOL_VERSION,
      diagnostics: createProviderDiagnostics(requestEnvelope, {
        warnings: ["reference-audio-adapter"],
        extras: {
          provider: AUDIO_REFERENCE_PROVIDER,
          deterministic: true,
        },
      }),
    });

    return toProviderConnectorSuccessResponse(toolResult);
  },
  health: async () => ({ ok: true, detail: "provider reference audio adapter ready" }),
};
