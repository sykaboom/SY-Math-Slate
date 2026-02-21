import {
  clearRuntimeModPackageRegistry,
  listRuntimeModPackages,
  listTemplatePackManifestsFromModPackagesTyped,
  registerRuntimeModPackages,
  selectPrimaryTemplatePackManifestFromModPackagesTyped,
  selectTemplatePackManifestByModPackageIdTyped,
  validateTemplatePackAdapterManifest,
  type ModPackageDefinition,
} from "@core/mod/package";
import {
  isTemplatePackManifest,
  validateTemplatePackManifest,
  type TemplatePackValidationFailure,
  type TemplatePackValidationResult,
} from "../schema/templatePack.guards";
import type { TemplatePackManifest } from "../schema/templatePack.types";
import { listDefaultEnabledTemplatePacks } from "../packs";

const runtimeTemplatePackManifestRegistry = new Map<string, TemplatePackManifest>();

let hasBootstrappedDefaultPacks = false;

const toTemplatePackRegistryFailure = (
  path: string,
  message: string
): TemplatePackValidationFailure => ({
  ok: false,
  code: "invalid-root",
  path,
  message,
});

const syncRuntimeModPackageRegistryFromTemplatePacks = (): TemplatePackValidationFailure | null => {
  clearRuntimeModPackageRegistry();
  const adaptedDefinitions: ModPackageDefinition[] = [];

  for (const manifest of runtimeTemplatePackManifestRegistry.values()) {
    const adapted = validateTemplatePackAdapterManifest(manifest);
    if (!adapted.ok) {
      clearRuntimeModPackageRegistry();
      return toTemplatePackRegistryFailure(adapted.path, adapted.message);
    }
    adaptedDefinitions.push(adapted.value);
  }

  for (const registration of registerRuntimeModPackages(adaptedDefinitions)) {
    if (!registration.result.ok) {
      clearRuntimeModPackageRegistry();
      return toTemplatePackRegistryFailure(
        registration.result.path,
        registration.result.message
      );
    }
  }

  return null;
};

const listRuntimeTemplatePackDefinitions = () =>
  listRuntimeModPackages().filter((definition) =>
    runtimeTemplatePackManifestRegistry.has(definition.packId)
  );

const bootstrapDefaultTemplatePacks = (): void => {
  if (hasBootstrappedDefaultPacks) return;
  for (const pack of listDefaultEnabledTemplatePacks()) {
    runtimeTemplatePackManifestRegistry.set(pack.packId, pack);
  }

  const syncFailure = syncRuntimeModPackageRegistryFromTemplatePacks();
  if (syncFailure) {
    throw new Error(
      `[templatePackRegistry] failed to bootstrap default packs: ${syncFailure.path} ${syncFailure.message}`
    );
  }
  hasBootstrappedDefaultPacks = true;
};

export const registerRuntimeTemplatePack = (
  value: unknown
): TemplatePackValidationResult & { replaced?: boolean } => {
  const validation = validateTemplatePackManifest(value);
  if (!validation.ok) return validation;

  const packId = validation.value.packId;
  const replaced = runtimeTemplatePackManifestRegistry.has(packId);
  const previousManifest = runtimeTemplatePackManifestRegistry.get(packId) ?? null;
  runtimeTemplatePackManifestRegistry.set(packId, validation.value);

  const syncFailure = syncRuntimeModPackageRegistryFromTemplatePacks();
  if (syncFailure) {
    if (previousManifest) {
      runtimeTemplatePackManifestRegistry.set(packId, previousManifest);
    } else {
      runtimeTemplatePackManifestRegistry.delete(packId);
    }

    const rollbackFailure = syncRuntimeModPackageRegistryFromTemplatePacks();
    if (rollbackFailure) {
      throw new Error(
        `[templatePackRegistry] failed to roll back registry sync: ${rollbackFailure.path} ${rollbackFailure.message}`
      );
    }
    return syncFailure;
  }

  return { ...validation, replaced };
};

export const listRuntimeTemplatePacks = (): readonly TemplatePackManifest[] => {
  bootstrapDefaultTemplatePacks();
  return listTemplatePackManifestsFromModPackagesTyped(
    listRuntimeTemplatePackDefinitions(),
    runtimeTemplatePackManifestRegistry
  );
};

export const getRuntimeTemplatePackById = (
  packId: string
): TemplatePackManifest | null => {
  bootstrapDefaultTemplatePacks();
  return selectTemplatePackManifestByModPackageIdTyped(
    listRuntimeTemplatePackDefinitions(),
    runtimeTemplatePackManifestRegistry,
    packId
  );
};

export const getPrimaryRuntimeTemplatePack = (): TemplatePackManifest | null => {
  bootstrapDefaultTemplatePacks();
  return selectPrimaryTemplatePackManifestFromModPackagesTyped(
    listRuntimeTemplatePackDefinitions(),
    runtimeTemplatePackManifestRegistry
  );
};

export const clearRuntimeTemplatePackRegistry = (): void => {
  runtimeTemplatePackManifestRegistry.clear();
  clearRuntimeModPackageRegistry();
  hasBootstrappedDefaultPacks = false;
};

export const isRuntimeTemplatePackManifest = (
  value: unknown
): value is TemplatePackManifest => isTemplatePackManifest(value);
