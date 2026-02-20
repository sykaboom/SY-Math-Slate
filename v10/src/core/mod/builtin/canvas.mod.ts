import type { ModDefinition, ModToolbarItem } from "@core/mod/contracts";

const CANVAS_TOOLBAR_ITEMS: readonly ModToolbarItem[] = [
  {
    id: "canvas.page.prev",
    commandId: "prevPage",
    label: "Previous Page",
    group: "canvas.navigation",
    order: 10,
  },
  {
    id: "canvas.page.next",
    commandId: "nextPage",
    label: "Next Page",
    group: "canvas.navigation",
    order: 20,
  },
];

export const CanvasMod: ModDefinition = {
  meta: {
    id: "canvas",
    version: "1.0.0",
    label: "Canvas",
    priority: 200,
    capabilities: ["toolbar.contribute"],
  },
  getToolbarItems: () => [...CANVAS_TOOLBAR_ITEMS],
};
