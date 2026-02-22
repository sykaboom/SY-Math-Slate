import type { ModPackageDefinition } from "../../types";
import {
  parseCommandRules,
  parseInputBehaviorRule,
  parseShortcutRules,
} from "../resourcePolicy";
import { parseUIItemRules } from "../uiPolicy";
import { fail, isJsonObject, isPlainRecord, toStringArray } from "../utils";

export const parseUiPolicy = (
  value: unknown
):
  | { ok: true; value: ModPackageDefinition["uiPolicy"] }
  | { ok: false; value: ReturnType<typeof fail> } => {
  if (value === undefined) {
    return { ok: true, value: undefined };
  }
  if (!isPlainRecord(value)) {
    return {
      ok: false,
      value: fail("invalid-ui-policy", "manifest.uiPolicy", "uiPolicy must be an object."),
    };
  }

  let uiPolicy: ModPackageDefinition["uiPolicy"] = undefined;

  if (value.allowToolbarContributionGroups !== undefined) {
    const groupsResult = toStringArray(
      value.allowToolbarContributionGroups,
      "invalid-ui-policy",
      "manifest.uiPolicy.allowToolbarContributionGroups",
      "allowToolbarContributionGroups must be an array of non-empty strings."
    );
    if (!groupsResult.ok) {
      return { ok: false, value: groupsResult.value };
    }
    uiPolicy = {
      ...(uiPolicy ?? {}),
      allowToolbarContributionGroups: groupsResult.value,
    };
  }

  if (value.allowPanelSlots !== undefined) {
    const slotsResult = toStringArray(
      value.allowPanelSlots,
      "invalid-ui-policy",
      "manifest.uiPolicy.allowPanelSlots",
      "allowPanelSlots must be an array of non-empty strings."
    );
    if (!slotsResult.ok) {
      return { ok: false, value: slotsResult.value };
    }
    uiPolicy = {
      ...(uiPolicy ?? {}),
      allowPanelSlots: slotsResult.value,
    };
  }

  if (value.toolbarItems !== undefined) {
    const toolbarItemsResult = parseUIItemRules(
      value.toolbarItems,
      "manifest.uiPolicy.toolbarItems"
    );
    if (!toolbarItemsResult.ok) {
      return { ok: false, value: toolbarItemsResult.value };
    }
    uiPolicy = {
      ...(uiPolicy ?? {}),
      toolbarItems: toolbarItemsResult.value,
    };
  }

  if (value.panelItems !== undefined) {
    const panelItemsResult = parseUIItemRules(
      value.panelItems,
      "manifest.uiPolicy.panelItems"
    );
    if (!panelItemsResult.ok) {
      return { ok: false, value: panelItemsResult.value };
    }
    uiPolicy = {
      ...(uiPolicy ?? {}),
      panelItems: panelItemsResult.value,
    };
  }

  return { ok: true, value: uiPolicy };
};

export const parseResourcePolicy = (
  value: unknown,
  modIdSet: Set<string>
):
  | { ok: true; value: ModPackageDefinition["resourcePolicy"] }
  | { ok: false; value: ReturnType<typeof fail> } => {
  if (value === undefined) {
    return { ok: true, value: undefined };
  }

  if (!isPlainRecord(value)) {
    return {
      ok: false,
      value: fail(
        "invalid-resource-policy",
        "manifest.resourcePolicy",
        "resourcePolicy must be an object."
      ),
    };
  }

  let resourcePolicy: ModPackageDefinition["resourcePolicy"] = undefined;

  if (value.policyPatch !== undefined) {
    if (!isJsonObject(value.policyPatch)) {
      return {
        ok: false,
        value: fail(
          "invalid-resource-policy",
          "manifest.resourcePolicy.policyPatch",
          "policyPatch must be a JSON object."
        ),
      };
    }
    resourcePolicy = {
      ...(resourcePolicy ?? {}),
      policyPatch: value.policyPatch,
    };
  }

  if (value.commands !== undefined) {
    const commandsResult = parseCommandRules(value.commands);
    if (!commandsResult.ok) {
      return { ok: false, value: commandsResult.value };
    }
    resourcePolicy = {
      ...(resourcePolicy ?? {}),
      commands: commandsResult.value,
    };
  }

  if (value.shortcuts !== undefined) {
    const shortcutsResult = parseShortcutRules(value.shortcuts);
    if (!shortcutsResult.ok) {
      return { ok: false, value: shortcutsResult.value };
    }
    resourcePolicy = {
      ...(resourcePolicy ?? {}),
      shortcuts: shortcutsResult.value,
    };
  }

  if (value.inputBehavior !== undefined) {
    const inputBehaviorResult = parseInputBehaviorRule(value.inputBehavior, modIdSet);
    if (!inputBehaviorResult.ok) {
      return { ok: false, value: inputBehaviorResult.value };
    }
    resourcePolicy = {
      ...(resourcePolicy ?? {}),
      inputBehavior: inputBehaviorResult.value,
    };
  }

  return { ok: true, value: resourcePolicy };
};
