import type {
  ModPackageDefinition,
  ModPackageId,
  ModPackageToolbarMode,
} from "../types";
import {
  parseCommandRules,
  parseInputBehaviorRule,
  parseShortcutRules,
} from "./resourcePolicy";
import type { ModPackageValidationResult } from "./types";
import { parseUIItemRules } from "./uiPolicy";
import {
  fail,
  hasDuplicateStrings,
  isJsonObject,
  isNonEmptyString,
  isPlainRecord,
  isToolbarMode,
  toStringArray,
} from "./utils";

const parseDependencies = (
  value: unknown
):
  | { ok: true; value: ModPackageId[] }
  | { ok: false; value: ReturnType<typeof fail> } =>
  toStringArray(
    value,
    "invalid-dependencies",
    "manifest.dependencies",
    "dependencies must be an array of non-empty strings."
  );

const parseConflicts = (
  value: unknown
):
  | { ok: true; value: ModPackageId[] }
  | { ok: false; value: ReturnType<typeof fail> } =>
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

    if (value.uiPolicy.toolbarItems !== undefined) {
      const toolbarItemsResult = parseUIItemRules(
        value.uiPolicy.toolbarItems,
        "manifest.uiPolicy.toolbarItems"
      );
      if (!toolbarItemsResult.ok) {
        return toolbarItemsResult.value;
      }
      uiPolicy = {
        ...(uiPolicy ?? {}),
        toolbarItems: toolbarItemsResult.value,
      };
    }

    if (value.uiPolicy.panelItems !== undefined) {
      const panelItemsResult = parseUIItemRules(
        value.uiPolicy.panelItems,
        "manifest.uiPolicy.panelItems"
      );
      if (!panelItemsResult.ok) {
        return panelItemsResult.value;
      }
      uiPolicy = {
        ...(uiPolicy ?? {}),
        panelItems: panelItemsResult.value,
      };
    }
  }

  let resourcePolicy: ModPackageDefinition["resourcePolicy"] = undefined;
  if (value.resourcePolicy !== undefined) {
    if (!isPlainRecord(value.resourcePolicy)) {
      return fail(
        "invalid-resource-policy",
        "manifest.resourcePolicy",
        "resourcePolicy must be an object."
      );
    }

    if (value.resourcePolicy.policyPatch !== undefined) {
      if (!isJsonObject(value.resourcePolicy.policyPatch)) {
        return fail(
          "invalid-resource-policy",
          "manifest.resourcePolicy.policyPatch",
          "policyPatch must be a JSON object."
        );
      }
      resourcePolicy = {
        ...(resourcePolicy ?? {}),
        policyPatch: value.resourcePolicy.policyPatch,
      };
    }

    if (value.resourcePolicy.commands !== undefined) {
      const commandsResult = parseCommandRules(value.resourcePolicy.commands);
      if (!commandsResult.ok) {
        return commandsResult.value;
      }
      resourcePolicy = {
        ...(resourcePolicy ?? {}),
        commands: commandsResult.value,
      };
    }

    if (value.resourcePolicy.shortcuts !== undefined) {
      const shortcutsResult = parseShortcutRules(value.resourcePolicy.shortcuts);
      if (!shortcutsResult.ok) {
        return shortcutsResult.value;
      }
      resourcePolicy = {
        ...(resourcePolicy ?? {}),
        shortcuts: shortcutsResult.value,
      };
    }

    if (value.resourcePolicy.inputBehavior !== undefined) {
      const inputBehaviorResult = parseInputBehaviorRule(
        value.resourcePolicy.inputBehavior,
        modIdSet
      );
      if (!inputBehaviorResult.ok) {
        return inputBehaviorResult.value;
      }
      resourcePolicy = {
        ...(resourcePolicy ?? {}),
        inputBehavior: inputBehaviorResult.value,
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
      resourcePolicy,
      dependencies,
      conflicts,
      defaultEnabled: value.defaultEnabled,
    },
  };
};

export const isModPackageDefinition = (
  value: unknown
): value is ModPackageDefinition => validateModPackageDefinition(value).ok;
