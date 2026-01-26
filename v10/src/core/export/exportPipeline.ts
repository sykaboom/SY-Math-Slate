// Stub registry for future export plugins. Intentionally empty for now.
export type ExportPayload = {
  data: unknown;
};

export type ExportResult = {
  ok: boolean;
  blob?: Blob;
  error?: Error;
};

export type ExportProvider = {
  name: string;
  supportsAudio: boolean;
  supportsVideo: boolean;
  export: (payload: ExportPayload) => Promise<ExportResult>;
};

export const exportProviders: ExportProvider[] = [];
