export const MOD_RESOURCE_LAYER_LOAD_ORDER = [
  "base",
  "package",
  "mod",
  "user",
] as const;

export type ModResourceLayer = (typeof MOD_RESOURCE_LAYER_LOAD_ORDER)[number];
