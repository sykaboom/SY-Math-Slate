import type { ToolRegistryCategory } from "@core/foundation/schemas";
import type { ConnectorRequest, ConnectorResponse } from "@core/runtime/plugin-runtime/connectors";
import type { ProviderAdapterAbiMetadata } from "./providerAbi";

export type AdapterHealth = {
  ok: boolean;
  detail?: string;
};

export type AdapterInvokeRequest = ConnectorRequest & {
  toolId: string;
  adapterId: string;
};

export type ExtensionAdapter = {
  adapterId: string;
  supports: ToolRegistryCategory[];
  invoke: (request: AdapterInvokeRequest) => Promise<ConnectorResponse>;
  health?: () => Promise<AdapterHealth>;
  providerAbi?: ProviderAdapterAbiMetadata;
};
