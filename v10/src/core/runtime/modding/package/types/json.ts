export type ModPackageJsonPrimitive = string | number | boolean | null;
export type ModPackageJsonValue =
  | ModPackageJsonPrimitive
  | ModPackageJsonValue[]
  | ModPackageJsonObject;
export type ModPackageJsonObject = {
  [key: string]: ModPackageJsonValue;
};
