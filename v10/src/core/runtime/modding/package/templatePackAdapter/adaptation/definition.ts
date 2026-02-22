import type { ModPackageDefinition } from "../../types";
import type { TemplatePackAdapterManifest } from "../../templatePackAdapter.types";
import {
  selectActivationToolbarModeMap,
  selectModIds,
} from "./definition/helpers";
import { buildTemplatePackRuntimeModId } from "./runtimeModId";

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
