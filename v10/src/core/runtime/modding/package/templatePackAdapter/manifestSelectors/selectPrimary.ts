import { selectPrimaryModPackage } from "../../selectors";
import type { ModPackageDefinition, ModPackageId } from "../../types";
import type { TemplatePackAdapterManifest } from "../../templatePackAdapter.types";

const selectPrimaryManifest = <TManifest extends TemplatePackAdapterManifest>(
  definitions: readonly ModPackageDefinition[],
  manifestsByPackId: ReadonlyMap<ModPackageId, TManifest>
): TManifest | null => {
  const definition = selectPrimaryModPackage(definitions);
  if (!definition) return null;
  return manifestsByPackId.get(definition.packId) ?? null;
};

export const selectPrimaryTemplatePackManifestFromModPackages = (
  definitions: readonly ModPackageDefinition[],
  manifestsByPackId: ReadonlyMap<ModPackageId, TemplatePackAdapterManifest>
): TemplatePackAdapterManifest | null =>
  selectPrimaryManifest(definitions, manifestsByPackId);

export const selectPrimaryTemplatePackManifestFromModPackagesTyped = <
  TManifest extends TemplatePackAdapterManifest,
>(
  definitions: readonly ModPackageDefinition[],
  manifestsByPackId: ReadonlyMap<ModPackageId, TManifest>
): TManifest | null => selectPrimaryManifest(definitions, manifestsByPackId);
