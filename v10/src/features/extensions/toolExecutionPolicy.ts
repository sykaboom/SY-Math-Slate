import {
  configureToolExecutionPolicyHooks,
  resetToolExecutionPolicyHooks,
  type PendingApprovalEntry,
} from "@core/extensions/connectors";
import {
  canExecuteToolForRole,
  resolveExecutionRole,
  shouldQueueToolApprovalByPolicyForRole,
} from "@core/config/rolePolicy";
import { reportPolicyBooleanDiff } from "@features/policy/policyShadow";
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

const resolveToolExecutionRole = (): "host" | "student" => {
  const role = useLocalStore.getState().role;
  if (!canExecuteToolForRole(role)) {
    return "student";
  }
  return resolveExecutionRole(role);
};

const shouldQueuePendingApproval = (entry: PendingApprovalEntry): boolean => {
  const role = useLocalStore.getState().role;
  const policyValue = shouldQueueToolApprovalByPolicyForRole(role);
  const legacyValue = true;
  reportPolicyBooleanDiff({
    decisionKey: "tool-policy.should-queue-pending-approval",
    role: String(role),
    legacyValue,
    policyValue,
    metadata: {
      toolId: entry.request.toolId,
      adapterId: entry.adapterId,
    },
  });
  return policyValue;
};

export const registerToolExecutionPolicy = (): void => {
  configureToolExecutionPolicyHooks({
    getRole: resolveToolExecutionRole,
    shouldQueue: (entry) => shouldQueuePendingApproval(entry),
    enqueuePendingApproval,
  });
};

export const resetToolExecutionPolicy = (): void => {
  resetToolExecutionPolicyHooks();
};
