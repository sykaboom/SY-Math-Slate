import type { ModDefinition, ModToolbarItem } from "@core/mod/contracts";

const PLAYBACK_TOOLBAR_ITEMS: readonly ModToolbarItem[] = [
  {
    id: "playback.step.prev",
    commandId: "prevStep",
    label: "Previous Step",
    group: "playback.navigation",
    order: 10,
  },
  {
    id: "playback.step.next",
    commandId: "nextStep",
    label: "Next Step",
    group: "playback.navigation",
    order: 20,
  },
  {
    id: "playback.play",
    commandId: "triggerPlay",
    label: "Play",
    group: "playback.transport",
    order: 30,
  },
  {
    id: "playback.pause",
    commandId: "togglePause",
    label: "Pause",
    group: "playback.transport",
    order: 40,
  },
  {
    id: "playback.stop",
    commandId: "triggerStop",
    label: "Stop",
    group: "playback.transport",
    order: 50,
  },
  {
    id: "playback.undo",
    commandId: "undo",
    label: "Undo",
    group: "playback.history",
    order: 60,
  },
  {
    id: "playback.redo",
    commandId: "redo",
    label: "Redo",
    group: "playback.history",
    order: 70,
  },
];

export const PlaybackMod: ModDefinition = {
  meta: {
    id: "playback",
    version: "1.0.0",
    label: "Playback",
    priority: 250,
    capabilities: ["input.keyboard", "toolbar.contribute", "playback.control"],
  },
  getToolbarItems: () => [...PLAYBACK_TOOLBAR_ITEMS],
};
