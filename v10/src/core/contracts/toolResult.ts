import type { NormalizedContent } from "./normalizedContent";
import { validateNormalizedContent } from "./normalizedContent";
import type { MultimodalAssetPayload } from "./multimodalAsset";
import { validateMultimodalAssetPayload } from "./multimodalAsset";
import type { RenderPlan } from "./renderPlan";
import { validateRenderPlan } from "./renderPlan";
import type { TTSScript } from "./ttsScript";
import { validateTTSScript } from "./ttsScript";

export type ToolResultStatus = "ok" | "error" | "partial";

export type ToolResultDiagnostics = {
  latencyMs?: number;
  costUsd?: number;
  warnings?: string[];
  [key: string]: unknown;
};

export type KnownNormalizedPayload =
  | NormalizedContent
  | RenderPlan
  | TTSScript
  | MultimodalAssetPayload;

export type ToolResult<TNormalized = KnownNormalizedPayload> = {
  toolId: string;
  toolVersion: string;
  status: ToolResultStatus;
  raw: unknown;
  normalized: TNormalized;
  diagnostics: ToolResultDiagnostics;
};

export type ToolResultValidationError = {
  ok: false;
  code: string;
  message: string;
  path: string;
};

export type ToolResultValidationSuccess = {
  ok: true;
  value: ToolResult<KnownNormalizedPayload>;
};

export type ToolResultValidationResult =
  | ToolResultValidationSuccess
  | ToolResultValidationError;

export type KnownNormalizedValidationError = {
  ok: false;
  code: string;
  message: string;
  path: string;
};

export type KnownNormalizedValidationSuccess = {
  ok: true;
  value: KnownNormalizedPayload;
};

export type KnownNormalizedValidationResult =
  | KnownNormalizedValidationSuccess
  | KnownNormalizedValidationError;

const VALID_TOOL_STATUS = new Set<ToolResultStatus>(["ok", "error", "partial"]);

const fail = (
  code: string,
  message: string,
  path: string
): ToolResultValidationError => ({
  ok: false,
  code,
  message,
  path,
});

const ok = (
  value: ToolResult<KnownNormalizedPayload>
): ToolResultValidationSuccess => ({
  ok: true,
  value,
});

const failKnown = (
  code: string,
  message: string,
  path: string
): KnownNormalizedValidationError => ({
  ok: false,
  code,
  message,
  path,
});

const okKnown = (value: KnownNormalizedPayload): KnownNormalizedValidationSuccess => ({
  ok: true,
  value,
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const validateKnownNormalizedPayload = (
  value: unknown
): KnownNormalizedValidationResult => {
  if (!isRecord(value)) {
    return failKnown(
      "invalid-normalized-root",
      "normalized payload must be an object.",
      "root"
    );
  }
  if (typeof value.type !== "string") {
    return failKnown(
      "invalid-normalized-type",
      "normalized.type must be a string discriminator.",
      "type"
    );
  }

  if (value.type === "NormalizedContent") {
    const validated = validateNormalizedContent(value);
    if (validated.ok === false) {
      return failKnown(validated.code, validated.message, validated.path);
    }
    return okKnown(validated.value);
  }
  if (value.type === "RenderPlan") {
    const validated = validateRenderPlan(value);
    if (validated.ok === false) {
      return failKnown(validated.code, validated.message, validated.path);
    }
    return okKnown(validated.value);
  }
  if (value.type === "TTSScript") {
    const validated = validateTTSScript(value);
    if (validated.ok === false) {
      return failKnown(validated.code, validated.message, validated.path);
    }
    return okKnown(validated.value);
  }

  if (
    value.type === "ImageAssetPayload" ||
    value.type === "VideoAssetPayload" ||
    value.type === "AudioAssetPayload"
  ) {
    const multimodalValidated = validateMultimodalAssetPayload(value);
    if (multimodalValidated.ok === false) {
      return failKnown(
        multimodalValidated.code,
        multimodalValidated.message,
        multimodalValidated.path
      );
    }
    return okKnown(multimodalValidated.value);
  }

  return failKnown(
    "unsupported-normalized-type",
    "normalized.type must be one of NormalizedContent/RenderPlan/TTSScript/ImageAssetPayload/VideoAssetPayload/AudioAssetPayload.",
    "type"
  );
};

export const isKnownNormalizedPayload = (
  value: unknown
): value is KnownNormalizedPayload => validateKnownNormalizedPayload(value).ok;

export const validateToolResult = (value: unknown): ToolResultValidationResult => {
  if (!isRecord(value)) {
    return fail("invalid-root", "ToolResult must be an object.", "root");
  }
  if (typeof value.toolId !== "string" || value.toolId.trim() === "") {
    return fail(
      "invalid-tool-id",
      "toolId must be a non-empty string.",
      "toolId"
    );
  }
  if (
    typeof value.toolVersion !== "string" ||
    value.toolVersion.trim() === ""
  ) {
    return fail(
      "invalid-tool-version",
      "toolVersion must be a non-empty string.",
      "toolVersion"
    );
  }
  if (
    typeof value.status !== "string" ||
    !VALID_TOOL_STATUS.has(value.status as ToolResultStatus)
  ) {
    return fail(
      "invalid-status",
      "status must be one of ok/error/partial.",
      "status"
    );
  }
  if (!("raw" in value)) {
    return fail("missing-raw", "raw field is required.", "raw");
  }
  if (!("normalized" in value)) {
    return fail(
      "missing-normalized",
      "normalized field is required.",
      "normalized"
    );
  }
  const normalizedValidation = validateKnownNormalizedPayload(value.normalized);
  if (normalizedValidation.ok === false) {
    return fail(
      "invalid-normalized",
      `${normalizedValidation.code}: ${normalizedValidation.message}`,
      `normalized.${normalizedValidation.path}`
    );
  }
  if (!isRecord(value.diagnostics)) {
    return fail(
      "invalid-diagnostics",
      "diagnostics must be an object.",
      "diagnostics"
    );
  }
  if (
    value.diagnostics.warnings !== undefined &&
    (!Array.isArray(value.diagnostics.warnings) ||
      value.diagnostics.warnings.some((item) => typeof item !== "string"))
  ) {
    return fail(
      "invalid-diagnostics-warnings",
      "diagnostics.warnings must be an array of strings.",
      "diagnostics.warnings"
    );
  }
  if (
    value.diagnostics.latencyMs !== undefined &&
    typeof value.diagnostics.latencyMs !== "number"
  ) {
    return fail(
      "invalid-diagnostics-latency",
      "diagnostics.latencyMs must be a number when provided.",
      "diagnostics.latencyMs"
    );
  }
  if (
    value.diagnostics.costUsd !== undefined &&
    typeof value.diagnostics.costUsd !== "number"
  ) {
    return fail(
      "invalid-diagnostics-cost",
      "diagnostics.costUsd must be a number when provided.",
      "diagnostics.costUsd"
    );
  }

  return ok({
    ...(value as Omit<ToolResult<KnownNormalizedPayload>, "normalized">),
    normalized: normalizedValidation.value,
  });
};

export const isToolResult = (
  value: unknown
): value is ToolResult<KnownNormalizedPayload> => validateToolResult(value).ok;
