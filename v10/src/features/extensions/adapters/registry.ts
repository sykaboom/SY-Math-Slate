import type { ConnectorAdapterInvoker } from "@core/extensions/connectors";
import type { ProviderAdapterAbiMetadata } from "./providerAbi";
import type { ExtensionAdapter } from "./types";

type RegisteredExtensionAdapter = {
  adapter: ExtensionAdapter;
  providerAbi: ProviderAdapterAbiMetadata | null;
};

type RegisterExtensionAdapterOptions = {
  providerAbi?: ProviderAdapterAbiMetadata;
};

const adapters = new Map<string, RegisteredExtensionAdapter>();

const resolveProviderAbiMetadata = (
  adapter: ExtensionAdapter,
  options?: RegisterExtensionAdapterOptions
): ProviderAdapterAbiMetadata | null =>
  options?.providerAbi ?? adapter.providerAbi ?? null;

export const registerExtensionAdapter = (
  adapter: ExtensionAdapter,
  options?: RegisterExtensionAdapterOptions
): void => {
  adapters.set(adapter.adapterId, {
    adapter,
    providerAbi: resolveProviderAbiMetadata(adapter, options),
  });
};

export const listExtensionAdapters = (): ExtensionAdapter[] =>
  Array.from(adapters.values(), (entry) => entry.adapter);

export const getExtensionAdapterById = (
  adapterId: string
): ExtensionAdapter | null => adapters.get(adapterId)?.adapter ?? null;

export const getExtensionAdapterProviderAbiById = (
  adapterId: string
): ProviderAdapterAbiMetadata | null => adapters.get(adapterId)?.providerAbi ?? null;

export type ExtensionAdapterProviderAbiEntry = {
  adapterId: string;
  providerAbi: ProviderAdapterAbiMetadata;
};

export const listExtensionAdapterProviderAbiMetadata = (): ExtensionAdapterProviderAbiEntry[] =>
  Array.from(adapters.values()).flatMap((entry) => {
    if (!entry.providerAbi) return [];
    return [
      {
        adapterId: entry.adapter.adapterId,
        providerAbi: entry.providerAbi,
      },
    ];
  });

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
