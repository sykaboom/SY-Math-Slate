import type { ModPackageDefinition } from "../../types";
import type { ModPackageValidationFailure } from "../../guards";

export type TemplatePackAdapterValidationFailure = {
  ok: false;
  code: "invalid-adapted-package";
  path: string;
  message: string;
  cause: ModPackageValidationFailure["code"];
};

export type TemplatePackAdapterValidationSuccess = {
  ok: true;
  value: ModPackageDefinition;
};

export type TemplatePackAdapterValidationResult =
  | TemplatePackAdapterValidationFailure
  | TemplatePackAdapterValidationSuccess;
