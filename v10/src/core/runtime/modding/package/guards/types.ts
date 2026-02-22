import type { ModPackageDefinition } from "../types";

export type ModPackageValidationFailure = {
  ok: false;
  code:
    | "invalid-root"
    | "invalid-pack-id"
    | "invalid-version"
    | "invalid-label"
    | "invalid-mod-ids"
    | "invalid-activation"
    | "invalid-default-mod-id"
    | "invalid-toolbar-mode-map"
    | "invalid-ui-policy"
    | "invalid-resource-policy"
    | "invalid-dependencies"
    | "invalid-conflicts"
    | "invalid-default-enabled";
  path: string;
  message: string;
};

export type ModPackageValidationSuccess = {
  ok: true;
  value: ModPackageDefinition;
};

export type ModPackageValidationResult =
  | ModPackageValidationFailure
  | ModPackageValidationSuccess;
