export type ExtensionType = "exporter" | "widget" | "connector";

export type ExtensionPermission = `${string}:${string}`;

export type ExtensionTrigger =
  | "onStepStart"
  | "onStepEnd"
  | "onPlaybackStart"
  | "onPlaybackStop"
  | "onExport"
  | "onImport"
  | "onSave"
  | "onOpen"
  | (string & {});

export type ExtensionUiPlacement =
  | "panel"
  | "toolbar"
  | "menu"
  | "settings"
  | "context"
  | (string & {});

export type ExtensionUiSlotName = string & {};

export type ExtensionManifest = {
  id: string;
  name: string;
  version: string;
  type: ExtensionType;
  permissions: ExtensionPermission[];
  triggers?: ExtensionTrigger[];
  ui?: ExtensionUiPlacement[];
  entry?: string;
  description?: string;
};

export const ExtensionPermissionHints = [
  "canvas:read",
  "canvas:write",
  "data:read",
  "data:write",
  "audio:read",
  "audio:write",
  "net:http",
  "llm:invoke",
  "fs:read",
  "fs:write",
  "export:run",
] as const;
