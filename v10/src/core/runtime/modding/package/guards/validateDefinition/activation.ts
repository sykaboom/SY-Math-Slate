import type { ModPackageToolbarMode } from "../../types";
import { fail, isPlainRecord } from "../utils";
import { appendToolbarModeMapEntry } from "./activation/entry";

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
    const appendResult = appendToolbarModeMapEntry(normalized, mode, modIdValue, modIdSet);
    if (!appendResult.ok) {
      return { ok: false, value: appendResult.value };
    }
  }

  return { ok: true, value: normalized };
};
