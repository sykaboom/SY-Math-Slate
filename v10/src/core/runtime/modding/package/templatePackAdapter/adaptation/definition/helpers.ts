import type { TemplatePackAdapterManifest } from "../../../templatePackAdapter.types";
import { selectTemplatePackToolbarDefinition } from "../../toolbarDefinition";

export const selectActivationToolbarModeMap = (
  manifest: TemplatePackAdapterManifest
): Record<string, string> | undefined => {
  const toolbarDefinition = selectTemplatePackToolbarDefinition(manifest);
  const toolbarModeMapEntries = toolbarDefinition
    ? toolbarDefinition.modeDefinitions.map((definition) => [
        definition.id,
        definition.fallbackModId,
      ])
    : [];
  return toolbarModeMapEntries.length > 0
    ? Object.fromEntries(toolbarModeMapEntries)
    : undefined;
};

export const selectModIds = (
  runtimeModId: string,
  activationToolbarModeMap: Record<string, string> | undefined
): string[] => {
  if (!activationToolbarModeMap) {
    return [runtimeModId];
  }
  return Array.from(new Set([runtimeModId, ...Object.values(activationToolbarModeMap)]));
};
