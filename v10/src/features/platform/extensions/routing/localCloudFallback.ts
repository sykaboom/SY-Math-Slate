import type {
  LocalCloudFallbackAuditSummary,
  LocalCloudFallbackCandidate,
  LocalCloudFallbackChainEntry,
  LocalCloudFallbackDecision,
  LocalCloudFallbackHealthHint,
  LocalCloudFallbackHealthState,
  LocalCloudFallbackRequest,
} from "./types";

const DEFAULT_ESTIMATED_COST_USD = 1_000;
const DEFAULT_ESTIMATED_LATENCY_MS = 10_000;

const normalizeAdapterId = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
};

const toFiniteNonNegative = (value: unknown): number | null => {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return null;
  }
  return value;
};

const normalizeHealthState = (value: unknown): LocalCloudFallbackHealthState | null => {
  if (typeof value !== "string") return null;
  const token = value.trim().toLowerCase();
  switch (token) {
    case "healthy":
    case "degraded":
    case "unhealthy":
    case "unknown":
      return token;
    default:
      return null;
  }
};

const resolveHealthState = (
  hint: LocalCloudFallbackHealthHint
): LocalCloudFallbackHealthState => {
  const state = normalizeHealthState(hint.state);
  if (state) return state;
  if (typeof hint.healthy === "boolean") {
    return hint.healthy ? "healthy" : "unhealthy";
  }
  return "unknown";
};

const looksLikeLocalAdapter = (adapterId: string): boolean => {
  const normalized = adapterId.toLowerCase();
  return (
    normalized.startsWith("local.") ||
    normalized.startsWith("mcp:local") ||
    normalized.startsWith("endpoint:local")
  );
};

const normalizePreferredLocalAdapterIds = (adapterIds: string[] | undefined): string[] => {
  if (!adapterIds || adapterIds.length === 0) return [];

  const seen = new Set<string>();
  const normalized: string[] = [];

  adapterIds.forEach((adapterId) => {
    const normalizedAdapterId = normalizeAdapterId(adapterId);
    if (!normalizedAdapterId || seen.has(normalizedAdapterId)) return;
    seen.add(normalizedAdapterId);
    normalized.push(normalizedAdapterId);
  });

  return normalized;
};

const normalizeHealthHints = (
  healthHints: LocalCloudFallbackHealthHint[] | undefined
): Map<string, LocalCloudFallbackHealthState> => {
  const normalized = new Map<string, LocalCloudFallbackHealthState>();
  if (!healthHints || healthHints.length === 0) {
    return normalized;
  }

  healthHints.forEach((hint) => {
    const adapterId = normalizeAdapterId(hint.adapterId);
    if (!adapterId || normalized.has(adapterId)) return;
    normalized.set(adapterId, resolveHealthState(hint));
  });

  return normalized;
};

const toOrderedSourceEntries = (
  candidates: LocalCloudFallbackCandidate[],
  preferredLocalAdapterIds: string[],
  healthHintByAdapterId: Map<string, LocalCloudFallbackHealthState>
): LocalCloudFallbackChainEntry[] => {
  const preferredLocalSet = new Set(preferredLocalAdapterIds);
  const deduped: LocalCloudFallbackChainEntry[] = [];
  const seen = new Set<string>();

  candidates.forEach((candidate) => {
    const adapterId = normalizeAdapterId(candidate.adapterId);
    if (!adapterId || seen.has(adapterId)) return;
    seen.add(adapterId);

    const preferredLocal = preferredLocalSet.has(adapterId);
    const healthState = healthHintByAdapterId.get(adapterId) ?? "unknown";

    deduped.push({
      adapterId,
      isLocal:
        typeof candidate.isLocal === "boolean"
          ? candidate.isLocal
          : preferredLocal || looksLikeLocalAdapter(adapterId),
      preferredLocal,
      eligible: candidate.eligible !== false,
      healthState,
      healthHinted: healthHintByAdapterId.has(adapterId),
      estimatedCostUsd:
        toFiniteNonNegative(candidate.estimatedCostUsd) ?? DEFAULT_ESTIMATED_COST_USD,
      estimatedLatencyMs:
        toFiniteNonNegative(candidate.estimatedLatencyMs) ??
        DEFAULT_ESTIMATED_LATENCY_MS,
    });
  });

  if (deduped.length === 0) return [];

  const entryById = new Map<string, LocalCloudFallbackChainEntry>();
  deduped.forEach((entry) => {
    entryById.set(entry.adapterId, entry);
  });

  const consumed = new Set<string>();
  const preferredLocalEntries: LocalCloudFallbackChainEntry[] = [];
  preferredLocalAdapterIds.forEach((preferredAdapterId) => {
    const entry = entryById.get(preferredAdapterId);
    if (!entry || !entry.isLocal || consumed.has(preferredAdapterId)) return;
    consumed.add(preferredAdapterId);
    preferredLocalEntries.push(entry);
  });

  const remainingLocalEntries = deduped.filter(
    (entry) => entry.isLocal && !consumed.has(entry.adapterId)
  );
  const cloudEntries = deduped.filter((entry) => !entry.isLocal);

  return [...preferredLocalEntries, ...remainingLocalEntries, ...cloudEntries];
};

const isSelectableByHealth = (entry: LocalCloudFallbackChainEntry): boolean =>
  entry.eligible && entry.healthState !== "unhealthy";

const resolveSelectionReason = (
  selected: LocalCloudFallbackChainEntry,
  orderedChain: LocalCloudFallbackChainEntry[]
): LocalCloudFallbackDecision["reason"] => {
  if (selected.isLocal) {
    return "local-first-selected";
  }

  const hasLocalCandidates = orderedChain.some((entry) => entry.isLocal);
  return hasLocalCandidates
    ? "cloud-selected-local-unavailable"
    : "cloud-selected-no-local";
};

const buildNoCandidateDecision = (): LocalCloudFallbackDecision => ({
  orderedChain: [],
  selectedAdapterId: null,
  reason: "no-candidates",
  fallbackUsed: false,
});

export const resolveLocalCloudFallbackChain = (
  request: LocalCloudFallbackRequest
): LocalCloudFallbackDecision => {
  if (request.candidates.length === 0) {
    return buildNoCandidateDecision();
  }

  const preferredLocalAdapterIds = normalizePreferredLocalAdapterIds(
    request.preferredLocalAdapterIds
  );
  const healthHintByAdapterId = normalizeHealthHints(request.healthHints);
  const orderedChain = toOrderedSourceEntries(
    request.candidates,
    preferredLocalAdapterIds,
    healthHintByAdapterId
  );

  if (orderedChain.length === 0) {
    return buildNoCandidateDecision();
  }

  const selectedHealthyIndex = orderedChain.findIndex((entry) =>
    isSelectableByHealth(entry)
  );

  if (selectedHealthyIndex >= 0) {
    const selected = orderedChain[selectedHealthyIndex];
    return {
      orderedChain,
      selectedAdapterId: selected.adapterId,
      reason: resolveSelectionReason(selected, orderedChain),
      fallbackUsed: selectedHealthyIndex > 0,
    };
  }

  const fallbackAdapterId = normalizeAdapterId(request.fallbackAdapterId);
  if (fallbackAdapterId) {
    const fallbackIndex = orderedChain.findIndex(
      (entry) => entry.adapterId === fallbackAdapterId && entry.eligible
    );
    if (fallbackIndex >= 0) {
      return {
        orderedChain,
        selectedAdapterId: orderedChain[fallbackIndex].adapterId,
        reason: "fallback-adapter-selected",
        fallbackUsed: true,
      };
    }
  }

  const selectedEligibleIndex = orderedChain.findIndex((entry) => entry.eligible);
  if (selectedEligibleIndex >= 0) {
    return {
      orderedChain,
      selectedAdapterId: orderedChain[selectedEligibleIndex].adapterId,
      reason: "first-eligible-selected",
      fallbackUsed: true,
    };
  }

  return {
    orderedChain,
    selectedAdapterId: null,
    reason: "no-selectable-candidate",
    fallbackUsed: false,
  };
};

export const toLocalCloudFallbackAuditSummary = (
  decision: LocalCloudFallbackDecision,
  maxCandidates = 8
): LocalCloudFallbackAuditSummary => {
  const boundedMax = Number.isFinite(maxCandidates)
    ? Math.max(1, Math.min(25, Math.trunc(maxCandidates)))
    : 8;

  return {
    selectedAdapterId: decision.selectedAdapterId,
    reason: decision.reason,
    fallbackUsed: decision.fallbackUsed,
    chainCount: decision.orderedChain.length,
    localCandidateCount: decision.orderedChain.filter((entry) => entry.isLocal).length,
    orderedChain: decision.orderedChain.slice(0, boundedMax),
  };
};
