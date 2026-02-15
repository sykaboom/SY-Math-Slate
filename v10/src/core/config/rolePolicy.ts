import {
  type RolePolicyDecision,
  type RolePolicyDocument,
  validateRolePolicyDocument,
} from "./rolePolicyGuards";

export type RuntimeRole = "host" | "student";

export const ROLE_POLICY_SURFACES = {
  COMMAND_PERMISSIONS: "command.permissions",
  COMMAND_APPROVAL: "command.approval",
  TOOL_PERMISSIONS: "tool.permissions",
  TOOL_APPROVAL: "tool.approval",
  UI_VISIBILITY: "ui.visibility",
} as const;

export const ROLE_POLICY_ACTIONS = {
  COMMAND_DISPATCH: "dispatch",
  COMMAND_ROUTE_APPROVAL_QUEUE: "route-command-approval-queue",
  TOOL_EXECUTE: "execute",
  TOOL_ROUTE_APPROVAL_QUEUE: "route-tool-approval-queue",
  UI_SHOW_TOP_CHROME: "show-top-chrome",
  UI_SHOW_DATA_INPUT_PANEL: "show-data-input-panel",
  UI_SHOW_EDITING_FOOTER: "show-editing-footer",
  UI_SHOW_PASTE_HELPER_MODAL: "show-paste-helper-modal",
  UI_SHOW_STUDENT_PLAYER_BAR: "show-student-player-bar",
} as const;

type RolePolicySurface =
  (typeof ROLE_POLICY_SURFACES)[keyof typeof ROLE_POLICY_SURFACES];
type RolePolicyAction = (typeof ROLE_POLICY_ACTIONS)[keyof typeof ROLE_POLICY_ACTIONS];

const ROLE_POLICY_SOURCE: unknown = {
  version: 1,
  defaultDecision: "deny",
  roles: {
    host: {
      surfaces: {
        [ROLE_POLICY_SURFACES.COMMAND_PERMISSIONS]: {
          [ROLE_POLICY_ACTIONS.COMMAND_DISPATCH]: "allow",
        },
        [ROLE_POLICY_SURFACES.COMMAND_APPROVAL]: {
          [ROLE_POLICY_ACTIONS.COMMAND_ROUTE_APPROVAL_QUEUE]: "deny",
        },
        [ROLE_POLICY_SURFACES.TOOL_PERMISSIONS]: {
          [ROLE_POLICY_ACTIONS.TOOL_EXECUTE]: "allow",
        },
        [ROLE_POLICY_SURFACES.TOOL_APPROVAL]: {
          [ROLE_POLICY_ACTIONS.TOOL_ROUTE_APPROVAL_QUEUE]: "deny",
        },
        [ROLE_POLICY_SURFACES.UI_VISIBILITY]: {
          [ROLE_POLICY_ACTIONS.UI_SHOW_TOP_CHROME]: "allow",
          [ROLE_POLICY_ACTIONS.UI_SHOW_DATA_INPUT_PANEL]: "allow",
          [ROLE_POLICY_ACTIONS.UI_SHOW_EDITING_FOOTER]: "allow",
          [ROLE_POLICY_ACTIONS.UI_SHOW_PASTE_HELPER_MODAL]: "allow",
          [ROLE_POLICY_ACTIONS.UI_SHOW_STUDENT_PLAYER_BAR]: "deny",
        },
      },
    },
    student: {
      surfaces: {
        [ROLE_POLICY_SURFACES.COMMAND_PERMISSIONS]: {
          [ROLE_POLICY_ACTIONS.COMMAND_DISPATCH]: "allow",
        },
        [ROLE_POLICY_SURFACES.COMMAND_APPROVAL]: {
          [ROLE_POLICY_ACTIONS.COMMAND_ROUTE_APPROVAL_QUEUE]: "allow",
        },
        [ROLE_POLICY_SURFACES.TOOL_PERMISSIONS]: {
          [ROLE_POLICY_ACTIONS.TOOL_EXECUTE]: "allow",
        },
        [ROLE_POLICY_SURFACES.TOOL_APPROVAL]: {
          [ROLE_POLICY_ACTIONS.TOOL_ROUTE_APPROVAL_QUEUE]: "allow",
        },
        [ROLE_POLICY_SURFACES.UI_VISIBILITY]: {
          [ROLE_POLICY_ACTIONS.UI_SHOW_TOP_CHROME]: "deny",
          [ROLE_POLICY_ACTIONS.UI_SHOW_DATA_INPUT_PANEL]: "deny",
          [ROLE_POLICY_ACTIONS.UI_SHOW_EDITING_FOOTER]: "deny",
          [ROLE_POLICY_ACTIONS.UI_SHOW_PASTE_HELPER_MODAL]: "deny",
          [ROLE_POLICY_ACTIONS.UI_SHOW_STUDENT_PLAYER_BAR]: "allow",
        },
      },
    },
  },
};

const DENY_ALL_POLICY: RolePolicyDocument = {
  version: 1,
  defaultDecision: "deny",
  roles: {},
};

const POLICY_VALIDATION = validateRolePolicyDocument(ROLE_POLICY_SOURCE);

const ACTIVE_ROLE_POLICY: RolePolicyDocument = POLICY_VALIDATION.ok
  ? POLICY_VALIDATION.value
  : DENY_ALL_POLICY;

const normalizePolicyKey = (value: unknown): string => {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
};

export const ROLE_POLICY_GUARD_ERROR: string | null = POLICY_VALIDATION.ok
  ? null
  : POLICY_VALIDATION.error;

export const isKnownRuntimeRole = (role: unknown): role is RuntimeRole => {
  return role === "host" || role === "student";
};

export const resolveExecutionRole = (role: unknown): RuntimeRole => {
  return isKnownRuntimeRole(role) ? role : "student";
};

export const resolveRolePolicyDecision = (
  role: unknown,
  surface: unknown,
  action: unknown
): RolePolicyDecision => {
  const roleKey = normalizePolicyKey(role);
  const surfaceKey = normalizePolicyKey(surface);
  const actionKey = normalizePolicyKey(action);

  if (!roleKey || !surfaceKey || !actionKey) {
    return ACTIVE_ROLE_POLICY.defaultDecision;
  }

  const roleEntry = ACTIVE_ROLE_POLICY.roles[roleKey];
  if (!roleEntry) {
    return ACTIVE_ROLE_POLICY.defaultDecision;
  }

  return (
    roleEntry.surfaces[surfaceKey]?.[actionKey] ?? ACTIVE_ROLE_POLICY.defaultDecision
  );
};

export const isRolePolicyAllowed = (
  role: unknown,
  surface: RolePolicySurface | string,
  action: RolePolicyAction | string
): boolean => {
  return resolveRolePolicyDecision(role, surface, action) === "allow";
};

export const canDispatchCommandForRole = (role: unknown): boolean => {
  return isRolePolicyAllowed(
    role,
    ROLE_POLICY_SURFACES.COMMAND_PERMISSIONS,
    ROLE_POLICY_ACTIONS.COMMAND_DISPATCH
  );
};

export const shouldQueueCommandApprovalForRole = (role: unknown): boolean => {
  return isRolePolicyAllowed(
    role,
    ROLE_POLICY_SURFACES.COMMAND_APPROVAL,
    ROLE_POLICY_ACTIONS.COMMAND_ROUTE_APPROVAL_QUEUE
  );
};

export const canExecuteToolForRole = (role: unknown): boolean => {
  return isRolePolicyAllowed(
    role,
    ROLE_POLICY_SURFACES.TOOL_PERMISSIONS,
    ROLE_POLICY_ACTIONS.TOOL_EXECUTE
  );
};

export const shouldQueueToolApprovalForRole = (role: unknown): boolean => {
  return isRolePolicyAllowed(
    role,
    ROLE_POLICY_SURFACES.TOOL_APPROVAL,
    ROLE_POLICY_ACTIONS.TOOL_ROUTE_APPROVAL_QUEUE
  );
};

export const canAccessLayoutVisibilityForRole = (
  role: unknown,
  action: RolePolicyAction | string
): boolean => {
  return isRolePolicyAllowed(role, ROLE_POLICY_SURFACES.UI_VISIBILITY, action);
};

export const getRolePolicyDocument = (): RolePolicyDocument => ACTIVE_ROLE_POLICY;
