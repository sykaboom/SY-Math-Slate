import type { ToolRegistryCapabilities, ToolRegistryCategory } from "@core/contracts";

import type {
  CapabilityRouterAuditSummary,
  CapabilityRouterCandidate,
  CapabilityRouterDecision,
  CapabilityRouterRankedCandidate,
  CapabilityRouterRejectionReason,
  CapabilityRouterRequest,
} from "./types";

const DEFAULT_ESTIMATED_COST_USD = 1_000;
const DEFAULT_ESTIMATED_LATENCY_MS = 10_000;

const COST_TIER_HINTS: Record<string, number> = {
  free: 0,
  local: 0,
  "local-mock": 0,
  low: 0.01,
  medium: 0.1,
  high: 1,
  premium: 3,
};

const LATENCY_TIER_HINTS: Record<string, number> = {
  low: 120,
  medium: 500,
  high: 1_500,
};

const supportsCategory = (
  candidateSupports: ToolRegistryCategory[],
  category: ToolRegistryCategory
): boolean => candidateSupports.includes(category);

const toFiniteNonNegative = (value: unknown): number | null => {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return null;
  }
  return value;
};

const normalizeToken = (value: string): string => value.trim().toLowerCase();

const normalizeOptionalToken = (value: string | undefined): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed === "") return null;
  return normalizeToken(trimmed);
};

const matchesTokenAllowList = (
  allowList: string[] | undefined,
  requested: string | null
): boolean => {
  if (!requested) return true;
  if (!allowList || allowList.length === 0) return true;
  return allowList.some((entry) => normalizeToken(entry) === requested);
};

const isLimitExceeded = (
  requested: number | undefined,
  maxSupported: unknown
): boolean => {
  if (requested === undefined) return false;
  const max = toFiniteNonNegative(maxSupported);
  if (max === null) return false;
  return requested > max;
};

const resolveRejectionReason = (
  candidate: CapabilityRouterCandidate,
  request: CapabilityRouterRequest
): CapabilityRouterRejectionReason | null => {
  const adapterId = candidate.adapterId.trim();
  if (adapterId === "") return "empty-adapter-id";

  if (!supportsCategory(candidate.supports, request.tool.category)) {
    return "unsupported-category";
  }

  const locale = normalizeOptionalToken(request.request?.locale);
  if (!matchesTokenAllowList(candidate.capabilities?.locales, locale)) {
    return "locale-mismatch";
  }

  const mediaType = normalizeOptionalToken(request.request?.mediaType);
  if (!matchesTokenAllowList(candidate.capabilities?.mediaTypes, mediaType)) {
    return "media-type-mismatch";
  }

  if (
    isLimitExceeded(
      request.request?.inputTokens,
      candidate.capabilities?.maxInputTokens
    )
  ) {
    return "input-limit-exceeded";
  }

  if (
    isLimitExceeded(
      request.request?.outputTokens,
      candidate.capabilities?.maxOutputTokens
    )
  ) {
    return "output-limit-exceeded";
  }

  if (
    isLimitExceeded(
      request.request?.assetBytes,
      candidate.capabilities?.maxAssetBytes
    )
  ) {
    return "asset-limit-exceeded";
  }

  return null;
};

const estimateCostUsd = (candidate: CapabilityRouterCandidate): number => {
  const explicit = toFiniteNonNegative(candidate.hints?.estimatedCostUsd);
  if (explicit !== null) return explicit;

  const tier = normalizeOptionalToken(candidate.hints?.costTier);
  if (tier && COST_TIER_HINTS[tier] !== undefined) {
    return COST_TIER_HINTS[tier];
  }

  return DEFAULT_ESTIMATED_COST_USD;
};

const estimateLatencyMs = (candidate: CapabilityRouterCandidate): number => {
  const explicit = toFiniteNonNegative(candidate.hints?.estimatedLatencyMs);
  if (explicit !== null) return explicit;

  const tier = normalizeOptionalToken(candidate.hints?.latencyTier);
  if (tier && LATENCY_TIER_HINTS[tier] !== undefined) {
    return LATENCY_TIER_HINTS[tier];
  }

  return DEFAULT_ESTIMATED_LATENCY_MS;
};

const scoreCapabilityFitness = (
  capabilities: ToolRegistryCapabilities | undefined,
  request: CapabilityRouterRequest
): number => {
  let score = 1_000;

  if (request.request?.locale) {
    score += Array.isArray(capabilities?.locales) ? 20 : 10;
  }

  if (request.request?.mediaType) {
    score += Array.isArray(capabilities?.mediaTypes) ? 20 : 10;
  }

  if (request.request?.inputTokens !== undefined) {
    score += typeof capabilities?.maxInputTokens === "number" ? 5 : 2;
  }

  if (request.request?.outputTokens !== undefined) {
    score += typeof capabilities?.maxOutputTokens === "number" ? 5 : 2;
  }

  if (request.request?.assetBytes !== undefined) {
    score += typeof capabilities?.maxAssetBytes === "number" ? 5 : 2;
  }

  return score;
};

const toRankedCandidate = (
  candidate: CapabilityRouterCandidate,
  request: CapabilityRouterRequest
): CapabilityRouterRankedCandidate => {
  const rejectionReason = resolveRejectionReason(candidate, request);
  const eligible = rejectionReason === null;

  return {
    adapterId: candidate.adapterId,
    eligible,
    capabilityScore: eligible
      ? scoreCapabilityFitness(candidate.capabilities, request)
      : 0,
    estimatedCostUsd: estimateCostUsd(candidate),
    estimatedLatencyMs: estimateLatencyMs(candidate),
    rejectionReason: rejectionReason ?? undefined,
  };
};

const compareRankedCandidates = (
  left: CapabilityRouterRankedCandidate,
  right: CapabilityRouterRankedCandidate
): number => {
  if (left.eligible !== right.eligible) {
    return left.eligible ? -1 : 1;
  }
  if (left.capabilityScore !== right.capabilityScore) {
    return right.capabilityScore - left.capabilityScore;
  }
  if (left.estimatedCostUsd !== right.estimatedCostUsd) {
    return left.estimatedCostUsd - right.estimatedCostUsd;
  }
  if (left.estimatedLatencyMs !== right.estimatedLatencyMs) {
    return left.estimatedLatencyMs - right.estimatedLatencyMs;
  }
  return left.adapterId.localeCompare(right.adapterId);
};

export const routeAdapterByCapabilityCostLatency = (
  request: CapabilityRouterRequest
): CapabilityRouterDecision => {
  if (request.candidates.length === 0) {
    return {
      selectedAdapterId: null,
      reason: "no-candidates",
      fallbackUsed: false,
      rankedCandidates: [],
    };
  }

  const rankedCandidates = request.candidates
    .map((candidate) => toRankedCandidate(candidate, request))
    .sort(compareRankedCandidates);

  const bestEligible = rankedCandidates.find((candidate) => candidate.eligible);
  if (bestEligible) {
    return {
      selectedAdapterId: bestEligible.adapterId,
      reason: "ranked-selection",
      fallbackUsed: false,
      rankedCandidates,
    };
  }

  const fallbackAdapterId = request.fallbackAdapterId?.trim();
  if (fallbackAdapterId) {
    const fallbackCandidate = rankedCandidates.find(
      (candidate) => candidate.adapterId === fallbackAdapterId
    );

    if (fallbackCandidate) {
      return {
        selectedAdapterId: fallbackCandidate.adapterId,
        reason: "fallback-selection",
        fallbackUsed: true,
        rankedCandidates,
      };
    }
  }

  return {
    selectedAdapterId: null,
    reason: "no-eligible-candidate",
    fallbackUsed: false,
    rankedCandidates,
  };
};

export const toCapabilityRouterAuditSummary = (
  decision: CapabilityRouterDecision,
  maxCandidates = 8
): CapabilityRouterAuditSummary => {
  const boundedMax = Number.isFinite(maxCandidates)
    ? Math.max(1, Math.min(25, Math.trunc(maxCandidates)))
    : 8;

  return {
    selectedAdapterId: decision.selectedAdapterId,
    reason: decision.reason,
    fallbackUsed: decision.fallbackUsed,
    candidateCount: decision.rankedCandidates.length,
    rankedCandidates: decision.rankedCandidates.slice(0, boundedMax),
  };
};
