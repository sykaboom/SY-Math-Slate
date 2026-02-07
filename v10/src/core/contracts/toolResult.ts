export type ToolResultStatus = "ok" | "error" | "partial";

export type ToolResultDiagnostics = {
  latencyMs?: number;
  costUsd?: number;
  warnings?: string[];
  [key: string]: unknown;
};

export type ToolResult<TNormalized = unknown> = {
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
  value: ToolResult<unknown>;
};

export type ToolResultValidationResult =
  | ToolResultValidationSuccess
  | ToolResultValidationError;

const VALID_TOOL_STATUS = new Set<ToolResultStatus>(["ok", "error", "partial"]);

const fail = (code: string, message: string, path: string): ToolResultValidationError => ({
  ok: false,
  code,
  message,
  path,
});

const ok = (value: ToolResult<unknown>): ToolResultValidationSuccess => ({
  ok: true,
  value,
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

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
  if (typeof value.toolVersion !== "string" || value.toolVersion.trim() === "") {
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

  return ok(value as ToolResult<unknown>);
};

export const isToolResult = (value: unknown): value is ToolResult<unknown> =>
  validateToolResult(value).ok;
