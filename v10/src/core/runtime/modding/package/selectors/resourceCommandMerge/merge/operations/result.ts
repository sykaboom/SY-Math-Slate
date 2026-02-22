import type { ModResourceMergeDiagnostic } from "../../../../types";
import type {
  ModResourceCommandMergeResult,
  ResolvedModResourceCommandRule,
} from "../model";

export const toCommandMergeResult = (
  merged: Map<string, ResolvedModResourceCommandRule>,
  diagnostics: ModResourceMergeDiagnostic[],
  blockedCommandIds: Set<string>
): ModResourceCommandMergeResult => ({
  commands: [...merged.values()],
  diagnostics,
  blockedCommandIds: [...blockedCommandIds].sort((left, right) =>
    left.localeCompare(right)
  ),
});
