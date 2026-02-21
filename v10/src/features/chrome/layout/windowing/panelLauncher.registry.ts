import {
  listCoreTemplateLauncherEntries,
  type CoreTemplateLauncherEntry,
} from "@features/platform/extensions/ui/coreTemplates";
import type { UISlotName } from "@core/runtime/plugin-runtime/registry";

export type PanelLauncherRegistryEntry = {
  launcherId: string;
  templateId: string;
  panelId: string;
  title: string;
  description: string;
  icon: string;
  slot: UISlotName;
  pluginId: string;
  enabled: boolean;
  source: "core-template";
};

const toPanelLauncherRegistryEntry = (
  entry: CoreTemplateLauncherEntry
): PanelLauncherRegistryEntry => ({
  launcherId: entry.launcherId,
  templateId: entry.templateId,
  panelId: entry.panelId,
  title: entry.title,
  description: entry.description,
  icon: entry.icon,
  slot: entry.slot,
  pluginId: entry.pluginId,
  enabled: entry.enabled,
  source: "core-template",
});

export const listPanelLauncherRegistryEntries = (): readonly PanelLauncherRegistryEntry[] =>
  listCoreTemplateLauncherEntries().map(toPanelLauncherRegistryEntry);

export const getPanelLauncherRegistryEntry = (
  launcherId: string
): PanelLauncherRegistryEntry | null => {
  const normalizedLauncherId = launcherId.trim();
  if (normalizedLauncherId === "") return null;

  const matched = listPanelLauncherRegistryEntries().find(
    (entry) => entry.launcherId === normalizedLauncherId
  );
  return matched ?? null;
};

