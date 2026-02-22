import type { ModPackageDefinition } from "../../../types";
import { validateModPackageDefinition } from "./validate";

export const isModPackageDefinition = (
  value: unknown
): value is ModPackageDefinition => validateModPackageDefinition(value).ok;
