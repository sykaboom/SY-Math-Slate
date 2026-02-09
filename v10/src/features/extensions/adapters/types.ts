import type { ToolRegistryCategory } from "@core/contracts";
import type { ConnectorRequest, ConnectorResponse } from "@core/extensions/connectors";

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
};
