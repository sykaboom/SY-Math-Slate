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
import { emitAuditEvent } from "@features/observability/auditLogger";
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
  const localState = useLocalStore.getState();
  const role = localState.trustedRoleClaim ?? localState.role;
  if (!canExecuteToolForRole(role)) {
    return "student";
  }
  return resolveExecutionRole(role);
};

const shouldQueuePendingApproval = (entry: PendingApprovalEntry): boolean => {
  const localState = useLocalStore.getState();
  const role = localState.trustedRoleClaim ?? localState.role;
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
      trustedRoleClaim: localState.trustedRoleClaim,
    },
  });
  emitAuditEvent(
    "approval",
    "tool-queue-decision",
    `tool-${entry.request.toolId}-${Date.now()}`,
    {
      toolId: entry.request.toolId,
      adapterId: entry.adapterId,
      role,
      trustedRoleClaim: localState.trustedRoleClaim,
      policyValue,
    }
  );
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
