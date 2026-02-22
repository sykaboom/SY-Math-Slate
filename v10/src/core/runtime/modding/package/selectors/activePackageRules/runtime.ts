import { getRuntimeModResourceLayerOverrides } from "../../registry";

export const selectRuntimeModResourceOverridesForLayerImpl = (
  layer: "mod" | "user"
) => getRuntimeModResourceLayerOverrides(layer);
