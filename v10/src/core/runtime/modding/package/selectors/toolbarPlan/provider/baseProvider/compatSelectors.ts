import type { ModId } from "@core/runtime/modding/api";

import type { ModPackageToolbarMode } from "../../../../types";
import { COMPAT_FALLBACK_TOOLBAR_MODE_DEFINITIONS, DEFAULT_TOOLBAR_MODE, DEFAULT_TOOLBAR_MODE_FALLBACK_MOD_ID } from "../constants";
import {
  selectToolbarDefaultFallbackModIdWithCompatFallbackFromDefinitions,
  selectToolbarDefaultModeWithCompatFallbackFromDefinitions,
  selectToolbarFallbackModIdForModeWithCompatFallbackFromDefinitions,
  selectToolbarModeDefinitionsWithCompatFallbackFromDefinitions,
} from "./compat";
import { selectToolbarBaseModeDefinitions } from "./selectors";

export const selectToolbarModeDefinitionsWithCompatFallback = () =>
  selectToolbarModeDefinitionsWithCompatFallbackFromDefinitions(
    selectToolbarBaseModeDefinitions(),
    COMPAT_FALLBACK_TOOLBAR_MODE_DEFINITIONS
  );

export const selectToolbarFallbackModIdForModeWithCompatFallback = (
  mode: ModPackageToolbarMode
): ModId | null =>
  selectToolbarFallbackModIdForModeWithCompatFallbackFromDefinitions(
    mode,
    selectToolbarModeDefinitionsWithCompatFallback()
  );

export const selectToolbarDefaultModeWithCompatFallback = (): ModPackageToolbarMode =>
  selectToolbarDefaultModeWithCompatFallbackFromDefinitions(
    selectToolbarModeDefinitionsWithCompatFallback(),
    DEFAULT_TOOLBAR_MODE
  );

export const selectToolbarDefaultFallbackModIdWithCompatFallback = (): ModId =>
  selectToolbarDefaultFallbackModIdWithCompatFallbackFromDefinitions(
    selectToolbarModeDefinitionsWithCompatFallback(),
    DEFAULT_TOOLBAR_MODE,
    DEFAULT_TOOLBAR_MODE_FALLBACK_MOD_ID
  );
