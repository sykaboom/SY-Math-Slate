import { registerDeclarativePluginManifest } from "@core/extensions/pluginLoader";

let hasRegisteredCoreDeclarativeManifest = false;

export const registerCoreDeclarativeManifest = (): void => {
  if (hasRegisteredCoreDeclarativeManifest) return;

  const result = registerDeclarativePluginManifest({
    manifestVersion: 1,
    pluginId: "core-toolbar-shadow",
    ui: [
      {
        id: "core-prev-step",
        slot: "toolbar-inline",
        type: "button",
        props: { label: "Step-", icon: "◀" },
        action: { commandId: "prevStep", payload: {} },
      },
      {
        id: "core-next-step",
        slot: "toolbar-inline",
        type: "button",
        props: { label: "Step+", icon: "▶" },
        action: { commandId: "nextStep", payload: {} },
      },
      {
        id: "core-prev-page",
        slot: "toolbar-inline",
        type: "button",
        props: { label: "Page-", icon: "⬅" },
        action: { commandId: "prevPage", payload: {} },
      },
      {
        id: "core-next-page",
        slot: "toolbar-inline",
        type: "button",
        props: { label: "Page+", icon: "➡" },
        action: { commandId: "nextPage", payload: {} },
      },
      {
        id: "core-trigger-play",
        slot: "toolbar-inline",
        type: "button",
        props: { label: "Play", icon: "▶" },
        action: { commandId: "triggerPlay", payload: {} },
      },
      {
        id: "core-toggle-pause",
        slot: "toolbar-inline",
        type: "button",
        props: { label: "Pause", icon: "⏯" },
        action: { commandId: "togglePause", payload: {} },
      },
      {
        id: "core-trigger-stop",
        slot: "toolbar-inline",
        type: "button",
        props: { label: "Stop", icon: "■" },
        action: { commandId: "triggerStop", payload: {} },
      },
      {
        id: "core-break-line",
        slot: "toolbar-inline",
        type: "button",
        props: { label: "L-Break", icon: "↩" },
        action: {
          commandId: "insertBreak",
          payload: { breakType: "line", panelOpen: false },
        },
      },
      {
        id: "core-break-column",
        slot: "toolbar-inline",
        type: "button",
        props: { label: "C-Break", icon: "║" },
        action: {
          commandId: "insertBreak",
          payload: { breakType: "column", panelOpen: false },
        },
      },
      {
        id: "core-break-page",
        slot: "toolbar-inline",
        type: "button",
        props: { label: "P-Break", icon: "⤓" },
        action: {
          commandId: "insertBreak",
          payload: { breakType: "page", panelOpen: false },
        },
      },
    ],
  });

  if (!result.ok) {
    throw new Error(
      `failed to register core declarative manifest: ${result.code} (${result.path})`
    );
  }

  hasRegisteredCoreDeclarativeManifest = true;
};
