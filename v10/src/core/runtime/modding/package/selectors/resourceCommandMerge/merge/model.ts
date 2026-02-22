import type {
  ModPackageCommandRule,
  ModResourceLayer,
  ModResourceMergeDiagnostic,
} from "../../../types";

export type ResolvedModResourceCommandRule = ModPackageCommandRule & {
  source: ModResourceLayer;
};

export type ModResourceCommandLayers = Partial<
  Record<ModResourceLayer, readonly ModPackageCommandRule[]>
>;

export type ModResourceCommandMergeResult = {
  commands: ResolvedModResourceCommandRule[];
  diagnostics: ModResourceMergeDiagnostic[];
  blockedCommandIds: string[];
};
