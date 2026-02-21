import {
  dispatchCommand,
  listAppCommands,
  type AppCommandDispatchContext,
  type AppCommandDispatchResult,
  type AppCommandMetadata,
} from "@core/runtime/command/commandBus";
import {
  registerDeclarativePluginManifest,
  validateDeclarativePluginManifest,
  type DeclarativePluginManifestV1,
  type PluginManifestRegisterResult,
} from "@core/runtime/plugin-runtime/pluginLoader";
import { listKnownUISlotNames, type UISlotName } from "@core/runtime/plugin-runtime/registry";

export type ModdingSdkManifestTemplateInput = {
  pluginId: string;
  slot: UISlotName;
  commandId: string;
  label?: string;
  icon?: string;
};

export type ModdingSdk = {
  listSlots: () => UISlotName[];
  listCommands: () => AppCommandMetadata[];
  validateManifest: (
    input: unknown
  ) => ReturnType<typeof validateDeclarativePluginManifest>;
  registerManifest: (input: unknown) => PluginManifestRegisterResult;
  createManifestTemplate: (
    input: ModdingSdkManifestTemplateInput
  ) => DeclarativePluginManifestV1;
  dispatchCommand: <TResult = unknown>(
    commandId: string,
    payload: unknown,
    context?: AppCommandDispatchContext
  ) => Promise<AppCommandDispatchResult<TResult>>;
};

const toNonEmpty = (value: string): string => value.trim();

export const createModdingManifestTemplate = (
  input: ModdingSdkManifestTemplateInput
): DeclarativePluginManifestV1 => {
  const pluginId = toNonEmpty(input.pluginId);
  const commandId = toNonEmpty(input.commandId);
  const label = toNonEmpty(input.label ?? "Action");
  const icon = toNonEmpty(input.icon ?? "wand");

  return {
    manifestVersion: 1,
    pluginId,
    ui: [
      {
        id: `${pluginId}-primary-action`,
        slot: input.slot,
        type: "button",
        props: {
          label,
          icon,
          disabled: false,
        },
        action: {
          commandId,
          payload: {},
        },
      },
    ],
  };
};

export const createModdingSdk = (): ModdingSdk => ({
  listSlots: () => listKnownUISlotNames(),
  listCommands: () => listAppCommands(),
  validateManifest: (input) => validateDeclarativePluginManifest(input),
  registerManifest: (input) => registerDeclarativePluginManifest(input),
  createManifestTemplate: (input) => createModdingManifestTemplate(input),
  dispatchCommand: async <TResult = unknown>(
    commandId: string,
    payload: unknown,
    context: AppCommandDispatchContext = {}
  ) => dispatchCommand<TResult>(commandId, payload, context),
});
