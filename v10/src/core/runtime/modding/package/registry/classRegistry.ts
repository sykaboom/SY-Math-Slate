import { validateModPackageDefinition } from "../guards";
import type { ModPackageValidationFailure } from "../guards";
import type { ModPackageDefinition, ModPackageId } from "../types";

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

const comparePackIds = (left: string, right: string): number => {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
};

const compareModPackageDefinitions = (
  left: ModPackageDefinition,
  right: ModPackageDefinition
): number => {
  const defaultEnabledDelta = Number(Boolean(right.defaultEnabled)) - Number(Boolean(left.defaultEnabled));
  if (defaultEnabledDelta !== 0) {
    return defaultEnabledDelta;
  }
  return comparePackIds(left.packId, right.packId);
};

const selectPrimaryModPackage = (
  definitions: readonly ModPackageDefinition[]
): ModPackageDefinition | null => {
  const ordered = [...definitions].sort(compareModPackageDefinitions);
  return ordered[0] ?? null;
};

export const sortModPackageDefinitionsByPackId = (
  definitions: readonly ModPackageDefinition[]
): ModPackageDefinition[] => [...definitions].sort((left, right) => comparePackIds(left.packId, right.packId));

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
