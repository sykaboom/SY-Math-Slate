import {
  configureCommandExecutionPolicyHooks,
  resetCommandExecutionPolicyHooks,
  type PendingCommandApprovalEntry,
} from "@core/engine/commandBus";
import {
  canDispatchCommandForRole,
  resolveExecutionRole,
  shouldQueueCommandApprovalByPolicyForRole,
} from "@core/config/rolePolicy";
import { reportPolicyBooleanDiff } from "@features/policy/policyShadow";
import { useLocalStore } from "@features/store/useLocalStore";
import { useSyncStore } from "@features/store/useSyncStore";

const createPendingApprovalId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `pending-command-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const toQueueMeta = (
  entry: PendingCommandApprovalEntry
): Record<string, unknown> => ({
  ...(entry.meta ?? {}),
  queueType: "command",
  commandId: entry.commandId,
  auditTag: entry.auditTag,
  idempotencyKey: entry.idempotencyKey ?? null,
  mutationScope: entry.mutationScope,
});

const enqueuePendingCommand = (entry: PendingCommandApprovalEntry): void => {
  useSyncStore.getState().enqueuePendingAI({
    id: createPendingApprovalId(),
    toolId: entry.commandId,
    adapterId: `command:${entry.commandId}`,
    payload: entry.payload,
    meta: toQueueMeta(entry),
    toolResult: null,
  });
};

const resolveCommandExecutionRole = (): "host" | "student" => {
  const role = useLocalStore.getState().role;
  if (!canDispatchCommandForRole(role)) {
    return "student";
  }
  return resolveExecutionRole(role);
};

const shouldQueuePendingCommand = (entry: PendingCommandApprovalEntry): boolean => {
  const role = useLocalStore.getState().role;
  const policyValue = shouldQueueCommandApprovalByPolicyForRole(role);
  const legacyValue = true;
  reportPolicyBooleanDiff({
    decisionKey: "command-policy.should-queue-pending-command",
    role: String(role),
    legacyValue,
    policyValue,
    metadata: {
      commandId: entry.commandId,
      hasIdempotencyKey: entry.idempotencyKey ? true : false,
    },
  });
  return policyValue;
};

export const registerCommandExecutionPolicy = (): void => {
  configureCommandExecutionPolicyHooks({
    getRole: resolveCommandExecutionRole,
    shouldQueue: (entry) => shouldQueuePendingCommand(entry),
    enqueuePendingCommand,
  });
};

export const resetCommandExecutionPolicy = (): void => {
  resetCommandExecutionPolicyHooks();
};
