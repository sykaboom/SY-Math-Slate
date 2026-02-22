import type { ModPackageToolbarMode } from "../../types";
import { MOD_PACKAGE_TOOLBAR_MODES } from "../../types";

const KNOWN_TOOLBAR_MODES = new Set<string>(MOD_PACKAGE_TOOLBAR_MODES);

export const KNOWN_UI_ITEM_OPERATIONS = new Set(["add", "override", "remove"]);
export const KNOWN_COMMAND_OPERATIONS = new Set(["upsert", "remove"]);
export const KNOWN_SHORTCUT_OPERATIONS = new Set(["upsert", "remove"]);
export const KNOWN_INPUT_BEHAVIOR_STRATEGIES = new Set([
  "exclusive",
  "handled-pass-chain",
]);

export const isToolbarMode = (value: string): value is ModPackageToolbarMode =>
  KNOWN_TOOLBAR_MODES.has(value);
