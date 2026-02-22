import type { ModPackageDefinition } from "../../types";
import type { TemplatePackAdapterManifest } from "../../templatePackAdapter.types";
import { selectTemplatePackToolbarDefinition } from "../toolbarDefinition";
import { buildTemplatePackRuntimeModId } from "./runtimeModId";

const selectActivationToolbarModeMap = (manifest: TemplatePackAdapterManifest) => {
  const toolbarDefinition = selectTemplatePackToolbarDefinition(manifest);
  const toolbarModeMapEntries = toolbarDefinition
    ? toolbarDefinition.modeDefinitions.map((definition) =>
        [definition.id, definition.fallbackModId] as const
      )
    : [];
  return toolbarModeMapEntries.length > 0
    ? Object.fromEntries(toolbarModeMapEntries)
    : undefined;
};

const selectModIds = (
  runtimeModId: string,
  activationToolbarModeMap: Record<string, string> | undefined
): string[] => {
  if (!activationToolbarModeMap) {
    return [runtimeModId];
  }
  return Array.from(
    new Set([runtimeModId, ...Object.values(activationToolbarModeMap)])
  );
};

export const adaptTemplatePackManifestToModPackageDefinition = (
  manifest: TemplatePackAdapterManifest
): ModPackageDefinition => {
  const runtimeModId = buildTemplatePackRuntimeModId(manifest.packId);
  const activationToolbarModeMap = selectActivationToolbarModeMap(manifest);
  const modIds = selectModIds(runtimeModId, activationToolbarModeMap);
  return {
    packId: manifest.packId,
    version: `template-pack-manifest-v${manifest.manifestVersion}`,
    label: manifest.title,
    modIds,
    activation: {
      ...(activationToolbarModeMap ? { toolbarModeMap: activationToolbarModeMap } : {}),
      defaultModId: runtimeModId,
    },
    defaultEnabled: manifest.defaultEnabled,
  };
};
