import type {
  ModPackageShortcutOperation,
  ModPackageShortcutRule,
} from "../../../../../../types";

export const buildShortcutRule = (
  shortcut: string,
  commandId: string,
  when: string | undefined,
  operation: ModPackageShortcutOperation | undefined
): ModPackageShortcutRule => ({
  shortcut: shortcut.trim(),
  commandId: commandId.trim(),
  ...(when ? { when } : {}),
  ...(operation ? { operation } : {}),
});
