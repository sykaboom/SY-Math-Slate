import type { ModPackageValidationFailure } from "./guards";
import { validateModPackageDefinition } from "./guards";
import {
  compareModPackageDefinitions,
  selectPrimaryModPackage,
} from "./selectors";
import type { ModPackageDefinition, ModPackageId } from "./types";

export type ModPackageRegistryRegisterSuccess = {
  ok: true;
  value: ModPackageDefinition;
};

export type ModPackageRegistryRegisterFailure =
  | ModPackageValidationFailure
  | {
      ok: false;
      code: "duplicate-pack-id";
      path: "manifest.packId";
      message: string;
      packId: ModPackageId;
    };

export type ModPackageRegistryRegisterResult =
  | ModPackageRegistryRegisterSuccess
  | ModPackageRegistryRegisterFailure;

export type RuntimeModPackageRegistrationEntry = {
  packId: ModPackageId;
  result: ModPackageRegistryRegisterResult;
};

export class ModPackageRegistry {
  private readonly definitions = new Map<ModPackageId, ModPackageDefinition>();

  register(value: unknown): ModPackageRegistryRegisterResult {
    const validation = validateModPackageDefinition(value);
    if (!validation.ok) {
      return validation;
    }

    const definition = validation.value;
    const { packId } = definition;
    if (this.definitions.has(packId)) {
      return {
        ok: false,
        code: "duplicate-pack-id",
        path: "manifest.packId",
        message: `duplicate mod package id '${packId}'.`,
        packId,
      };
    }

    this.definitions.set(packId, definition);
    return {
      ok: true,
      value: definition,
    };
  }

  get(packId: ModPackageId): ModPackageDefinition | null {
    return this.definitions.get(packId) ?? null;
  }

  resolve(packId: ModPackageId): ModPackageDefinition | null {
    return this.get(packId);
  }

  has(packId: ModPackageId): boolean {
    return this.definitions.has(packId);
  }

  list(): ModPackageDefinition[] {
    return [...this.definitions.values()].sort(compareModPackageDefinitions);
  }

  getPrimary(): ModPackageDefinition | null {
    return selectPrimaryModPackage(this.list());
  }

  size(): number {
    return this.definitions.size;
  }

  clear(): void {
    this.definitions.clear();
  }
}

const comparePackIds = (left: string, right: string): number => {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
};

const compareByPackId = (
  left: ModPackageDefinition,
  right: ModPackageDefinition
): number => comparePackIds(left.packId, right.packId);

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
  const orderedDefinitions = [...definitions].sort(compareByPackId);
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

export const resetRuntimeModPackageRegistry = (): void => {
  runtimeModPackageRegistrySingleton = null;
};
