type EnterFullscreenInkRuntimeArgs = {
  rootNode: Element | null | undefined;
  onBeforeEnter?: () => void;
  onEnterNative: () => void;
  onEnterFallback: () => void;
};

export async function enterFullscreenInkRuntime({
  rootNode,
  onBeforeEnter,
  onEnterNative,
  onEnterFallback,
}: EnterFullscreenInkRuntimeArgs): Promise<void> {
  onBeforeEnter?.();
  if (!rootNode || typeof rootNode.requestFullscreen !== "function") {
    onEnterFallback();
    return;
  }
  try {
    await rootNode.requestFullscreen();
    onEnterNative();
  } catch {
    onEnterFallback();
  }
}

type ExitFullscreenInkRuntimeArgs = {
  isNativeFullscreen: boolean;
  onExit: () => void;
};

export async function exitFullscreenInkRuntime({
  isNativeFullscreen,
  onExit,
}: ExitFullscreenInkRuntimeArgs): Promise<void> {
  if (
    isNativeFullscreen &&
    typeof document !== "undefined" &&
    document.fullscreenElement
  ) {
    try {
      await document.exitFullscreen();
    } catch {
      // ignore
    }
  }
  onExit();
}
