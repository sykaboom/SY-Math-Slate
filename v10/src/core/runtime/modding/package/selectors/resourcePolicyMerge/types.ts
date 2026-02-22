import type {
  ModPackageJsonObject,
  ModResourceLayer,
  ModResourceMergeDiagnostic,
} from "../../types";

export type ModResourcePolicyLayers = Partial<
  Record<ModResourceLayer, ModPackageJsonObject | null | undefined>
>;

export type ModResourcePolicyMergeResult = {
  policy: ModPackageJsonObject;
  diagnostics: ModResourceMergeDiagnostic[];
};
