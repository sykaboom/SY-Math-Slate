import {
  parseConflicts,
  parseDefaultEnabled,
  parseDependencies,
} from "../../dependenciesAndFinalize";
import type { ValidationBaseContext } from "../../baseFields/types";
import type { ModPackageId } from "../../../../types";
import { fail } from "../../../utils";

export type ParsedValidationRelations = {
  dependencies: ModPackageId[] | undefined;
  conflicts: ModPackageId[] | undefined;
  defaultEnabled: boolean | undefined;
};

export const parseValidationRelations = (
  manifest: ValidationBaseContext["manifest"]
): { ok: true; value: ParsedValidationRelations } | { ok: false; value: ReturnType<typeof fail> } => {
  let dependencies: ParsedValidationRelations["dependencies"];
  if (manifest.dependencies !== undefined) {
    const dependenciesResult = parseDependencies(manifest.dependencies);
    if (!dependenciesResult.ok) {
      return dependenciesResult;
    }
    dependencies = dependenciesResult.value;
  }

  let conflicts: ParsedValidationRelations["conflicts"];
  if (manifest.conflicts !== undefined) {
    const conflictsResult = parseConflicts(manifest.conflicts);
    if (!conflictsResult.ok) {
      return conflictsResult;
    }
    conflicts = conflictsResult.value;
  }

  const defaultEnabledResult = parseDefaultEnabled(manifest.defaultEnabled);
  if (!defaultEnabledResult.ok) {
    return defaultEnabledResult;
  }

  return {
    ok: true,
    value: {
      dependencies,
      conflicts,
      defaultEnabled: defaultEnabledResult.value,
    },
  };
};
