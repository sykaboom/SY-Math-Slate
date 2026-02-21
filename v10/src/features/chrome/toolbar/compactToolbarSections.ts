export const COMPACT_TOOLBAR_SCROLL_HINT = "Scroll for more sections";

export const COMPACT_MORE_PANEL_CLASSNAME =
  "w-[min(94vw,360px)] max-h-[52vh] sm:max-h-[46vh] lg:max-h-[44vh] overflow-y-auto p-3";

export const COMPACT_SECTION_ORDER = [
  "quick-actions",
  "mode-dock-profile",
  "file-local",
  "view-layout",
  "history-steps",
] as const;

export type CompactSectionId = (typeof COMPACT_SECTION_ORDER)[number];
