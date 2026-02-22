import { validateModPackageDefinition } from "../../guards";
import type { ModPackageDefinition, ModPackageId } from "../../types";
import {
  compareModPackageDefinitions,
  selectPrimaryModPackageDefinition,
} from "./comparators";
import type { ModPackageRegistryRegisterResult } from "./types";

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
    return selectPrimaryModPackageDefinition(this.list());
  }

  size(): number {
    return this.definitions.size;
  }

  clear(): void {
    this.definitions.clear();
  }
}
