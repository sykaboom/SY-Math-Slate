import { selectModPackageById } from "../../selectors";
import type { ModPackageDefinition, ModPackageId } from "../../types";
import type { TemplatePackAdapterManifest } from "../../templatePackAdapter.types";

const selectByModPackageId = <TManifest extends TemplatePackAdapterManifest>(
  definitions: readonly ModPackageDefinition[],
  manifestsByPackId: ReadonlyMap<ModPackageId, TManifest>,
  packId: ModPackageId | null | undefined
): TManifest | null => {
  const definition = selectModPackageById(definitions, packId);
  if (!definition) return null;
  return manifestsByPackId.get(definition.packId) ?? null;
};

export const selectTemplatePackManifestByModPackageId = (
  definitions: readonly ModPackageDefinition[],
  manifestsByPackId: ReadonlyMap<ModPackageId, TemplatePackAdapterManifest>,
  packId: ModPackageId | null | undefined
): TemplatePackAdapterManifest | null =>
  selectByModPackageId(definitions, manifestsByPackId, packId);

export const selectTemplatePackManifestByModPackageIdTyped = <
  TManifest extends TemplatePackAdapterManifest,
>(
  definitions: readonly ModPackageDefinition[],
  manifestsByPackId: ReadonlyMap<ModPackageId, TManifest>,
  packId: ModPackageId | null | undefined
): TManifest | null => selectByModPackageId(definitions, manifestsByPackId, packId);
