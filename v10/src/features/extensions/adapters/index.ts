import { registerExtensionAdapter } from "./registry";
import { mockAdapter } from "./mockAdapter";

let defaultsRegistered = false;

export const registerDefaultExtensionAdapters = (): void => {
  if (defaultsRegistered) return;
  registerExtensionAdapter(mockAdapter);
  defaultsRegistered = true;
};

export * from "./types";
export * from "./registry";
export * from "./mockAdapter";
