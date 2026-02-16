import { isKnownUISlotName } from "@core/extensions/registry";
import {
  PANEL_DISPLAY_MODES,
  PANEL_RUNTIME_ROLES,
  type PanelBehaviorContract,
  type PanelDefaultPosition,
  type PanelPolicyDocument,
  type PanelPolicyEntry,
  type PanelRoleOverride,
  type PanelRuntimeRole,
} from "./panelBehavior.types";

const PANEL_POLICY_ROOT_KEYS = new Set<string>(["version", "panels"]);
const PANEL_POLICY_ENTRY_KEYS = new Set<string>(["slot", "behavior"]);
const PANEL_BEHAVIOR_KEYS = new Set<string>([
  "displayMode",
  "movable",
  "defaultPosition",
  "rememberPosition",
  "defaultOpen",
  "roleOverride",
]);
const PANEL_DEFAULT_POSITION_KEYS = new Set<string>(["x", "y"]);
const PANEL_ROLE_OVERRIDE_KEYS = new Set<string>(
  PANEL_RUNTIME_ROLES as readonly string[]
);
const PANEL_ROLE_OVERRIDE_ENTRY_KEYS = new Set<string>([
  "visible",
  "displayMode",
  "movable",
  "defaultOpen",
]);

export type PanelBehaviorValidationCode =
  | "invalid-panel-policy-root"
  | "invalid-panel-policy-root-key"
  | "invalid-panel-policy-version"
  | "invalid-panel-policy-panels"
  | "invalid-panel-policy-id"
  | "invalid-panel-policy-entry"
  | "invalid-panel-policy-entry-key"
  | "invalid-panel-policy-slot"
  | "invalid-panel-behavior-root"
  | "invalid-panel-behavior-key"
  | "invalid-panel-display-mode"
  | "invalid-panel-movable"
  | "invalid-panel-default-position"
  | "invalid-panel-default-position-key"
  | "invalid-panel-default-position-x"
  | "invalid-panel-default-position-y"
  | "invalid-panel-remember-position"
  | "invalid-panel-default-open"
  | "invalid-panel-role-override"
  | "invalid-panel-role-override-key"
  | "invalid-panel-role-override-entry"
  | "invalid-panel-role-override-entry-key"
  | "invalid-panel-role-override-visible"
  | "invalid-panel-role-override-display-mode"
  | "invalid-panel-role-override-movable"
  | "invalid-panel-role-override-default-open";

export type PanelBehaviorValidationError = {
  ok: false;
  code: PanelBehaviorValidationCode;
  path: string;
  message: string;
};

export type PanelBehaviorValidationSuccess<T> = {
  ok: true;
  value: T;
};

export type PanelBehaviorValidationResult<T> =
  | PanelBehaviorValidationSuccess<T>
  | PanelBehaviorValidationError;

const isPlainRecord = (value: unknown): value is Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

const findUnknownKey = (
  candidate: Record<string, unknown>,
  allowlist: ReadonlySet<string>
): string | null => {
  const keys = Object.keys(candidate).sort();
  for (const key of keys) {
    if (!allowlist.has(key)) {
      return key;
    }
  }
  return null;
};

const fail = (
  code: PanelBehaviorValidationCode,
  path: string,
  message: string
): PanelBehaviorValidationError => ({
  ok: false,
  code,
  path,
  message,
});

const isPanelDisplayMode = (
  value: unknown
): value is PanelBehaviorContract["displayMode"] =>
  typeof value === "string" &&
  (PANEL_DISPLAY_MODES as readonly string[]).includes(value);

const validateDefaultPosition = (
  value: unknown,
  path: string
): PanelBehaviorValidationResult<PanelDefaultPosition> => {
  if (!isPlainRecord(value)) {
    return fail(
      "invalid-panel-default-position",
      path,
      "defaultPosition must be a plain object."
    );
  }

  const unknownKey = findUnknownKey(value, PANEL_DEFAULT_POSITION_KEYS);
  if (unknownKey) {
    return fail(
      "invalid-panel-default-position-key",
      `${path}.${unknownKey}`,
      `field '${unknownKey}' is not allowed in defaultPosition.`
    );
  }

  const x = value.x;
  if (typeof x !== "number" || !Number.isFinite(x)) {
    return fail(
      "invalid-panel-default-position-x",
      `${path}.x`,
      "defaultPosition.x must be a finite number."
    );
  }

  const y = value.y;
  if (typeof y !== "number" || !Number.isFinite(y)) {
    return fail(
      "invalid-panel-default-position-y",
      `${path}.y`,
      "defaultPosition.y must be a finite number."
    );
  }

  return {
    ok: true,
    value: { x, y },
  };
};

const validateRoleOverrideEntry = (
  value: unknown,
  path: string
): PanelBehaviorValidationResult<PanelRoleOverride> => {
  if (!isPlainRecord(value)) {
    return fail(
      "invalid-panel-role-override-entry",
      path,
      "roleOverride entry must be a plain object."
    );
  }

  const unknownKey = findUnknownKey(value, PANEL_ROLE_OVERRIDE_ENTRY_KEYS);
  if (unknownKey) {
    return fail(
      "invalid-panel-role-override-entry-key",
      `${path}.${unknownKey}`,
      `field '${unknownKey}' is not allowed in roleOverride entry.`
    );
  }

  const nextOverride: PanelRoleOverride = {};

  if (value.visible !== undefined) {
    if (typeof value.visible !== "boolean") {
      return fail(
        "invalid-panel-role-override-visible",
        `${path}.visible`,
        "roleOverride.visible must be a boolean when provided."
      );
    }
    nextOverride.visible = value.visible;
  }

  if (value.displayMode !== undefined) {
    if (!isPanelDisplayMode(value.displayMode)) {
      return fail(
        "invalid-panel-role-override-display-mode",
        `${path}.displayMode`,
        "roleOverride.displayMode must be 'windowed' or 'docked'."
      );
    }
    nextOverride.displayMode = value.displayMode;
  }

  if (value.movable !== undefined) {
    if (typeof value.movable !== "boolean") {
      return fail(
        "invalid-panel-role-override-movable",
        `${path}.movable`,
        "roleOverride.movable must be a boolean when provided."
      );
    }
    nextOverride.movable = value.movable;
  }

  if (value.defaultOpen !== undefined) {
    if (typeof value.defaultOpen !== "boolean") {
      return fail(
        "invalid-panel-role-override-default-open",
        `${path}.defaultOpen`,
        "roleOverride.defaultOpen must be a boolean when provided."
      );
    }
    nextOverride.defaultOpen = value.defaultOpen;
  }

  return {
    ok: true,
    value: nextOverride,
  };
};

const validatePanelBehaviorContractAtPath = (
  value: unknown,
  path: string
): PanelBehaviorValidationResult<PanelBehaviorContract> => {
  if (!isPlainRecord(value)) {
    return fail(
      "invalid-panel-behavior-root",
      path,
      "panel behavior must be a plain object."
    );
  }

  const unknownRootKey = findUnknownKey(value, PANEL_BEHAVIOR_KEYS);
  if (unknownRootKey) {
    return fail(
      "invalid-panel-behavior-key",
      `${path}.${unknownRootKey}`,
      `field '${unknownRootKey}' is not allowed in panel behavior.`
    );
  }

  if (!isPanelDisplayMode(value.displayMode)) {
    return fail(
      "invalid-panel-display-mode",
      `${path}.displayMode`,
      "displayMode must be 'windowed' or 'docked'."
    );
  }

  if (typeof value.movable !== "boolean") {
    return fail(
      "invalid-panel-movable",
      `${path}.movable`,
      "movable must be a boolean."
    );
  }

  const defaultPosition = validateDefaultPosition(
    value.defaultPosition,
    `${path}.defaultPosition`
  );
  if (!defaultPosition.ok) {
    return defaultPosition;
  }

  if (typeof value.rememberPosition !== "boolean") {
    return fail(
      "invalid-panel-remember-position",
      `${path}.rememberPosition`,
      "rememberPosition must be a boolean."
    );
  }

  if (typeof value.defaultOpen !== "boolean") {
    return fail(
      "invalid-panel-default-open",
      `${path}.defaultOpen`,
      "defaultOpen must be a boolean."
    );
  }

  let roleOverride: PanelBehaviorContract["roleOverride"] | undefined = undefined;
  if (value.roleOverride !== undefined) {
    if (!isPlainRecord(value.roleOverride)) {
      return fail(
        "invalid-panel-role-override",
        `${path}.roleOverride`,
        "roleOverride must be a plain object when provided."
      );
    }

    const unknownRoleKey = findUnknownKey(value.roleOverride, PANEL_ROLE_OVERRIDE_KEYS);
    if (unknownRoleKey) {
      return fail(
        "invalid-panel-role-override-key",
        `${path}.roleOverride.${unknownRoleKey}`,
        `roleOverride key '${unknownRoleKey}' is not supported.`
      );
    }

    const nextRoleOverride: Partial<Record<PanelRuntimeRole, PanelRoleOverride>> = {};
    for (const role of PANEL_RUNTIME_ROLES) {
      const candidate = value.roleOverride[role];
      if (candidate === undefined) continue;

      const validated = validateRoleOverrideEntry(
        candidate,
        `${path}.roleOverride.${role}`
      );
      if (!validated.ok) {
        return validated;
      }
      nextRoleOverride[role] = validated.value;
    }

    roleOverride = nextRoleOverride;
  }

  const normalized: PanelBehaviorContract = {
    displayMode: value.displayMode,
    movable: value.movable,
    defaultPosition: defaultPosition.value,
    rememberPosition: value.rememberPosition,
    defaultOpen: value.defaultOpen,
  };

  if (roleOverride !== undefined) {
    normalized.roleOverride = roleOverride;
  }

  return {
    ok: true,
    value: normalized,
  };
};

const validatePanelPolicyEntry = (
  value: unknown,
  path: string
): PanelBehaviorValidationResult<PanelPolicyEntry> => {
  if (!isPlainRecord(value)) {
    return fail(
      "invalid-panel-policy-entry",
      path,
      "panel entry must be a plain object."
    );
  }

  const unknownKey = findUnknownKey(value, PANEL_POLICY_ENTRY_KEYS);
  if (unknownKey) {
    return fail(
      "invalid-panel-policy-entry-key",
      `${path}.${unknownKey}`,
      `field '${unknownKey}' is not allowed in panel policy entry.`
    );
  }

  if (!isKnownUISlotName(value.slot)) {
    return fail(
      "invalid-panel-policy-slot",
      `${path}.slot`,
      "slot must be a known UI slot name."
    );
  }

  const validatedBehavior = validatePanelBehaviorContractAtPath(
    value.behavior,
    `${path}.behavior`
  );
  if (!validatedBehavior.ok) {
    return validatedBehavior;
  }

  return {
    ok: true,
    value: {
      slot: value.slot,
      behavior: validatedBehavior.value,
    },
  };
};

export const validatePanelBehaviorContract = (
  value: unknown
): PanelBehaviorValidationResult<PanelBehaviorContract> =>
  validatePanelBehaviorContractAtPath(value, "panelBehavior");

export const isPanelBehaviorContract = (
  value: unknown
): value is PanelBehaviorContract => validatePanelBehaviorContract(value).ok;

export const validatePanelPolicyDocument = (
  value: unknown
): PanelBehaviorValidationResult<PanelPolicyDocument> => {
  const path = "panelPolicy";
  if (!isPlainRecord(value)) {
    return fail(
      "invalid-panel-policy-root",
      path,
      "panel policy must be a plain object."
    );
  }

  const unknownRootKey = findUnknownKey(value, PANEL_POLICY_ROOT_KEYS);
  if (unknownRootKey) {
    return fail(
      "invalid-panel-policy-root-key",
      `${path}.${unknownRootKey}`,
      `field '${unknownRootKey}' is not allowed in panel policy root.`
    );
  }

  const version = value.version;
  if (
    typeof version !== "number" ||
    !Number.isInteger(version) ||
    !Number.isFinite(version) ||
    version <= 0
  ) {
    return fail(
      "invalid-panel-policy-version",
      `${path}.version`,
      "version must be a positive integer."
    );
  }

  if (!isPlainRecord(value.panels)) {
    return fail(
      "invalid-panel-policy-panels",
      `${path}.panels`,
      "panels must be a plain object."
    );
  }

  const panels: Record<string, PanelPolicyEntry> = {};
  const panelIds = Object.keys(value.panels).sort();
  for (const rawPanelId of panelIds) {
    const panelId = rawPanelId.trim();
    if (panelId.length === 0) {
      return fail(
        "invalid-panel-policy-id",
        `${path}.panels.${rawPanelId}`,
        "panel ids must be non-empty strings."
      );
    }

    const validatedEntry = validatePanelPolicyEntry(
      value.panels[rawPanelId],
      `${path}.panels.${panelId}`
    );
    if (!validatedEntry.ok) {
      return validatedEntry;
    }
    panels[panelId] = validatedEntry.value;
  }

  return {
    ok: true,
    value: {
      version,
      panels,
    },
  };
};

export const isPanelPolicyDocument = (
  value: unknown
): value is PanelPolicyDocument => validatePanelPolicyDocument(value).ok;
