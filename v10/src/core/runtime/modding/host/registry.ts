import type { ModDefinition, ModId } from "@core/runtime/modding/api";

const compareModIds = (leftId: string, rightId: string): number => {
  if (leftId < rightId) return -1;
  if (leftId > rightId) return 1;
  return 0;
};

export const compareModDefinitions = (
  left: ModDefinition,
  right: ModDefinition
): number => {
  const priorityDelta = right.meta.priority - left.meta.priority;
  if (priorityDelta !== 0) return priorityDelta;
  return compareModIds(left.meta.id, right.meta.id);
};

export type ModRegistryRegisterSuccess = {
  ok: true;
  value: ModDefinition;
};

export type ModRegistryRegisterFailure = {
  ok: false;
  code: "duplicate-mod-id";
  message: string;
  modId: ModId;
};

export type ModRegistryRegisterResult =
  | ModRegistryRegisterSuccess
  | ModRegistryRegisterFailure;

export class ModRegistry {
  private readonly definitions = new Map<ModId, ModDefinition>();

  register(definition: ModDefinition): ModRegistryRegisterResult {
    const modId = definition.meta.id;
    if (this.definitions.has(modId)) {
      return {
        ok: false,
        code: "duplicate-mod-id",
        message: `duplicate mod id '${modId}'.`,
        modId,
      };
    }

    this.definitions.set(modId, definition);
    return {
      ok: true,
      value: definition,
    };
  }

  get(modId: ModId): ModDefinition | null {
    return this.definitions.get(modId) ?? null;
  }

  resolve(modId: ModId): ModDefinition | null {
    return this.get(modId);
  }

  has(modId: ModId): boolean {
    return this.definitions.has(modId);
  }

  list(): ModDefinition[] {
    return [...this.definitions.values()].sort(compareModDefinitions);
  }

  size(): number {
    return this.definitions.size;
  }

  clear(): void {
    this.definitions.clear();
  }
}
