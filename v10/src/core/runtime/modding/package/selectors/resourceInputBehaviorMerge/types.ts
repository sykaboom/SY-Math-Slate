import type {
  ModPackageInputBehaviorRule,
  ModResourceLayer,
  ModResourceMergeDiagnostic,
} from "../../types";

export type ResolvedModResourceInputBehaviorRule = ModPackageInputBehaviorRule & {
  source: ModResourceLayer;
};

export type ModResourceInputBehaviorLayers = Partial<
  Record<ModResourceLayer, ModPackageInputBehaviorRule | null | undefined>
>;

export type ModResourceInputBehaviorMergeResult = {
  inputBehavior: ResolvedModResourceInputBehaviorRule;
  diagnostics: ModResourceMergeDiagnostic[];
};
