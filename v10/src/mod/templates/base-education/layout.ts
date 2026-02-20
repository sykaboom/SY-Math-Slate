import type { TemplateLayoutSlot } from "../_contracts/templatePack.types";

export const BASE_EDUCATION_LAYOUT: readonly TemplateLayoutSlot[] = [
  {
    slot: "chrome-top-toolbar",
    moduleOrder: [],
    hidden: false,
  },
  {
    slot: "left-panel",
    moduleOrder: [],
    hidden: false,
  },
  {
    slot: "toolbar-inline",
    moduleOrder: [],
    hidden: false,
  },
  {
    slot: "toolbar-bottom",
    moduleOrder: [],
    hidden: false,
  },
] as const;
