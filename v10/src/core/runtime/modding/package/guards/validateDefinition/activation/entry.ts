import type { ModPackageToolbarMode } from "../../../types";
import { fail, isNonEmptyString, isToolbarMode } from "../../utils";

export const appendToolbarModeMapEntry = (
  normalized: Partial<Record<ModPackageToolbarMode, string>>,
  mode: string,
  modIdValue: unknown,
  modIdSet: Set<string>
): { ok: true } | { ok: false; value: ReturnType<typeof fail> } => {
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
  return { ok: true };
};
