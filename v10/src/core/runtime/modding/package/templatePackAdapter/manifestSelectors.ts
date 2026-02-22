import {
  listModPackagesDeterministically,
  selectModPackageById,
  selectPrimaryModPackage,
} from "../selectors";
import type { ModPackageDefinition, ModPackageId } from "../types";
import type { TemplatePackAdapterManifest } from "../templatePackAdapter.types";

export const listTemplatePackManifestsFromModPackages = (
  definitions: readonly ModPackageDefinition[],
  manifestsByPackId: ReadonlyMap<ModPackageId, TemplatePackAdapterManifest>
): TemplatePackAdapterManifest[] => {
  const orderedDefinitions = listModPackagesDeterministically(definitions);
  const manifests: TemplatePackAdapterManifest[] = [];
  for (const definition of orderedDefinitions) {
    const manifest = manifestsByPackId.get(definition.packId);
    if (!manifest) continue;
    manifests.push(manifest);
  }
  return manifests;
};

export const listTemplatePackManifestsFromModPackagesTyped = <
  TManifest extends TemplatePackAdapterManifest,
>(
  definitions: readonly ModPackageDefinition[],
  manifestsByPackId: ReadonlyMap<ModPackageId, TManifest>
): TManifest[] => {
  const orderedDefinitions = listModPackagesDeterministically(definitions);
  const manifests: TManifest[] = [];
  for (const definition of orderedDefinitions) {
    const manifest = manifestsByPackId.get(definition.packId);
    if (!manifest) continue;
    manifests.push(manifest);
  }
  return manifests;
};

export const selectTemplatePackManifestByModPackageId = (
  definitions: readonly ModPackageDefinition[],
  manifestsByPackId: ReadonlyMap<ModPackageId, TemplatePackAdapterManifest>,
  packId: ModPackageId | null | undefined
): TemplatePackAdapterManifest | null => {
  const definition = selectModPackageById(definitions, packId);
  if (!definition) return null;
  return manifestsByPackId.get(definition.packId) ?? null;
};

export const selectTemplatePackManifestByModPackageIdTyped = <
  TManifest extends TemplatePackAdapterManifest,
>(
  definitions: readonly ModPackageDefinition[],
  manifestsByPackId: ReadonlyMap<ModPackageId, TManifest>,
  packId: ModPackageId | null | undefined
): TManifest | null => {
  const definition = selectModPackageById(definitions, packId);
  if (!definition) return null;
  return manifestsByPackId.get(definition.packId) ?? null;
};

export const selectPrimaryTemplatePackManifestFromModPackages = (
  definitions: readonly ModPackageDefinition[],
  manifestsByPackId: ReadonlyMap<ModPackageId, TemplatePackAdapterManifest>
): TemplatePackAdapterManifest | null => {
  const definition = selectPrimaryModPackage(definitions);
  if (!definition) return null;
  return manifestsByPackId.get(definition.packId) ?? null;
};

export const selectPrimaryTemplatePackManifestFromModPackagesTyped = <
  TManifest extends TemplatePackAdapterManifest,
>(
  definitions: readonly ModPackageDefinition[],
  manifestsByPackId: ReadonlyMap<ModPackageId, TManifest>
): TManifest | null => {
  const definition = selectPrimaryModPackage(definitions);
  if (!definition) return null;
  return manifestsByPackId.get(definition.packId) ?? null;
};
