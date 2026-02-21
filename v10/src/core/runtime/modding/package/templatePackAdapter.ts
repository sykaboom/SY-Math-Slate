import {
  type ModPackageValidationFailure,
  validateModPackageDefinition,
} from "./guards";
import {
  listModPackagesDeterministically,
  selectModPackageById,
  selectPrimaryModPackage,
} from "./selectors";
import type { ModPackageDefinition, ModPackageId } from "./types";
import type { TemplatePackAdapterManifest } from "./templatePackAdapter.types";

export type TemplatePackAdapterValidationFailure = {
  ok: false;
  code: "invalid-adapted-package";
  path: string;
  message: string;
  cause: ModPackageValidationFailure["code"];
};

export type TemplatePackAdapterValidationSuccess = {
  ok: true;
  value: ModPackageDefinition;
};

export type TemplatePackAdapterValidationResult =
  | TemplatePackAdapterValidationFailure
  | TemplatePackAdapterValidationSuccess;

const RUNTIME_TEMPLATE_PACK_MOD_ID_PREFIX = "template-pack.runtime";

export const buildTemplatePackRuntimeModId = (packId: string): string =>
  `${RUNTIME_TEMPLATE_PACK_MOD_ID_PREFIX}.${packId}`;

export const adaptTemplatePackManifestToModPackageDefinition = (
  manifest: TemplatePackAdapterManifest
): ModPackageDefinition => {
  const runtimeModId = buildTemplatePackRuntimeModId(manifest.packId);
  return {
    packId: manifest.packId,
    version: `template-pack-manifest-v${manifest.manifestVersion}`,
    label: manifest.title,
    modIds: [runtimeModId],
    activation: {
      defaultModId: runtimeModId,
    },
    defaultEnabled: manifest.defaultEnabled,
  };
};

export const validateTemplatePackAdapterManifest = (
  manifest: TemplatePackAdapterManifest
): TemplatePackAdapterValidationResult => {
  const definition = adaptTemplatePackManifestToModPackageDefinition(manifest);
  const validation = validateModPackageDefinition(definition);
  if (!validation.ok) {
    return {
      ok: false,
      code: "invalid-adapted-package",
      path: validation.path,
      message: validation.message,
      cause: validation.code,
    };
  }
  return {
    ok: true,
    value: validation.value,
  };
};

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
  TManifest extends TemplatePackAdapterManifest
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
  TManifest extends TemplatePackAdapterManifest
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
  TManifest extends TemplatePackAdapterManifest
>(
  definitions: readonly ModPackageDefinition[],
  manifestsByPackId: ReadonlyMap<ModPackageId, TManifest>
): TManifest | null => {
  const definition = selectPrimaryModPackage(definitions);
  if (!definition) return null;
  return manifestsByPackId.get(definition.packId) ?? null;
};
