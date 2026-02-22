import type { ModId } from "@core/runtime/modding/api";

import type {
  ModPackageToolbarMode,
  ToolbarBaseModeDefinition,
} from "../../../../types";

export const selectToolbarModeDefinitionsWithCompatFallbackFromDefinitions = (
  definitions: readonly ToolbarBaseModeDefinition[],
  fallbackDefinitions: readonly ToolbarBaseModeDefinition[]
): readonly ToolbarBaseModeDefinition[] =>
  definitions.length > 0 ? definitions : fallbackDefinitions;

export const selectToolbarFallbackModIdForModeWithCompatFallbackFromDefinitions = (
  mode: ModPackageToolbarMode,
  definitions: readonly ToolbarBaseModeDefinition[]
): ModId | null =>
  definitions.find((definition) => definition.id === mode)?.fallbackModId ?? null;

export const selectToolbarDefaultModeWithCompatFallbackFromDefinitions = (
  definitions: readonly ToolbarBaseModeDefinition[],
  defaultMode: ModPackageToolbarMode
): ModPackageToolbarMode =>
  (definitions[0]?.id as ModPackageToolbarMode | undefined) ?? defaultMode;

export const selectToolbarDefaultFallbackModIdWithCompatFallbackFromDefinitions = (
  definitions: readonly ToolbarBaseModeDefinition[],
  defaultMode: ModPackageToolbarMode,
  defaultFallbackModId: ModId
): ModId =>
  selectToolbarFallbackModIdForModeWithCompatFallbackFromDefinitions(
    selectToolbarDefaultModeWithCompatFallbackFromDefinitions(
      definitions,
      defaultMode
    ),
    definitions
  ) ?? defaultFallbackModId;
