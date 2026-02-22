import type {
  ModPackageShortcutRule,
  ModResourceLayer,
  ModResourceMergeDiagnostic,
} from "../../types";

export type ResolvedModResourceShortcutRule = ModPackageShortcutRule & {
  mergeKey: string;
  source: ModResourceLayer;
};

export type ModResourceShortcutLayers = Partial<
  Record<ModResourceLayer, readonly ModPackageShortcutRule[]>
>;

export type ModResourceShortcutMergeResult = {
  shortcuts: ResolvedModResourceShortcutRule[];
  diagnostics: ModResourceMergeDiagnostic[];
};
