import type { ModPackageDefinition, ModPackageId, ModPackageToolbarMode } from "../../types";
import { fail, toStringArray } from "../utils";

export const parseDependencies = (
  value: unknown
):
  | { ok: true; value: ModPackageId[] }
  | { ok: false; value: ReturnType<typeof fail> } =>
  toStringArray(
    value,
    "invalid-dependencies",
    "manifest.dependencies",
    "dependencies must be an array of non-empty strings."
  );

export const parseConflicts = (
  value: unknown
):
  | { ok: true; value: ModPackageId[] }
  | { ok: false; value: ReturnType<typeof fail> } =>
  toStringArray(
    value,
    "invalid-conflicts",
    "manifest.conflicts",
    "conflicts must be an array of non-empty strings."
  );

export const parseDefaultEnabled = (
  value: unknown
): { ok: true; value: boolean | undefined } | { ok: false; value: ReturnType<typeof fail> } => {
  if (value === undefined) {
    return { ok: true, value: undefined };
  }
  if (typeof value !== "boolean") {
    return {
      ok: false,
      value: fail(
        "invalid-default-enabled",
        "manifest.defaultEnabled",
        "defaultEnabled must be a boolean when provided."
      ),
    };
  }
  return { ok: true, value };
};

export type BuildValidatedDefinitionInput = {
  packId: string;
  version: string;
  label: string;
  modIds: ModPackageId[];
  defaultModId: string;
  toolbarModeMap: Partial<Record<ModPackageToolbarMode, string>> | undefined;
  uiPolicy: ModPackageDefinition["uiPolicy"];
  resourcePolicy: ModPackageDefinition["resourcePolicy"];
  dependencies: ModPackageId[] | undefined;
  conflicts: ModPackageId[] | undefined;
  defaultEnabled: boolean | undefined;
};

export const buildValidatedDefinition = (
  input: BuildValidatedDefinitionInput
): ModPackageDefinition => ({
  packId: input.packId,
  version: input.version,
  label: input.label,
  modIds: input.modIds,
  activation: {
    defaultModId: input.defaultModId,
    toolbarModeMap: input.toolbarModeMap,
  },
  uiPolicy: input.uiPolicy,
  resourcePolicy: input.resourcePolicy,
  dependencies: input.dependencies,
  conflicts: input.conflicts,
  defaultEnabled: input.defaultEnabled,
});
