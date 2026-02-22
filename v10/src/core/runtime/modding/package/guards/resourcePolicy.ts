import type {
  ModPackageCommandRule,
  ModPackageInputBehaviorRule,
  ModPackageShortcutRule,
} from "../types";
import type { ModPackageValidationFailure } from "./types";
import {
  KNOWN_COMMAND_OPERATIONS,
  KNOWN_INPUT_BEHAVIOR_STRATEGIES,
  KNOWN_SHORTCUT_OPERATIONS,
  fail,
  isNonEmptyString,
  isPlainRecord,
  toStringArray,
} from "./utils";

export const parseCommandRules = (
  value: unknown
):
  | { ok: true; value: ModPackageCommandRule[] }
  | { ok: false; value: ModPackageValidationFailure } => {
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

export const parseShortcutRules = (
  value: unknown
):
  | { ok: true; value: ModPackageShortcutRule[] }
  | { ok: false; value: ModPackageValidationFailure } => {
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

export const parseInputBehaviorRule = (
  value: unknown,
  modIdSet: Set<string>
):
  | { ok: true; value: ModPackageInputBehaviorRule }
  | { ok: false; value: ModPackageValidationFailure } => {
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
