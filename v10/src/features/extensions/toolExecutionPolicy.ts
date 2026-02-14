import {
  configureToolExecutionPolicyHooks,
  resetToolExecutionPolicyHooks,
  type PendingApprovalEntry,
} from "@core/extensions/connectors";
import { useLocalStore } from "@features/store/useLocalStore";
import { useSyncStore } from "@features/store/useSyncStore";

const createPendingApprovalId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `pending-ai-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const enqueuePendingApproval = (entry: PendingApprovalEntry): void => {
  useSyncStore.getState().enqueuePendingAI({
    id: createPendingApprovalId(),
    toolId: entry.request.toolId,
    adapterId: entry.adapterId,
    payload: entry.request.payload,
    meta: entry.request.meta ?? null,
    toolResult: entry.toolResult,
  });
};

export const registerToolExecutionPolicy = (): void => {
  configureToolExecutionPolicyHooks({
    getRole: () => useLocalStore.getState().role,
    enqueuePendingApproval,
  });
};

export const resetToolExecutionPolicy = (): void => {
  resetToolExecutionPolicyHooks();
};
