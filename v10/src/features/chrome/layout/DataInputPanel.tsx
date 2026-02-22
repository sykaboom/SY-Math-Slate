"use client";

import { cn } from "@core/utils";

import {
  DataInputActions,
  DataInputBody,
  DataInputHeader,
  useDataInputPanelRuntime,
} from "@features/chrome/layout/data-input";

export type DataInputPanelMountMode = "legacy-shell" | "window-host";

type DataInputPanelProps = {
  mountMode?: DataInputPanelMountMode;
  className?: string;
};

export function DataInputPanel(props: DataInputPanelProps = {}) {
  const { mountMode = "legacy-shell", className } = props;
  const {
    isDataInputOpen,
    imageInputRef,
    videoInputRef,
    handleImageInput,
    handleVideoInput,
    header,
    body,
    actions,
  } = useDataInputPanelRuntime();

  if (!isDataInputOpen) return null;

  return (
    <aside
      data-layout-state="state_input_mode"
      data-panel-mount-mode={mountMode}
      className={cn(
        mountMode === "window-host"
          ? "flex h-full w-full min-h-0 flex-col overflow-hidden bg-[var(--theme-surface-soft)] px-4 py-4 overscroll-contain"
          : "fixed inset-0 z-50 flex h-[100dvh] w-full flex-col bg-[var(--theme-surface-overlay)] px-4 py-4 backdrop-blur-md overscroll-contain xl:static xl:z-auto xl:h-full xl:w-[420px] xl:min-w-[420px] xl:shrink-0 xl:border-l xl:border-[var(--theme-border)] xl:bg-[var(--theme-surface-soft)]",
        className
      )}
    >
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageInput}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleVideoInput}
      />

      <DataInputHeader header={header} />
      <DataInputBody body={body} />
      <DataInputActions actions={actions} />
    </aside>
  );
}
