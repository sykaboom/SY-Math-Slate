import { listModPackagesDeterministically } from "../../selectors";
import type { ModPackageDefinition, ModPackageId } from "../../types";
import type { TemplatePackAdapterManifest } from "../../templatePackAdapter.types";

const listFromDeterministicDefinitions = <TManifest extends TemplatePackAdapterManifest>(
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

export const listTemplatePackManifestsFromModPackages = (
  definitions: readonly ModPackageDefinition[],
  manifestsByPackId: ReadonlyMap<ModPackageId, TemplatePackAdapterManifest>
): TemplatePackAdapterManifest[] =>
  listFromDeterministicDefinitions(definitions, manifestsByPackId);

export const listTemplatePackManifestsFromModPackagesTyped = <
  TManifest extends TemplatePackAdapterManifest,
>(
  definitions: readonly ModPackageDefinition[],
  manifestsByPackId: ReadonlyMap<ModPackageId, TManifest>
): TManifest[] => listFromDeterministicDefinitions(definitions, manifestsByPackId);
