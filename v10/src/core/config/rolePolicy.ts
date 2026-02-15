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

const KNOWN_ROLE_POLICY_SURFACES = Object.values(ROLE_POLICY_SURFACES);

const ROLE_POLICY_ACTIONS_BY_SURFACE: Record<string, string[]> = {
  [ROLE_POLICY_SURFACES.COMMAND_PERMISSIONS]: [
    ROLE_POLICY_ACTIONS.COMMAND_DISPATCH,
  ],
  [ROLE_POLICY_SURFACES.COMMAND_APPROVAL]: [
    ROLE_POLICY_ACTIONS.COMMAND_ROUTE_APPROVAL_QUEUE,
  ],
  [ROLE_POLICY_SURFACES.TOOL_PERMISSIONS]: [ROLE_POLICY_ACTIONS.TOOL_EXECUTE],
  [ROLE_POLICY_SURFACES.TOOL_APPROVAL]: [
    ROLE_POLICY_ACTIONS.TOOL_ROUTE_APPROVAL_QUEUE,
  ],
  [ROLE_POLICY_SURFACES.UI_VISIBILITY]: [
    ROLE_POLICY_ACTIONS.UI_SHOW_TOP_CHROME,
    ROLE_POLICY_ACTIONS.UI_SHOW_DATA_INPUT_PANEL,
    ROLE_POLICY_ACTIONS.UI_SHOW_EDITING_FOOTER,
    ROLE_POLICY_ACTIONS.UI_SHOW_PASTE_HELPER_MODAL,
    ROLE_POLICY_ACTIONS.UI_SHOW_STUDENT_PLAYER_BAR,
  ],
};

export type LayoutRoleVisibilitySnapshot = {
  showTopChrome: boolean;
  showDataInputPanel: boolean;
  showHostToolchips: boolean;
  showStudentPlayerBar: boolean;
  showPasteHelperModal: boolean;
};

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

const LEGACY_LAYOUT_VISIBILITY_BY_ROLE: Record<
  RuntimeRole,
  LayoutRoleVisibilitySnapshot
> = {
  host: {
    showTopChrome: true,
    showDataInputPanel: true,
    showHostToolchips: true,
    showStudentPlayerBar: false,
    showPasteHelperModal: true,
  },
  student: {
    showTopChrome: false,
    showDataInputPanel: false,
    showHostToolchips: false,
    showStudentPlayerBar: true,
    showPasteHelperModal: false,
  },
};

const POLICY_VALIDATION = validateRolePolicyDocument(ROLE_POLICY_SOURCE);

const BASE_ROLE_POLICY: RolePolicyDocument = POLICY_VALIDATION.ok
  ? POLICY_VALIDATION.value
  : DENY_ALL_POLICY;

let runtimeRolePolicyOverride: RolePolicyDocument | null = null;

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
    const activePolicy = runtimeRolePolicyOverride ?? BASE_ROLE_POLICY;
    return activePolicy.defaultDecision;
  }

  const activePolicy = runtimeRolePolicyOverride ?? BASE_ROLE_POLICY;
  const roleEntry = activePolicy.roles[roleKey];
  if (!roleEntry) {
    return activePolicy.defaultDecision;
  }

  return roleEntry.surfaces[surfaceKey]?.[actionKey] ?? activePolicy.defaultDecision;
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

export const shouldQueueCommandApprovalByPolicyForRole = (
  role: unknown
): boolean => {
  return canDispatchCommandForRole(role) && shouldQueueCommandApprovalForRole(role);
};

export const shouldQueueToolApprovalByPolicyForRole = (
  role: unknown
): boolean => {
  return canExecuteToolForRole(role) && shouldQueueToolApprovalForRole(role);
};

export const listKnownRolePolicySurfaces = (): string[] => [
  ...KNOWN_ROLE_POLICY_SURFACES,
];

export const listKnownRolePolicyActions = (surface: unknown): string[] => {
  if (typeof surface !== "string") return [];
  return [...(ROLE_POLICY_ACTIONS_BY_SURFACE[surface] ?? [])];
};

export const isKnownRolePolicySurface = (surface: unknown): surface is string => {
  return (
    typeof surface === "string" &&
    (KNOWN_ROLE_POLICY_SURFACES as readonly string[]).includes(surface)
  );
};

export const isKnownRolePolicyActionForSurface = (
  surface: unknown,
  action: unknown
): action is string => {
  if (typeof surface !== "string" || typeof action !== "string") return false;
  return (ROLE_POLICY_ACTIONS_BY_SURFACE[surface] ?? []).includes(action);
};

const cloneRolePolicyDocument = (
  document: RolePolicyDocument
): RolePolicyDocument => JSON.parse(JSON.stringify(document));

const hasOnlyKnownPolicyGrants = (document: RolePolicyDocument): boolean => {
  for (const roleEntry of Object.values(document.roles)) {
    for (const [surface, actions] of Object.entries(roleEntry.surfaces)) {
      if (!isKnownRolePolicySurface(surface)) return false;
      for (const action of Object.keys(actions)) {
        if (!isKnownRolePolicyActionForSurface(surface, action)) return false;
      }
    }
  }
  return true;
};

export type RolePolicyPublishResult =
  | { ok: true; value: RolePolicyDocument }
  | { ok: false; error: string };

export const validateRolePolicyPublishCandidate = (
  value: unknown
): RolePolicyPublishResult => {
  const validation = validateRolePolicyDocument(value);
  if (!validation.ok) {
    return { ok: false, error: validation.error };
  }

  if (!hasOnlyKnownPolicyGrants(validation.value)) {
    return {
      ok: false,
      error: "role policy contains unknown surface/action grants.",
    };
  }

  return { ok: true, value: cloneRolePolicyDocument(validation.value) };
};

export const publishRolePolicyDocument = (
  value: unknown
): RolePolicyPublishResult => {
  const validated = validateRolePolicyPublishCandidate(value);
  if (!validated.ok) return validated;
  runtimeRolePolicyOverride = cloneRolePolicyDocument(validated.value);
  return { ok: true, value: cloneRolePolicyDocument(validated.value) };
};

export const resetRolePolicyDocumentOverride = (): void => {
  runtimeRolePolicyOverride = null;
};

export const evaluateRolePolicyDecisionWithDocument = (
  document: RolePolicyDocument,
  role: unknown,
  surface: unknown,
  action: unknown
): RolePolicyDecision => {
  const roleKey = normalizePolicyKey(role);
  const surfaceKey = normalizePolicyKey(surface);
  const actionKey = normalizePolicyKey(action);
  if (!roleKey || !surfaceKey || !actionKey) {
    return document.defaultDecision;
  }
  const roleEntry = document.roles[roleKey];
  if (!roleEntry) return document.defaultDecision;
  return roleEntry.surfaces[surfaceKey]?.[actionKey] ?? document.defaultDecision;
};

export const resolveLegacyLayoutVisibilityForRole = (
  role: unknown
): LayoutRoleVisibilitySnapshot => {
  if (role === "student") {
    return LEGACY_LAYOUT_VISIBILITY_BY_ROLE.student;
  }
  return LEGACY_LAYOUT_VISIBILITY_BY_ROLE.host;
};

export const getRolePolicyDocument = (): RolePolicyDocument =>
  cloneRolePolicyDocument(runtimeRolePolicyOverride ?? BASE_ROLE_POLICY);
