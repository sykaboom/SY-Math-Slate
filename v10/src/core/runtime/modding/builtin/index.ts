import type { ModDefinition, ModId } from "@core/runtime/modding/api";
import {
  activateRuntimeMod,
  registerRuntimeMods,
  type ModActivationResult,
  type RuntimeModRegistrationEntry,
} from "@core/runtime/modding/host";

import { CanvasMod } from "./canvas.mod";
import { DrawMod } from "./draw.mod";
import { LectureMod } from "./lecture.mod";
import { PlaybackMod } from "./playback.mod";

const BUILTIN_MOD_DEFINITIONS: readonly ModDefinition[] = [
  LectureMod,
  DrawMod,
  PlaybackMod,
  CanvasMod,
];

export const listBuiltinModDefinitions = (): ModDefinition[] => [
  ...BUILTIN_MOD_DEFINITIONS,
];

export const registerBuiltinMods = (): RuntimeModRegistrationEntry[] =>
  registerRuntimeMods(BUILTIN_MOD_DEFINITIONS);

export const activateBuiltinMod = async (
  modId: ModId
): Promise<ModActivationResult> => activateRuntimeMod({ modId });

export { CanvasMod, DrawMod, LectureMod, PlaybackMod };
