import type {
  ToolRegistryCapabilities,
  ToolRegistryCategory,
  ToolRegistryEntry,
} from "@core/contracts";

export type CapabilityRoutingHints = {
  estimatedCostUsd?: number;
  estimatedLatencyMs?: number;
  costTier?: string;
  latencyTier?: "low" | "medium" | "high";
};

export type CapabilityRouterCandidate = {
  adapterId: string;
  supports: ToolRegistryCategory[];
  capabilities?: ToolRegistryCapabilities;
  hints?: CapabilityRoutingHints;
};

export type CapabilityRouterRequestShape = {
  locale?: string;
  mediaType?: string;
  inputTokens?: number;
  outputTokens?: number;
  assetBytes?: number;
};

export type CapabilityRouterTool = Pick<
  ToolRegistryEntry,
  "toolId" | "category" | "capabilities" | "policy"
>;

export type CapabilityRouterRequest = {
  tool: CapabilityRouterTool;
  candidates: CapabilityRouterCandidate[];
  request?: CapabilityRouterRequestShape;
  fallbackAdapterId?: string;
};

export type CapabilityRouterRejectionReason =
  | "unsupported-category"
  | "locale-mismatch"
  | "media-type-mismatch"
  | "input-limit-exceeded"
  | "output-limit-exceeded"
  | "asset-limit-exceeded"
  | "empty-adapter-id";

export type CapabilityRouterRankedCandidate = {
  adapterId: string;
  eligible: boolean;
  capabilityScore: number;
  estimatedCostUsd: number;
  estimatedLatencyMs: number;
  rejectionReason?: CapabilityRouterRejectionReason;
};

export type CapabilityRouterDecisionReason =
  | "ranked-selection"
  | "fallback-selection"
  | "no-eligible-candidate"
  | "no-candidates";

export type CapabilityRouterDecision = {
  selectedAdapterId: string | null;
  reason: CapabilityRouterDecisionReason;
  fallbackUsed: boolean;
  rankedCandidates: CapabilityRouterRankedCandidate[];
};

export type CapabilityRouterAuditSummary = {
  selectedAdapterId: string | null;
  reason: CapabilityRouterDecisionReason;
  fallbackUsed: boolean;
  candidateCount: number;
  rankedCandidates: Array<{
    adapterId: string;
    eligible: boolean;
    capabilityScore: number;
    estimatedCostUsd: number;
    estimatedLatencyMs: number;
    rejectionReason?: CapabilityRouterRejectionReason;
  }>;
};
