import { validateModPackageDefinition } from "../../guards";
import type { ModPackageDefinition, ModPackageId } from "../../types";
import { listSortedDefinitions, selectPrimaryDefinitionFromMap } from "./registryClass/queries";
import { registerDefinition } from "./registryClass/register";
import type { ModPackageRegistryRegisterResult } from "./types";

export class ModPackageRegistry {
  private readonly definitions = new Map<ModPackageId, ModPackageDefinition>();

  register(value: unknown): ModPackageRegistryRegisterResult {
    return registerDefinition(this.definitions, value, validateModPackageDefinition);
  }

  get(packId: ModPackageId): ModPackageDefinition | null { return this.definitions.get(packId) ?? null; }
  resolve(packId: ModPackageId): ModPackageDefinition | null { return this.get(packId); }
  has(packId: ModPackageId): boolean { return this.definitions.has(packId); }
  list(): ModPackageDefinition[] { return listSortedDefinitions(this.definitions); }
  getPrimary(): ModPackageDefinition | null { return selectPrimaryDefinitionFromMap(this.definitions); }
  size(): number { return this.definitions.size; }
  clear(): void { this.definitions.clear(); }
}
