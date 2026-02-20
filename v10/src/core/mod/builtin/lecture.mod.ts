import type { ModDefinition, ModToolbarItem } from "@core/mod/contracts";

const LECTURE_TOOLBAR_ITEMS: readonly ModToolbarItem[] = [
  {
    id: "lecture.step.prev",
    commandId: "prevStep",
    label: "Previous Step",
    group: "lecture.navigation",
    order: 10,
  },
  {
    id: "lecture.step.next",
    commandId: "nextStep",
    label: "Next Step",
    group: "lecture.navigation",
    order: 20,
  },
  {
    id: "lecture.play",
    commandId: "triggerPlay",
    label: "Play",
    group: "lecture.playback",
    order: 30,
  },
  {
    id: "lecture.pause",
    commandId: "togglePause",
    label: "Pause",
    group: "lecture.playback",
    order: 40,
  },
  {
    id: "lecture.stop",
    commandId: "triggerStop",
    label: "Stop",
    group: "lecture.playback",
    order: 50,
  },
];

export const LectureMod: ModDefinition = {
  meta: {
    id: "lecture",
    version: "1.0.0",
    label: "Lecture",
    priority: 400,
    capabilities: ["toolbar.contribute", "playback.control", "input.keyboard"],
  },
  getToolbarItems: () => [...LECTURE_TOOLBAR_ITEMS],
};
