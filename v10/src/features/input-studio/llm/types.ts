import type {
  NormalizedContent,
  ToolRegistryEntry,
  ToolResult,
} from "@core/foundation/schemas";
import type { ConnectorResolutionErrorCode } from "@core/runtime/plugin-runtime/connectors";
import type { DraftDiffResult } from "@features/input-studio/diff/types";
import type { StepBlockDraft } from "@features/layout/dataInput/types";

export const INPUT_STUDIO_LLM_DRAFT_TOOL_ID = "input-studio.llm-draft";
export const INPUT_STUDIO_LLM_DRAFT_ADAPTER_ID = "local.mock";

export const INPUT_STUDIO_LLM_DRAFT_TOOL_ENTRY: ToolRegistryEntry = {
  toolId: INPUT_STUDIO_LLM_DRAFT_TOOL_ID,
  category: "llm",
  inputSchema: {
    type: "object",
    required: ["prompt"],
    properties: {
      prompt: { type: "string" },
      locale: { type: "string" },
      rawText: { type: "string" },
    },
    additionalProperties: true,
  },
  outputSchema: {
    type: "object",
    required: ["type", "version", "metadata", "blocks"],
    properties: {
      type: { const: "NormalizedContent" },
      version: { type: "string" },
      metadata: { type: "object" },
      blocks: { type: "array" },
    },
    additionalProperties: true,
  },
  capabilities: {
    locales: ["ko-KR", "en-US"],
  },
  execution: {
    localRuntimeId: INPUT_STUDIO_LLM_DRAFT_ADAPTER_ID,
  },
  policy: {
    timeoutMs: 15_000,
    trustLevel: "sandbox",
    costTier: "local-mock",
  },
};

export type InputStudioLlmDraftRequest = {
  prompt: string;
  locale?: string;
  rawText?: string;
  meta?: Record<string, unknown>;
};

export type InputStudioLlmDraftCandidate = {
  toolId: string;
  adapterId: string;
  normalized: NormalizedContent;
  blocks: StepBlockDraft[];
  diff: DraftDiffResult;
  receivedAt: number;
};

export type InputStudioLlmDraftErrorCode =
  | ConnectorResolutionErrorCode
  | "invalid-prompt"
  | "invalid-normalized-content"
  | "unexpected-error";

export type InputStudioLlmDraftError = {
  code: InputStudioLlmDraftErrorCode;
  message: string;
};

export type InputStudioLlmDraftSuccess = {
  ok: true;
  candidate: InputStudioLlmDraftCandidate;
  toolResult: ToolResult<NormalizedContent>;
};

export type InputStudioLlmDraftFailure = {
  ok: false;
  error: InputStudioLlmDraftError;
};

export type InputStudioLlmDraftResult =
  | InputStudioLlmDraftSuccess
  | InputStudioLlmDraftFailure;

export type UseInputStudioLlmDraftOptions = {
  currentBlocks: StepBlockDraft[];
  fallbackLocale?: string;
};

export type UseInputStudioLlmDraftResult = {
  isRequesting: boolean;
  candidate: InputStudioLlmDraftCandidate | null;
  error: InputStudioLlmDraftError | null;
  requestDraft: (
    request: InputStudioLlmDraftRequest
  ) => Promise<InputStudioLlmDraftResult>;
  clearCandidate: () => void;
  clearError: () => void;
};
