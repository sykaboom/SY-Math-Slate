import {
  configureCommandExecutionPolicyHooks,
  resetCommandExecutionPolicyHooks,
  type PendingCommandApprovalEntry,
} from "@core/engine/commandBus";
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

export const registerCommandExecutionPolicy = (): void => {
  configureCommandExecutionPolicyHooks({
    getRole: () => useLocalStore.getState().role,
    enqueuePendingCommand,
  });
};

export const resetCommandExecutionPolicy = (): void => {
  resetCommandExecutionPolicyHooks();
};
