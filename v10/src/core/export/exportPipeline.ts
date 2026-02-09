import {
  isPersistedSlateDocLike,
  mapPersistedDocToNormalizedContent,
  type KnownNormalizedPayload,
  type NormalizedContent,
  type NormalizedContentValidationResult,
  type PersistedDocMapOptions,
  type ToolResult,
  validateNormalizedContent,
  validateToolResult,
} from "@core/contracts";

export type ExportPayload = {
  data: unknown;
  normalizedContent?: NormalizedContent;
  toolResult?: ToolResult<unknown>;
};

export type ExportResult = {
  ok: boolean;
  blob?: Blob;
  error?: Error;
};

export type ExportProvider = {
  name: string;
  supportsAudio: boolean;
  supportsVideo: boolean;
  export: (payload: ExportPayload) => Promise<ExportResult>;
};

export const exportProviders: ExportProvider[] = [];

const failNormalized = (
  code: string,
  message: string,
  path: string
): NormalizedContentValidationResult => ({
  ok: false,
  code,
  message,
  path,
});

export const resolveNormalizedContentForExport = (
  payload: ExportPayload,
  options?: PersistedDocMapOptions
): NormalizedContentValidationResult => {
  if (payload.normalizedContent) {
    return validateNormalizedContent(payload.normalizedContent);
  }

  if (payload.toolResult) {
    const toolResultValidation = validateToolResult(payload.toolResult);
    if (!toolResultValidation.ok) {
      return failNormalized(
        "invalid-tool-result",
        `${toolResultValidation.code}: ${toolResultValidation.message}`,
        `toolResult.${toolResultValidation.path}`
      );
    }
    const normalizedPayload: KnownNormalizedPayload =
      toolResultValidation.value.normalized;
    if (normalizedPayload.type !== "NormalizedContent") {
      return failNormalized(
        "unsupported-normalized-type",
        `Export pipeline requires NormalizedContent, received ${normalizedPayload.type}.`,
        "toolResult.normalized.type"
      );
    }
    return validateNormalizedContent(normalizedPayload);
  }

  if (!isPersistedSlateDocLike(payload.data)) {
    return failNormalized(
      "invalid-export-data",
      "Export payload must provide normalizedContent, toolResult, or PersistedSlateDoc-compatible data.",
      "data"
    );
  }

  return mapPersistedDocToNormalizedContent(payload.data, options);
};
