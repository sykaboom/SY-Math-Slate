export type ToolbarViewportProfile = "desktop" | "tablet" | "mobile";

const MOBILE_QUERY = "(max-width: 767px)";
const TABLET_QUERY = "(min-width: 768px) and (max-width: 1279px)";

export const getToolbarViewportProfileSnapshot = (): ToolbarViewportProfile => {
  if (typeof window === "undefined") return "desktop";
  if (window.matchMedia(MOBILE_QUERY).matches) return "mobile";
  if (window.matchMedia(TABLET_QUERY).matches) return "tablet";
  return "desktop";
};

export const subscribeToolbarViewportProfile = (
  callback: () => void
): (() => void) => {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const mobile = window.matchMedia(MOBILE_QUERY);
  const tablet = window.matchMedia(TABLET_QUERY);

  if (
    typeof mobile.addEventListener === "function" &&
    typeof tablet.addEventListener === "function"
  ) {
    mobile.addEventListener("change", callback);
    tablet.addEventListener("change", callback);
    return () => {
      mobile.removeEventListener("change", callback);
      tablet.removeEventListener("change", callback);
    };
  }

  mobile.addListener(callback);
  tablet.addListener(callback);
  return () => {
    mobile.removeListener(callback);
    tablet.removeListener(callback);
  };
};

