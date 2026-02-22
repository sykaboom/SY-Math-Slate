import type { ModPackageDefinition, ModPackageId } from "../../../types";
import { comparePackIds } from "../sortingAndActive";

const normalizeModPackageIds = (
  packIds: readonly ModPackageId[] | undefined
): ModPackageId[] => {
  const values = new Set<ModPackageId>();
  for (const packId of packIds ?? []) {
    const normalized = packId.trim();
    if (normalized.length === 0) continue;
    values.add(normalized);
  }
  return [...values].sort(comparePackIds);
};

export const selectModPackageConflictIds = (
  definition: ModPackageDefinition | null | undefined
): ModPackageId[] => normalizeModPackageIds(definition?.conflicts);
