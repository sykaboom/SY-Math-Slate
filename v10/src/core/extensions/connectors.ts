import {
  type KnownNormalizedPayload,
  type ToolRegistryEntry,
  type ToolResult,
  validateToolResult,
} from "@core/contracts";
import { getToolRegistryEntryById } from "./registry";

export type ConnectorSupports = {
  tts?: boolean;
  llm?: boolean;
  export?: boolean;
  audio?: boolean;
};

export type ConnectorRequest = {
  type: string;
  toolId?: string;
  adapterId?: string;
  payload?: unknown;
  meta?: Record<string, unknown>;
};

export type ConnectorResponse = {
  ok: boolean;
  toolResult?: ToolResult<unknown>;
  error?: string;
};

export interface Connector {
  name: string;
  supports: ConnectorSupports;
  invoke: (request: ConnectorRequest) => Promise<ConnectorResponse>;
}

export type ConnectorAdapterInvoker = (
  request: ConnectorRequest
) => Promise<ConnectorResponse>;

export type ConnectorResolutionErrorCode =
  | "connector-failed"
  | "missing-tool-result"
  | "invalid-tool-result"
  | "tool-id-mismatch"
  | "unregistered-tool"
  | "unknown-adapter"
  | "adapter-invoke-failed"
  | "approval-required";

export type ConnectorToolResultResolution =
  | { ok: true; toolResult: ToolResult<KnownNormalizedPayload> }
  | { ok: false; code: ConnectorResolutionErrorCode; error: string };

export type RegisteredToolExecutionRequest = {
  toolId: string;
  payload?: unknown;
  meta?: Record<string, unknown>;
  role?: ToolExecutionRole;
};

export type ToolExecutionAdapterRouteContext = {
  request: RegisteredToolExecutionRequest;
  registeredTool: ToolRegistryEntry;
  fallbackAdapterId: string;
};

export type ToolExecutionAdapterRouteHook = (
  context: ToolExecutionAdapterRouteContext
) => string | null | undefined;

export type RegisteredToolExecutionOptions = {
  getToolById?: (toolId: string) => ToolRegistryEntry | null;
  getAdapterById: (adapterId: string) => ConnectorAdapterInvoker | null;
  resolveAdapterId?: ToolExecutionAdapterRouteHook;
};

export type ToolExecutionRole = "host" | "student";

export type PendingApprovalEntry = {
  request: RegisteredToolExecutionRequest;
  adapterId: string;
  toolResult: ToolResult<KnownNormalizedPayload>;
};

export type ToolExecutionPolicyHooks = {
  getRole: () => ToolExecutionRole;
  enqueuePendingApproval?: (entry: PendingApprovalEntry) => void;
  shouldQueue?: (entry: PendingApprovalEntry) => boolean;
};

const APPROVAL_REQUIRED_ERROR =
  "approval required: student mutating tool results must be approved by host.";

let toolExecutionPolicyHooks: ToolExecutionPolicyHooks | null = null;

export const configureToolExecutionPolicyHooks = (
  hooks: ToolExecutionPolicyHooks
): void => {
  toolExecutionPolicyHooks = hooks;
};

export const resetToolExecutionPolicyHooks = (): void => {
  toolExecutionPolicyHooks = null;
};

const failResolution = (
  code: ConnectorResolutionErrorCode,
  error: string
): ConnectorToolResultResolution => ({
  ok: false,
  code,
  error,
});

export const resolveConnectorToolResult = (
  response: ConnectorResponse,
  expectedToolId?: string
): ConnectorToolResultResolution => {
  if (!response.ok) {
    return failResolution(
      "connector-failed",
      response.error ?? "connector returned a failed response."
    );
  }

  if (!response.toolResult) {
    return failResolution(
      "missing-tool-result",
      "connector response is missing toolResult."
    );
  }

  const validated = validateToolResult(response.toolResult);
  if (!validated.ok) {
    return failResolution(
      "invalid-tool-result",
      `invalid toolResult: ${validated.code} (${validated.path})`
    );
  }

  if (expectedToolId && validated.value.toolId !== expectedToolId) {
    return failResolution(
      "tool-id-mismatch",
      `resolved toolResult.toolId (${validated.value.toolId}) does not match requested toolId (${expectedToolId}).`
    );
  }

  return { ok: true, toolResult: validated.value };
};

export const resolveRegisteredConnectorToolResult = (
  toolId: string,
  response: ConnectorResponse,
  getToolById: (id: string) => ToolRegistryEntry | null = getToolRegistryEntryById
): ConnectorToolResultResolution => {
  const registeredTool = getToolById(toolId);
  if (!registeredTool) {
    return failResolution(
      "unregistered-tool",
      `toolId '${toolId}' is not registered in tool registry.`
    );
  }
  return resolveConnectorToolResult(response, registeredTool.toolId);
};

export const resolveToolExecutionAdapterId = (
  entry: ToolRegistryEntry
): string => {
  if (entry.execution.localRuntimeId) {
    return entry.execution.localRuntimeId;
  }
  if (entry.execution.mcpServerId) {
    return `mcp:${entry.execution.mcpServerId}`;
  }
  return `endpoint:${entry.execution.endpointRef ?? "unknown"}`;
};

const isMutatingNormalizedPayload = (
  toolResult: ToolResult<KnownNormalizedPayload>
): boolean => toolResult.normalized.type === "NormalizedContent";

const maybeInterceptStudentMutation = (
  request: RegisteredToolExecutionRequest,
  adapterId: string,
  toolResult: ToolResult<KnownNormalizedPayload>
): ConnectorToolResultResolution | null => {
  const hooks = toolExecutionPolicyHooks;
  const role = request.role ?? hooks?.getRole() ?? "host";
  if (role !== "student") {
    return null;
  }
  if (!isMutatingNormalizedPayload(toolResult)) {
    return null;
  }

  const pendingEntry: PendingApprovalEntry = {
    request: {
      toolId: request.toolId,
      payload: request.payload,
      meta: request.meta,
    },
    adapterId,
    toolResult,
  };

  const shouldQueue = hooks?.shouldQueue?.(pendingEntry) ?? true;
  if (shouldQueue) {
    hooks?.enqueuePendingApproval?.(pendingEntry);
  }

  return failResolution("approval-required", APPROVAL_REQUIRED_ERROR);
};

export const executeRegisteredToolRequest = async (
  request: RegisteredToolExecutionRequest,
  options: RegisteredToolExecutionOptions
): Promise<ConnectorToolResultResolution> => {
  const getToolById = options.getToolById ?? getToolRegistryEntryById;
  const registeredTool = getToolById(request.toolId);
  if (!registeredTool) {
    return failResolution(
      "unregistered-tool",
      `toolId '${request.toolId}' is not registered in tool registry.`
    );
  }

  const fallbackAdapterId = resolveToolExecutionAdapterId(registeredTool);
  let adapterId = fallbackAdapterId;
  if (options.resolveAdapterId) {
    try {
      const routedAdapterId = options.resolveAdapterId({
        request,
        registeredTool,
        fallbackAdapterId,
      });
      if (typeof routedAdapterId === "string" && routedAdapterId.trim() !== "") {
        adapterId = routedAdapterId.trim();
      }
    } catch {
      adapterId = fallbackAdapterId;
    }
  }

  const adapter = options.getAdapterById(adapterId);
  if (!adapter) {
    return failResolution(
      "unknown-adapter",
      `adapter '${adapterId}' is not registered for tool '${request.toolId}'.`
    );
  }

  try {
    const response = await adapter({
      type: request.toolId,
      toolId: request.toolId,
      adapterId,
      payload: request.payload,
      meta: request.meta,
    });
    const resolved = resolveConnectorToolResult(response, request.toolId);
    if (!resolved.ok) {
      return resolved;
    }

    const intercepted = maybeInterceptStudentMutation(
      request,
      adapterId,
      resolved.toolResult
    );
    if (intercepted) {
      return intercepted;
    }

    return resolved;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "unknown adapter invocation failure";
    return failResolution(
      "adapter-invoke-failed",
      `adapter '${adapterId}' invocation failed: ${message}`
    );
  }
};
