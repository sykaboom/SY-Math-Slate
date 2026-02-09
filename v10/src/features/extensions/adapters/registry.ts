import type { ConnectorAdapterInvoker } from "@core/extensions/connectors";
import type { ExtensionAdapter } from "./types";

const adapters = new Map<string, ExtensionAdapter>();

export const registerExtensionAdapter = (adapter: ExtensionAdapter): void => {
  adapters.set(adapter.adapterId, adapter);
};

export const listExtensionAdapters = (): ExtensionAdapter[] =>
  Array.from(adapters.values());

export const getExtensionAdapterById = (
  adapterId: string
): ExtensionAdapter | null => adapters.get(adapterId) ?? null;

export const getAdapterInvokerById = (
  adapterId: string
): ConnectorAdapterInvoker | null => {
  const adapter = getExtensionAdapterById(adapterId);
  if (!adapter) return null;

  return async (request) =>
    adapter.invoke({
      ...request,
      toolId: request.toolId ?? request.type,
      adapterId: request.adapterId ?? adapterId,
    });
};

export const clearExtensionAdapters = (): void => {
  adapters.clear();
};
