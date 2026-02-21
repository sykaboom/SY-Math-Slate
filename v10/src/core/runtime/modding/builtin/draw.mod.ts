import type { ModDefinition, ModToolbarItem } from "@core/runtime/modding/api";

const DRAW_TOOLBAR_ITEMS: readonly ModToolbarItem[] = [
  {
    id: "draw.undo",
    commandId: "undo",
    label: "Undo",
    group: "draw.history",
    order: 10,
  },
  {
    id: "draw.redo",
    commandId: "redo",
    label: "Redo",
    group: "draw.history",
    order: 20,
  },
];

export const DrawMod: ModDefinition = {
  meta: {
    id: "draw",
    version: "1.0.0",
    label: "Draw",
    priority: 300,
    capabilities: [
      "input.pointer",
      "input.keyboard",
      "toolbar.contribute",
      "panel.contribute",
    ],
  },
  getToolbarItems: () => [...DRAW_TOOLBAR_ITEMS],
};
