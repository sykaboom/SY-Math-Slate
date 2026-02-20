import type {
  ModPackageDefinition,
  ModPackageId,
  ModPackageToolbarMode,
} from "./types";
import { MOD_PACKAGE_TOOLBAR_MODES } from "./types";

export type ModPackageValidationFailure = {
  ok: false;
  code:
    | "invalid-root"
    | "invalid-pack-id"
    | "invalid-version"
    | "invalid-label"
    | "invalid-mod-ids"
    | "invalid-activation"
    | "invalid-default-mod-id"
    | "invalid-toolbar-mode-map"
    | "invalid-ui-policy"
    | "invalid-dependencies"
    | "invalid-conflicts"
    | "invalid-default-enabled";
  path: string;
  message: string;
};

export type ModPackageValidationSuccess = {
  ok: true;
  value: ModPackageDefinition;
};

export type ModPackageValidationResult =
  | ModPackageValidationFailure
  | ModPackageValidationSuccess;

const KNOWN_TOOLBAR_MODES = new Set<string>(MOD_PACKAGE_TOOLBAR_MODES);

const fail = (
  code: ModPackageValidationFailure["code"],
  path: string,
  message: string
): ModPackageValidationFailure => ({ ok: false, code, path, message });

const isPlainRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim() !== "";

const toStringArray = (
  value: unknown,
  code: ModPackageValidationFailure["code"],
  path: string,
  message: string
): { ok: true; value: string[] } | { ok: false; value: ModPackageValidationFailure } => {
  if (!Array.isArray(value)) {
    return { ok: false, value: fail(code, path, message) };
  }
  if (!value.every(isNonEmptyString)) {
    return { ok: false, value: fail(code, path, message) };
  }
  return { ok: true, value: [...value] };
};

const hasDuplicateStrings = (value: readonly string[]): boolean => {
  const unique = new Set(value);
  return unique.size !== value.length;
};

const isToolbarMode = (value: string): value is ModPackageToolbarMode =>
  KNOWN_TOOLBAR_MODES.has(value);

const parseDependencies = (
  value: unknown
): { ok: true; value: ModPackageId[] } | { ok: false; value: ModPackageValidationFailure } =>
  toStringArray(
    value,
    "invalid-dependencies",
    "manifest.dependencies",
    "dependencies must be an array of non-empty strings."
  );

const parseConflicts = (
  value: unknown
): { ok: true; value: ModPackageId[] } | { ok: false; value: ModPackageValidationFailure } =>
  toStringArray(
    value,
    "invalid-conflicts",
    "manifest.conflicts",
    "conflicts must be an array of non-empty strings."
  );

export const validateModPackageDefinition = (
  value: unknown
): ModPackageValidationResult => {
  if (!isPlainRecord(value)) {
    return fail("invalid-root", "manifest", "manifest must be a plain object.");
  }

  if (!isNonEmptyString(value.packId)) {
    return fail("invalid-pack-id", "manifest.packId", "packId must be a string.");
  }

  if (!isNonEmptyString(value.version)) {
    return fail("invalid-version", "manifest.version", "version must be a string.");
  }

  if (!isNonEmptyString(value.label)) {
    return fail("invalid-label", "manifest.label", "label must be a string.");
  }

  const modIdsResult = toStringArray(
    value.modIds,
    "invalid-mod-ids",
    "manifest.modIds",
    "modIds must be an array of non-empty strings."
  );
  if (!modIdsResult.ok) {
    return modIdsResult.value;
  }

  const modIds = modIdsResult.value;
  if (modIds.length === 0) {
    return fail(
      "invalid-mod-ids",
      "manifest.modIds",
      "modIds must contain at least one entry."
    );
  }
  if (hasDuplicateStrings(modIds)) {
    return fail(
      "invalid-mod-ids",
      "manifest.modIds",
      "modIds must not contain duplicates."
    );
  }
  const modIdSet = new Set(modIds);

  if (!isPlainRecord(value.activation)) {
    return fail(
      "invalid-activation",
      "manifest.activation",
      "activation must be an object."
    );
  }

  if (!isNonEmptyString(value.activation.defaultModId)) {
    return fail(
      "invalid-default-mod-id",
      "manifest.activation.defaultModId",
      "defaultModId must be a string."
    );
  }

  if (!modIdSet.has(value.activation.defaultModId)) {
    return fail(
      "invalid-default-mod-id",
      "manifest.activation.defaultModId",
      "defaultModId must exist in modIds."
    );
  }

  let toolbarModeMap:
    | Partial<Record<ModPackageToolbarMode, string>>
    | undefined = undefined;

  if (value.activation.toolbarModeMap !== undefined) {
    if (!isPlainRecord(value.activation.toolbarModeMap)) {
      return fail(
        "invalid-toolbar-mode-map",
        "manifest.activation.toolbarModeMap",
        "toolbarModeMap must be an object."
      );
    }

    const normalized: Partial<Record<ModPackageToolbarMode, string>> = {};
    for (const [mode, modIdValue] of Object.entries(value.activation.toolbarModeMap)) {
      if (!isToolbarMode(mode)) {
        return fail(
          "invalid-toolbar-mode-map",
          `manifest.activation.toolbarModeMap.${mode}`,
          "toolbarModeMap includes an unknown toolbar mode key."
        );
      }
      if (!isNonEmptyString(modIdValue)) {
        return fail(
          "invalid-toolbar-mode-map",
          `manifest.activation.toolbarModeMap.${mode}`,
          "toolbarModeMap values must be non-empty strings."
        );
      }
      if (!modIdSet.has(modIdValue)) {
        return fail(
          "invalid-toolbar-mode-map",
          `manifest.activation.toolbarModeMap.${mode}`,
          "toolbarModeMap values must exist in modIds."
        );
      }
      normalized[mode] = modIdValue;
    }

    toolbarModeMap = normalized;
  }

  let uiPolicy: ModPackageDefinition["uiPolicy"] = undefined;
  if (value.uiPolicy !== undefined) {
    if (!isPlainRecord(value.uiPolicy)) {
      return fail(
        "invalid-ui-policy",
        "manifest.uiPolicy",
        "uiPolicy must be an object."
      );
    }

    if (value.uiPolicy.allowToolbarContributionGroups !== undefined) {
      const groupsResult = toStringArray(
        value.uiPolicy.allowToolbarContributionGroups,
        "invalid-ui-policy",
        "manifest.uiPolicy.allowToolbarContributionGroups",
        "allowToolbarContributionGroups must be an array of non-empty strings."
      );
      if (!groupsResult.ok) {
        return groupsResult.value;
      }
      uiPolicy = {
        ...(uiPolicy ?? {}),
        allowToolbarContributionGroups: groupsResult.value,
      };
    }

    if (value.uiPolicy.allowPanelSlots !== undefined) {
      const slotsResult = toStringArray(
        value.uiPolicy.allowPanelSlots,
        "invalid-ui-policy",
        "manifest.uiPolicy.allowPanelSlots",
        "allowPanelSlots must be an array of non-empty strings."
      );
      if (!slotsResult.ok) {
        return slotsResult.value;
      }
      uiPolicy = {
        ...(uiPolicy ?? {}),
        allowPanelSlots: slotsResult.value,
      };
    }
  }

  let dependencies: ModPackageId[] | undefined = undefined;
  if (value.dependencies !== undefined) {
    const dependenciesResult = parseDependencies(value.dependencies);
    if (!dependenciesResult.ok) {
      return dependenciesResult.value;
    }
    dependencies = dependenciesResult.value;
  }

  let conflicts: ModPackageId[] | undefined = undefined;
  if (value.conflicts !== undefined) {
    const conflictsResult = parseConflicts(value.conflicts);
    if (!conflictsResult.ok) {
      return conflictsResult.value;
    }
    conflicts = conflictsResult.value;
  }

  if (
    value.defaultEnabled !== undefined &&
    typeof value.defaultEnabled !== "boolean"
  ) {
    return fail(
      "invalid-default-enabled",
      "manifest.defaultEnabled",
      "defaultEnabled must be a boolean when provided."
    );
  }

  return {
    ok: true,
    value: {
      packId: value.packId,
      version: value.version,
      label: value.label,
      modIds,
      activation: {
        defaultModId: value.activation.defaultModId,
        toolbarModeMap,
      },
      uiPolicy,
      dependencies,
      conflicts,
      defaultEnabled: value.defaultEnabled,
    },
  };
};

export const isModPackageDefinition = (
  value: unknown
): value is ModPackageDefinition => validateModPackageDefinition(value).ok;
