import type { ModPackageValidationFailure } from "../../guards";
import type { ModPackageDefinition, ModPackageId } from "../../types";

export type ModPackageRegistryRegisterSuccess = {
  ok: true;
  value: ModPackageDefinition;
};

export type ModPackageRegistryRegisterFailure =
  | ModPackageValidationFailure
  | {
      ok: false;
      code: "duplicate-pack-id";
      path: "manifest.packId";
      message: string;
      packId: ModPackageId;
    };

export type ModPackageRegistryRegisterResult =
  | ModPackageRegistryRegisterSuccess
  | ModPackageRegistryRegisterFailure;

export type RuntimeModPackageRegistrationEntry = {
  packId: ModPackageId;
  result: ModPackageRegistryRegisterResult;
};
