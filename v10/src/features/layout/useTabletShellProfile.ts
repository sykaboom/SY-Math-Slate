"use client";

import { useMemo, useSyncExternalStore } from "react";

const MOBILE_MAX_WIDTH = 767;
const DESKTOP_MIN_WIDTH = 1280;
const LEFT_PANEL_OVERLAY_MAX_WIDTH = 1179;
const COMPACT_INSET_MAX_WIDTH = 1179;

type ViewportClass = "mobile" | "tablet" | "desktop";
type ViewportOrientation = "portrait" | "landscape";

type ViewportSnapshot = {
  width: number;
  height: number;
};

export type TabletShellProfile = {
  viewportWidth: number;
  viewportHeight: number;
  viewportClass: ViewportClass;
  orientation: ViewportOrientation;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isPortrait: boolean;
  isLandscape: boolean;
  isSubTabletWidth: boolean;
  supportsSafeAreaInsets: boolean;
  shouldUseCompactHorizontalInsets: boolean;
  shouldOverlayLeftPanel: boolean;
  shouldPadBottomChromeWithSafeArea: boolean;
  shouldPadTopChromeWithSafeArea: boolean;
  shouldPadHorizontalChromeWithSafeArea: boolean;
};

const FALLBACK_VIEWPORT: ViewportSnapshot = {
  width: DESKTOP_MIN_WIDTH,
  height: 900,
};

let cachedViewportSnapshot: ViewportSnapshot = FALLBACK_VIEWPORT;

const toStableViewportSnapshot = (
  width: number,
  height: number
): ViewportSnapshot => {
  if (
    cachedViewportSnapshot.width === width &&
    cachedViewportSnapshot.height === height
  ) {
    return cachedViewportSnapshot;
  }
  cachedViewportSnapshot = { width, height };
  return cachedViewportSnapshot;
};

const readViewportSnapshot = (): ViewportSnapshot => {
  if (typeof window === "undefined") {
    return FALLBACK_VIEWPORT;
  }
  const visualViewport = window.visualViewport;
  const width = Math.round(visualViewport?.width ?? window.innerWidth);
  const height = Math.round(visualViewport?.height ?? window.innerHeight);
  return toStableViewportSnapshot(Math.max(0, width), Math.max(0, height));
};

const subscribeToViewportSnapshot = (
  onStoreChange: () => void
): (() => void) => {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  let lastSnapshot = readViewportSnapshot();
  let frameId = 0;
  const notify = () => {
    if (frameId !== 0) return;
    frameId = window.requestAnimationFrame(() => {
      frameId = 0;
      const nextSnapshot = readViewportSnapshot();
      if (nextSnapshot === lastSnapshot) return;
      lastSnapshot = nextSnapshot;
      onStoreChange();
    });
  };

  window.addEventListener("resize", notify);
  window.addEventListener("orientationchange", notify);
  window.visualViewport?.addEventListener("resize", notify);

  return () => {
    window.removeEventListener("resize", notify);
    window.removeEventListener("orientationchange", notify);
    window.visualViewport?.removeEventListener("resize", notify);
    if (frameId !== 0) {
      window.cancelAnimationFrame(frameId);
    }
  };
};

const classifyViewportClass = (width: number): ViewportClass => {
  if (width <= MOBILE_MAX_WIDTH) return "mobile";
  if (width < DESKTOP_MIN_WIDTH) return "tablet";
  return "desktop";
};

const classifyOrientation = (
  width: number,
  height: number
): ViewportOrientation => (width > height ? "landscape" : "portrait");

const detectSafeAreaSupport = (): boolean => {
  if (
    typeof window === "undefined" ||
    typeof window.CSS === "undefined" ||
    typeof window.CSS.supports !== "function"
  ) {
    return false;
  }

  return (
    window.CSS.supports("padding-bottom: env(safe-area-inset-bottom)") ||
    window.CSS.supports("padding-bottom: constant(safe-area-inset-bottom)")
  );
};

const buildProfile = (width: number, height: number): TabletShellProfile => {
  const viewportClass = classifyViewportClass(width);
  const orientation = classifyOrientation(width, height);
  const isDesktop = viewportClass === "desktop";
  const isMobile = viewportClass === "mobile";
  const isTablet = viewportClass === "tablet";
  const isLandscape = orientation === "landscape";
  const supportsSafeAreaInsets = detectSafeAreaSupport();
  const isSubTabletWidth = width < MOBILE_MAX_WIDTH + 1;
  const shouldUseCompactHorizontalInsets = width <= COMPACT_INSET_MAX_WIDTH;
  const shouldOverlayLeftPanel = width <= LEFT_PANEL_OVERLAY_MAX_WIDTH;

  return {
    viewportWidth: width,
    viewportHeight: height,
    viewportClass,
    orientation,
    isMobile,
    isTablet,
    isDesktop,
    isPortrait: !isLandscape,
    isLandscape,
    isSubTabletWidth,
    supportsSafeAreaInsets,
    shouldUseCompactHorizontalInsets,
    shouldOverlayLeftPanel,
    shouldPadBottomChromeWithSafeArea:
      supportsSafeAreaInsets && !isDesktop,
    shouldPadTopChromeWithSafeArea:
      supportsSafeAreaInsets && !isDesktop,
    shouldPadHorizontalChromeWithSafeArea:
      supportsSafeAreaInsets && isLandscape,
  };
};

export function useTabletShellProfile(): TabletShellProfile {
  const viewport = useSyncExternalStore(
    subscribeToViewportSnapshot,
    readViewportSnapshot,
    () => FALLBACK_VIEWPORT
  );

  return useMemo(
    () => buildProfile(viewport.width, viewport.height),
    [viewport.height, viewport.width]
  );
}
