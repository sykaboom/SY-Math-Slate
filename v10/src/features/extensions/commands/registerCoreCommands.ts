import type { AppCommand } from "@core/engine/commandBus";
import { CANVAS_COMMANDS, registerCanvasCommands } from "./commands.canvas";
import { DOC_COMMANDS, registerDocCommands } from "./commands.doc";
import { PLAYBACK_COMMANDS, registerPlaybackCommands } from "./commands.playback";
import { TOOL_COMMANDS, registerToolCommands } from "./commands.tool";

export type CommandMigrationDomain =
  | "doc-core"
  | "tooling"
  | "playback-page"
  | "data-input";

export const COMMAND_MIGRATION_MAP: Record<
  CommandMigrationDomain,
  readonly string[]
> = {
  "doc-core": ["insertBlock", "updateBlock", "deleteBlock"],
  tooling: [
    "setTool",
    "setToolbarDock",
    "setPenType",
    "setPenColor",
    "setPenWidth",
    "setPenOpacity",
    "setEraserWidth",
    "setLaserType",
    "setLaserColor",
    "setLaserWidth",
  ],
  "playback-page": [
    "setViewMode",
    "setAnimating",
    "setPlaybackSpeed",
    "setAutoPlayDelay",
    "toggleAutoPlay",
    "togglePause",
    "triggerPlay",
    "triggerStop",
    "triggerSkip",
    "nextStep",
    "prevStep",
    "goToStep",
    "nextPage",
    "prevPage",
    "goToPage",
    "undo",
    "redo",
    "addPage",
    "deletePage",
    "setColumnCount",
  ],
  "data-input": [
    "insertBreak",
    "importStepBlocks",
    "setInsertionIndex",
    "setAnimationModInput",
    "clearAllAudio",
  ],
};

const CORE_COMMANDS: readonly AppCommand<unknown, unknown>[] = [
  ...DOC_COMMANDS,
  ...TOOL_COMMANDS,
  ...PLAYBACK_COMMANDS,
  ...CANVAS_COMMANDS,
];

const EXPECTED_CORE_COMMAND_ID_SET = new Set<string>(
  (
    Object.values(COMMAND_MIGRATION_MAP) as ReadonlyArray<readonly string[]>
  ).flat()
);

const assertCoreCommandCoverage = (
  commands: readonly AppCommand<unknown, unknown>[]
): void => {
  const seenIds = new Set<string>();
  for (const command of commands) {
    if (seenIds.has(command.id)) {
      throw new Error(`duplicate core command registration id: '${command.id}'.`);
    }
    seenIds.add(command.id);
  }

  for (const expectedId of EXPECTED_CORE_COMMAND_ID_SET) {
    if (!seenIds.has(expectedId)) {
      throw new Error(`missing core command registration id: '${expectedId}'.`);
    }
  }

  for (const seenId of seenIds) {
    if (!EXPECTED_CORE_COMMAND_ID_SET.has(seenId)) {
      throw new Error(`unexpected core command registration id: '${seenId}'.`);
    }
  }
};

let hasRegisteredCoreCommands = false;

export const registerCoreCommands = (): void => {
  if (hasRegisteredCoreCommands) return;

  assertCoreCommandCoverage(CORE_COMMANDS);
  registerDocCommands();
  registerToolCommands();
  registerPlaybackCommands();
  registerCanvasCommands();

  hasRegisteredCoreCommands = true;
};
