import type { ModPackageToolbarMode } from "../../types";
import { fail, isNonEmptyString, isPlainRecord, isToolbarMode } from "../utils";

export const parseActivationToolbarModeMap = (
  activation: Record<string, unknown>,
  modIdSet: Set<string>
):
  | { ok: true; value: Partial<Record<ModPackageToolbarMode, string>> | undefined }
  | { ok: false; value: ReturnType<typeof fail> } => {
  const toolbarModeMapValue = activation.toolbarModeMap;
  if (toolbarModeMapValue === undefined) {
    return { ok: true, value: undefined };
  }

  if (!isPlainRecord(toolbarModeMapValue)) {
    return {
      ok: false,
      value: fail(
        "invalid-toolbar-mode-map",
        "manifest.activation.toolbarModeMap",
        "toolbarModeMap must be an object."
      ),
    };
  }

  const normalized: Partial<Record<ModPackageToolbarMode, string>> = {};
  for (const [mode, modIdValue] of Object.entries(toolbarModeMapValue)) {
    if (!isToolbarMode(mode)) {
      return {
        ok: false,
        value: fail(
          "invalid-toolbar-mode-map",
          `manifest.activation.toolbarModeMap.${mode}`,
          "toolbarModeMap includes an unknown toolbar mode key."
        ),
      };
    }
    if (!isNonEmptyString(modIdValue)) {
      return {
        ok: false,
        value: fail(
          "invalid-toolbar-mode-map",
          `manifest.activation.toolbarModeMap.${mode}`,
          "toolbarModeMap values must be non-empty strings."
        ),
      };
    }
    if (!modIdSet.has(modIdValue)) {
      return {
        ok: false,
        value: fail(
          "invalid-toolbar-mode-map",
          `manifest.activation.toolbarModeMap.${mode}`,
          "toolbarModeMap values must exist in modIds."
        ),
      };
    }
    normalized[mode] = modIdValue;
  }

  return { ok: true, value: normalized };
};
