export type ViewportKind = "tablet" | "mobile";

export type ViewportContract = {
  id: string;
  kind: ViewportKind;
  width: number;
  height: number;
};

export const TABLET_VIEWPORT_BASELINE: readonly ViewportContract[] = [
  { id: "tablet-768x1024", kind: "tablet", width: 768, height: 1024 },
  { id: "tablet-820x1180", kind: "tablet", width: 820, height: 1180 },
  { id: "tablet-1024x768", kind: "tablet", width: 1024, height: 768 },
  { id: "tablet-1180x820", kind: "tablet", width: 1180, height: 820 },
] as const;

export const MOBILE_VIEWPORT_BASELINE: readonly ViewportContract[] = [
  { id: "mobile-360x800", kind: "mobile", width: 360, height: 800 },
  { id: "mobile-390x844", kind: "mobile", width: 390, height: 844 },
  { id: "mobile-412x915", kind: "mobile", width: 412, height: 915 },
] as const;

export const MIN_TOUCH_TARGET_PX = 44;
export const MIN_SAFE_INLINE_PADDING_PX = 12;
export const MIN_SAFE_BLOCK_SPACING_PX = 8;

export const VIEWPORT_CONTRACT_VERSION = "w0-baseline-v1";
