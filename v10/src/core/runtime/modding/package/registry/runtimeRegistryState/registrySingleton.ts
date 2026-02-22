import type { ModPackageDefinition, ModPackageId } from "../../types";
import {
  ModPackageRegistry,
  type ModPackageRegistryRegisterResult,
  type RuntimeModPackageRegistrationEntry,
  sortModPackageDefinitionsByPackId,
} from "../classRegistry";

let runtimeModPackageRegistrySingleton: ModPackageRegistry | null = null;

const ensureRuntimeModPackageRegistry = (): ModPackageRegistry => {
  if (!runtimeModPackageRegistrySingleton) {
    runtimeModPackageRegistrySingleton = new ModPackageRegistry();
  }
  return runtimeModPackageRegistrySingleton;
};

export const getRuntimeModPackageRegistry = (): ModPackageRegistry =>
  ensureRuntimeModPackageRegistry();

export const registerRuntimeModPackage = (
  value: unknown
): ModPackageRegistryRegisterResult =>
  ensureRuntimeModPackageRegistry().register(value);

export const registerRuntimeModPackages = (
  definitions: readonly ModPackageDefinition[]
): RuntimeModPackageRegistrationEntry[] => {
  const registry = ensureRuntimeModPackageRegistry();
  const orderedDefinitions = sortModPackageDefinitionsByPackId(definitions);
  return orderedDefinitions.map((definition) => ({
    packId: definition.packId,
    result: registry.register(definition),
  }));
};

export const listRuntimeModPackages = (): ModPackageDefinition[] =>
  ensureRuntimeModPackageRegistry().list();

export const getRuntimeModPackageById = (
  packId: ModPackageId
): ModPackageDefinition | null => ensureRuntimeModPackageRegistry().get(packId);

export const getPrimaryRuntimeModPackage = (): ModPackageDefinition | null =>
  ensureRuntimeModPackageRegistry().getPrimary();

export const clearRuntimeModPackageRegistry = (): void => {
  ensureRuntimeModPackageRegistry().clear();
};

export const resetRuntimeModPackageRegistryState = (): void => {
  runtimeModPackageRegistrySingleton = null;
};
