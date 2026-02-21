import { registerExtensionAdapter } from "./registry";
import { mockAdapter } from "./mockAdapter";
import { ollamaLocalAdapter } from "./ollamaLocalAdapter";
import { lmStudioLocalAdapter } from "./lmStudioLocalAdapter";
import { webgpuOnnxLocalAdapter } from "./webgpuOnnxLocalAdapter";
import { llmProviderAdapter } from "./llmProviderAdapter";
import { imageProviderAdapter } from "./imageProviderAdapter";
import { videoProviderAdapter } from "./videoProviderAdapter";
import { audioProviderAdapter } from "./audioProviderAdapter";

let defaultsRegistered = false;

export const registerDefaultExtensionAdapters = (): void => {
  if (defaultsRegistered) return;
  registerExtensionAdapter(mockAdapter);
  registerExtensionAdapter(ollamaLocalAdapter);
  registerExtensionAdapter(lmStudioLocalAdapter);
  registerExtensionAdapter(webgpuOnnxLocalAdapter);
  registerExtensionAdapter(llmProviderAdapter);
  registerExtensionAdapter(imageProviderAdapter);
  registerExtensionAdapter(videoProviderAdapter);
  registerExtensionAdapter(audioProviderAdapter);
  defaultsRegistered = true;
};

export * from "./types";
export * from "./registry";
export * from "./providerAbi";
export * from "./mockAdapter";
export * from "./ollamaLocalAdapter";
export * from "./lmStudioLocalAdapter";
export * from "./webgpuOnnxLocalAdapter";
export * from "./llmProviderAdapter";
export * from "./imageProviderAdapter";
export * from "./videoProviderAdapter";
export * from "./audioProviderAdapter";
