import type {
  ModPackageJsonObject,
  ModPackageCommandRule,
  ModPackageDefinition,
  ModPackageId,
  ModPackageInputBehaviorRule,
  ModPackageShortcutRule,
  ModPackageToolbarMode,
  ModPackageUIItemRule,
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
    | "invalid-resource-policy"
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
const KNOWN_UI_ITEM_OPERATIONS = new Set(["add", "override", "remove"]);
const KNOWN_COMMAND_OPERATIONS = new Set(["upsert", "remove"]);
const KNOWN_SHORTCUT_OPERATIONS = new Set(["upsert", "remove"]);
const KNOWN_INPUT_BEHAVIOR_STRATEGIES = new Set([
  "exclusive",
  "handled-pass-chain",
]);

const fail = (
  code: ModPackageValidationFailure["code"],
  path: string,
  message: string
): ModPackageValidationFailure => ({ ok: false, code, path, message });

const isPlainRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim() !== "";

const isJsonPrimitive = (value: unknown): boolean =>
  value === null ||
  typeof value === "string" ||
  typeof value === "number" ||
  typeof value === "boolean";

const isJsonValue = (value: unknown, depth = 0): boolean => {
  if (depth > 32) return false;
  if (isJsonPrimitive(value)) return true;
  if (Array.isArray(value)) {
    return value.every((entry) => isJsonValue(entry, depth + 1));
  }
  if (isPlainRecord(value)) {
    return Object.values(value).every((entry) => isJsonValue(entry, depth + 1));
  }
  return false;
};

const isJsonObject = (value: unknown): value is ModPackageJsonObject =>
  isPlainRecord(value) && isJsonValue(value);

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

const parseUIItemRules = (
  value: unknown,
  path: string
): { ok: true; value: ModPackageUIItemRule[] } | { ok: false; value: ModPackageValidationFailure } => {
  if (!Array.isArray(value)) {
    return {
      ok: false,
      value: fail(
        "invalid-ui-policy",
        path,
        "ui item rules must be an array."
      ),
    };
  }

  const normalized: ModPackageUIItemRule[] = [];
  for (let index = 0; index < value.length; index += 1) {
    const entry = value[index];
    const entryPath = `${path}.${index}`;
    if (!isPlainRecord(entry)) {
      return {
        ok: false,
        value: fail(
          "invalid-ui-policy",
          entryPath,
          "ui item rule must be an object."
        ),
      };
    }

    if (!isNonEmptyString(entry.slotId)) {
      return {
        ok: false,
        value: fail(
          "invalid-ui-policy",
          `${entryPath}.slotId`,
          "slotId must be a non-empty string."
        ),
      };
    }
    if (!isNonEmptyString(entry.itemId)) {
      return {
        ok: false,
        value: fail(
          "invalid-ui-policy",
          `${entryPath}.itemId`,
          "itemId must be a non-empty string."
        ),
      };
    }

    const operationValue = entry.operation;
    if (
      operationValue !== undefined &&
      (typeof operationValue !== "string" ||
        !KNOWN_UI_ITEM_OPERATIONS.has(operationValue))
    ) {
      return {
        ok: false,
        value: fail(
          "invalid-ui-policy",
          `${entryPath}.operation`,
          "operation must be one of add/override/remove."
        ),
      };
    }
    const operation = operationValue as ModPackageUIItemRule["operation"] | undefined;

    const normalizedEntry: ModPackageUIItemRule = {
      slotId: entry.slotId.trim(),
      itemId: entry.itemId.trim(),
      ...(operation ? { operation } : {}),
    };

    const optionalStringKeys: Array<keyof ModPackageUIItemRule> = [
      "commandId",
      "label",
      "icon",
      "title",
      "group",
      "when",
    ];
    for (const key of optionalStringKeys) {
      const raw = entry[key];
      if (raw === undefined) continue;
      if (!isNonEmptyString(raw)) {
        return {
          ok: false,
          value: fail(
            "invalid-ui-policy",
            `${entryPath}.${key}`,
            `${key} must be a non-empty string when provided.`
          ),
        };
      }
      (normalizedEntry as Record<string, unknown>)[key] = raw.trim();
    }

    if (entry.order !== undefined) {
      if (typeof entry.order !== "number" || !Number.isFinite(entry.order)) {
        return {
          ok: false,
          value: fail(
            "invalid-ui-policy",
            `${entryPath}.order`,
            "order must be a finite number when provided."
          ),
        };
      }
      normalizedEntry.order = entry.order;
    }

    if (entry.defaultOpen !== undefined) {
      if (typeof entry.defaultOpen !== "boolean") {
        return {
          ok: false,
          value: fail(
            "invalid-ui-policy",
            `${entryPath}.defaultOpen`,
            "defaultOpen must be a boolean when provided."
          ),
        };
      }
      normalizedEntry.defaultOpen = entry.defaultOpen;
    }

    normalized.push(normalizedEntry);
  }

  return { ok: true, value: normalized };
};

const parseCommandRules = (
  value: unknown
): { ok: true; value: ModPackageCommandRule[] } | { ok: false; value: ModPackageValidationFailure } => {
  if (!Array.isArray(value)) {
    return {
      ok: false,
      value: fail(
        "invalid-resource-policy",
        "manifest.resourcePolicy.commands",
        "commands must be an array."
      ),
    };
  }

  const normalized: ModPackageCommandRule[] = [];
  for (let index = 0; index < value.length; index += 1) {
    const entry = value[index];
    const entryPath = `manifest.resourcePolicy.commands.${index}`;
    if (!isPlainRecord(entry) || !isNonEmptyString(entry.commandId)) {
      return {
        ok: false,
        value: fail(
          "invalid-resource-policy",
          `${entryPath}.commandId`,
          "commandId must be a non-empty string."
        ),
      };
    }
    const operationValue = entry.operation;
    if (
      operationValue !== undefined &&
      (typeof operationValue !== "string" ||
        !KNOWN_COMMAND_OPERATIONS.has(operationValue))
    ) {
      return {
        ok: false,
        value: fail(
          "invalid-resource-policy",
          `${entryPath}.operation`,
          "operation must be one of upsert/remove."
        ),
      };
    }
    const operation = operationValue as ModPackageCommandRule["operation"] | undefined;
    if (
      entry.overrideAllowed !== undefined &&
      typeof entry.overrideAllowed !== "boolean"
    ) {
      return {
        ok: false,
        value: fail(
          "invalid-resource-policy",
          `${entryPath}.overrideAllowed`,
          "overrideAllowed must be boolean when provided."
        ),
      };
    }
    normalized.push({
      commandId: entry.commandId.trim(),
      ...(operation ? { operation } : {}),
      ...(entry.overrideAllowed !== undefined
        ? { overrideAllowed: entry.overrideAllowed }
        : {}),
    });
  }

  return { ok: true, value: normalized };
};

const parseShortcutRules = (
  value: unknown
): { ok: true; value: ModPackageShortcutRule[] } | { ok: false; value: ModPackageValidationFailure } => {
  if (!Array.isArray(value)) {
    return {
      ok: false,
      value: fail(
        "invalid-resource-policy",
        "manifest.resourcePolicy.shortcuts",
        "shortcuts must be an array."
      ),
    };
  }

  const normalized: ModPackageShortcutRule[] = [];
  for (let index = 0; index < value.length; index += 1) {
    const entry = value[index];
    const entryPath = `manifest.resourcePolicy.shortcuts.${index}`;
    if (
      !isPlainRecord(entry) ||
      !isNonEmptyString(entry.shortcut) ||
      !isNonEmptyString(entry.commandId)
    ) {
      return {
        ok: false,
        value: fail(
          "invalid-resource-policy",
          entryPath,
          "shortcut and commandId must be non-empty strings."
        ),
      };
    }

    const operationValue = entry.operation;
    if (
      operationValue !== undefined &&
      (typeof operationValue !== "string" ||
        !KNOWN_SHORTCUT_OPERATIONS.has(operationValue))
    ) {
      return {
        ok: false,
        value: fail(
          "invalid-resource-policy",
          `${entryPath}.operation`,
          "operation must be one of upsert/remove."
        ),
      };
    }
    const operation = operationValue as ModPackageShortcutRule["operation"] | undefined;

    if (entry.when !== undefined && !isNonEmptyString(entry.when)) {
      return {
        ok: false,
        value: fail(
          "invalid-resource-policy",
          `${entryPath}.when`,
          "when must be a non-empty string when provided."
        ),
      };
    }

    normalized.push({
      shortcut: entry.shortcut.trim(),
      commandId: entry.commandId.trim(),
      ...(entry.when ? { when: entry.when.trim() } : {}),
      ...(operation ? { operation } : {}),
    });
  }

  return { ok: true, value: normalized };
};

const parseInputBehaviorRule = (
  value: unknown,
  modIdSet: Set<string>
): { ok: true; value: ModPackageInputBehaviorRule } | { ok: false; value: ModPackageValidationFailure } => {
  if (!isPlainRecord(value)) {
    return {
      ok: false,
      value: fail(
        "invalid-resource-policy",
        "manifest.resourcePolicy.inputBehavior",
        "inputBehavior must be an object."
      ),
    };
  }
  if (
    typeof value.strategy !== "string" ||
    !KNOWN_INPUT_BEHAVIOR_STRATEGIES.has(value.strategy)
  ) {
    return {
      ok: false,
      value: fail(
        "invalid-resource-policy",
        "manifest.resourcePolicy.inputBehavior.strategy",
        "strategy must be one of exclusive/handled-pass-chain."
      ),
    };
  }

  let modId: string | undefined;
  if (value.modId !== undefined) {
    if (!isNonEmptyString(value.modId)) {
      return {
        ok: false,
        value: fail(
          "invalid-resource-policy",
          "manifest.resourcePolicy.inputBehavior.modId",
          "modId must be a non-empty string when provided."
        ),
      };
    }
    if (!modIdSet.has(value.modId)) {
      return {
        ok: false,
        value: fail(
          "invalid-resource-policy",
          "manifest.resourcePolicy.inputBehavior.modId",
          "modId must exist in modIds."
        ),
      };
    }
    modId = value.modId.trim();
  }

  let chain: string[] | undefined;
  if (value.chain !== undefined) {
    const chainResult = toStringArray(
      value.chain,
      "invalid-resource-policy",
      "manifest.resourcePolicy.inputBehavior.chain",
      "chain must be an array of non-empty strings."
    );
    if (!chainResult.ok) {
      return { ok: false, value: chainResult.value };
    }
    for (const chainModId of chainResult.value) {
      if (!modIdSet.has(chainModId)) {
        return {
          ok: false,
          value: fail(
            "invalid-resource-policy",
            "manifest.resourcePolicy.inputBehavior.chain",
            "chain entries must exist in modIds."
          ),
        };
      }
    }
    chain = [...new Set(chainResult.value.map((entry) => entry.trim()))];
  }

  return {
    ok: true,
    value: {
      strategy: value.strategy as ModPackageInputBehaviorRule["strategy"],
      ...(modId ? { modId } : {}),
      ...(chain ? { chain } : {}),
    },
  };
};

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
