import { create } from "zustand";
import { CORE_PANEL_POLICY_IDS } from "@core/config/panel-policy";
import type {
  WindowRuntimePanelPolicyState,
  WindowRuntimePanelPolicyStateEntry,
} from "@features/layout/windowing/panelPolicy.runtime";
import type {
  WindowRuntimePersistedPanelLayout,
  WindowRuntimePersistedState,
} from "@features/layout/windowing/windowRuntime.types";

export type PanelId = "pen" | "laser" | null;
export type FullscreenInkMode = "off" | "native" | "app";
export type WindowRuntimePanelOpenState = Record<string, boolean>;

const DATA_INPUT_PANEL_ID = CORE_PANEL_POLICY_IDS.DATA_INPUT;

const DEFAULT_WINDOW_RUNTIME_PANEL_OPEN_STATE: WindowRuntimePanelOpenState = {
  [CORE_PANEL_POLICY_IDS.DATA_INPUT]: false,
  [CORE_PANEL_POLICY_IDS.PROMPTER]: false,
  [CORE_PANEL_POLICY_IDS.FLOATING_TOOLBAR]: false,
};

interface ChromeStoreState {
  isPanelOpen: boolean;
  openPanel: PanelId;
  isPasteHelperOpen: boolean;
  isDataInputOpen: boolean;
  fullscreenInkMode: FullscreenInkMode;
  showCursors: boolean;
  showBreakGuides: boolean;
  showCanvasBorder: boolean;
  windowRuntimePanelOpenState: WindowRuntimePanelOpenState;
  windowRuntimePanels: WindowRuntimePersistedState;
  windowRuntimePanelPolicy: WindowRuntimePanelPolicyState;
  togglePanel: (panel: Exclude<PanelId, null>) => void;
  closePanel: () => void;
  openPasteHelper: () => void;
  closePasteHelper: () => void;
  openDataInput: () => void;
  closeDataInput: () => void;
  toggleDataInput: () => void;
  setFullscreenInkMode: (mode: FullscreenInkMode) => void;
  enterFullscreenInkNative: () => void;
  enterFullscreenInkFallback: () => void;
  exitFullscreenInk: () => void;
  toggleCursors: () => void;
  toggleBreakGuides: () => void;
  toggleCanvasBorder: () => void;
  replaceWindowRuntimePanels: (state: WindowRuntimePersistedState) => void;
  setWindowRuntimePanelLayout: (
    panelId: string,
    layout: WindowRuntimePersistedPanelLayout | null
  ) => void;
  clearWindowRuntimePanels: () => void;
  replaceWindowRuntimePanelPolicy: (state: WindowRuntimePanelPolicyState) => void;
  setWindowRuntimePanelPolicy: (
    panelId: string,
    state: WindowRuntimePanelPolicyStateEntry | null
  ) => void;
  clearWindowRuntimePanelPolicy: () => void;
  replaceWindowRuntimePanelOpenState: (
    state: WindowRuntimePanelOpenState
  ) => void;
  setWindowRuntimePanelOpenState: (panelId: string, isOpen: boolean) => void;
  clearWindowRuntimePanelOpenState: () => void;
}

const normalizeFinite = (value: number, fallback: number): number =>
  Number.isFinite(value) ? value : fallback;

const normalizeZIndex = (value: number): number =>
  Math.max(0, Math.trunc(normalizeFinite(value, 0)));

const clonePanelLayout = (
  value: WindowRuntimePersistedPanelLayout
): WindowRuntimePersistedPanelLayout => ({
  position: {
    x: normalizeFinite(value.position.x, 0),
    y: normalizeFinite(value.position.y, 0),
  },
  zIndex: normalizeZIndex(value.zIndex),
});

const cloneWindowRuntimePanelPolicyStateEntry = (
  value: WindowRuntimePanelPolicyStateEntry
): WindowRuntimePanelPolicyStateEntry => ({
  visible: value.visible === true,
  displayMode: value.displayMode === "windowed" ? "windowed" : "docked",
  movable: value.movable === true,
  defaultOpen: value.defaultOpen === true,
  rememberPosition: value.rememberPosition === true,
  defaultPosition: {
    x: normalizeFinite(value.defaultPosition.x, 0),
    y: normalizeFinite(value.defaultPosition.y, 0),
  },
});

const sanitizeWindowRuntimePanels = (
  value: WindowRuntimePersistedState
): WindowRuntimePersistedState => {
  const nextState: WindowRuntimePersistedState = {};
  const panelIds = Object.keys(value).sort();
  for (const rawPanelId of panelIds) {
    const panelId = rawPanelId.trim();
    if (panelId.length === 0) continue;
    const panelLayout = value[rawPanelId];
    if (!panelLayout) continue;
    nextState[panelId] = clonePanelLayout(panelLayout);
  }
  return nextState;
};

const sanitizeWindowRuntimePanelPolicy = (
  value: WindowRuntimePanelPolicyState
): WindowRuntimePanelPolicyState => {
  const nextState: WindowRuntimePanelPolicyState = {};
  const panelIds = Object.keys(value).sort();
  for (const rawPanelId of panelIds) {
    const panelId = rawPanelId.trim();
    if (panelId.length === 0) continue;
    const panelPolicy = value[rawPanelId];
    if (!panelPolicy) continue;
    nextState[panelId] = cloneWindowRuntimePanelPolicyStateEntry(panelPolicy);
  }
  return nextState;
};

const sanitizeWindowRuntimePanelOpenState = (
  value: WindowRuntimePanelOpenState
): WindowRuntimePanelOpenState => {
  const nextState: WindowRuntimePanelOpenState = {};
  const panelIds = Object.keys(value).sort();
  for (const rawPanelId of panelIds) {
    const panelId = rawPanelId.trim();
    if (panelId.length === 0) continue;
    nextState[panelId] = value[rawPanelId] === true;
  }
  return nextState;
};

const arePanelLayoutsEqual = (
  left: WindowRuntimePersistedPanelLayout,
  right: WindowRuntimePersistedPanelLayout
): boolean =>
  left.position.x === right.position.x &&
  left.position.y === right.position.y &&
  normalizeZIndex(left.zIndex) === normalizeZIndex(right.zIndex);

const areWindowRuntimePanelsEqual = (
  left: WindowRuntimePersistedState,
  right: WindowRuntimePersistedState
): boolean => {
  const leftPanelIds = Object.keys(left);
  const rightPanelIds = Object.keys(right);
  if (leftPanelIds.length !== rightPanelIds.length) return false;

  for (const panelId of leftPanelIds) {
    const leftPanel = left[panelId];
    const rightPanel = right[panelId];
    if (!leftPanel || !rightPanel || !arePanelLayoutsEqual(leftPanel, rightPanel)) {
      return false;
    }
  }
  return true;
};

const areWindowRuntimePanelPolicyEntriesEqual = (
  left: WindowRuntimePanelPolicyStateEntry,
  right: WindowRuntimePanelPolicyStateEntry
): boolean =>
  left.visible === right.visible &&
  left.displayMode === right.displayMode &&
  left.movable === right.movable &&
  left.defaultOpen === right.defaultOpen &&
  left.rememberPosition === right.rememberPosition &&
  left.defaultPosition.x === right.defaultPosition.x &&
  left.defaultPosition.y === right.defaultPosition.y;

const areWindowRuntimePanelPoliciesEqual = (
  left: WindowRuntimePanelPolicyState,
  right: WindowRuntimePanelPolicyState
): boolean => {
  const leftPanelIds = Object.keys(left);
  const rightPanelIds = Object.keys(right);
  if (leftPanelIds.length !== rightPanelIds.length) return false;

  for (const panelId of leftPanelIds) {
    const leftPolicy = left[panelId];
    const rightPolicy = right[panelId];
    if (
      !leftPolicy ||
      !rightPolicy ||
      !areWindowRuntimePanelPolicyEntriesEqual(leftPolicy, rightPolicy)
    ) {
      return false;
    }
  }
  return true;
};

const areWindowRuntimePanelOpenStatesEqual = (
  left: WindowRuntimePanelOpenState,
  right: WindowRuntimePanelOpenState
): boolean => {
  const leftPanelIds = Object.keys(left);
  const rightPanelIds = Object.keys(right);
  if (leftPanelIds.length !== rightPanelIds.length) return false;

  for (const panelId of leftPanelIds) {
    if (left[panelId] !== right[panelId]) {
      return false;
    }
  }
  return true;
};

const applyRememberPositionPolicy = (
  panels: WindowRuntimePersistedState,
  policy: WindowRuntimePanelPolicyState
): WindowRuntimePersistedState => {
  const nextPanels: WindowRuntimePersistedState = {};
  const panelIds = Object.keys(panels).sort();
  for (const panelId of panelIds) {
    const panelLayout = panels[panelId];
    if (!panelLayout) continue;
    const panelPolicy = policy[panelId];
    if (!panelPolicy || !panelPolicy.rememberPosition) {
      continue;
    }
    nextPanels[panelId] = clonePanelLayout(panelLayout);
  }
  return nextPanels;
};

export const useChromeStore = create<ChromeStoreState>((set, get) => ({
  isPanelOpen: false,
  openPanel: null,
  isPasteHelperOpen: false,
  isDataInputOpen: false,
  fullscreenInkMode: "off",
  showCursors: false,
  showBreakGuides: true,
  showCanvasBorder: true,
  windowRuntimePanelOpenState: sanitizeWindowRuntimePanelOpenState(
    DEFAULT_WINDOW_RUNTIME_PANEL_OPEN_STATE
  ),
  windowRuntimePanels: {},
  windowRuntimePanelPolicy: {},
  togglePanel: (panel) => {
    const { openPanel } = get();
    const nextPanel = openPanel === panel ? null : panel;
    set(() => ({
      openPanel: nextPanel,
      isPanelOpen: nextPanel !== null,
    }));
  },
  closePanel: () =>
    set(() => ({
      isPanelOpen: false,
      openPanel: null,
    })),
  openPasteHelper: () => set(() => ({ isPasteHelperOpen: true })),
  closePasteHelper: () => set(() => ({ isPasteHelperOpen: false })),
  openDataInput: () =>
    set((state) => ({
      isDataInputOpen: true,
      windowRuntimePanelOpenState: {
        ...state.windowRuntimePanelOpenState,
        [DATA_INPUT_PANEL_ID]: true,
      },
    })),
  closeDataInput: () =>
    set((state) => ({
      isDataInputOpen: false,
      windowRuntimePanelOpenState: {
        ...state.windowRuntimePanelOpenState,
        [DATA_INPUT_PANEL_ID]: false,
      },
    })),
  toggleDataInput: () =>
    set((state) => {
      const nextOpen = !state.isDataInputOpen;
      return {
        isDataInputOpen: nextOpen,
        windowRuntimePanelOpenState: {
          ...state.windowRuntimePanelOpenState,
          [DATA_INPUT_PANEL_ID]: nextOpen,
        },
      };
    }),
  setFullscreenInkMode: (mode) => set(() => ({ fullscreenInkMode: mode })),
  enterFullscreenInkNative: () => set(() => ({ fullscreenInkMode: "native" })),
  enterFullscreenInkFallback: () => set(() => ({ fullscreenInkMode: "app" })),
  exitFullscreenInk: () => set(() => ({ fullscreenInkMode: "off" })),
  toggleCursors: () => set((state) => ({ showCursors: !state.showCursors })),
  toggleBreakGuides: () =>
    set((state) => ({ showBreakGuides: !state.showBreakGuides })),
  toggleCanvasBorder: () =>
    set((state) => ({ showCanvasBorder: !state.showCanvasBorder })),
  replaceWindowRuntimePanels: (state) => {
    const sanitized = applyRememberPositionPolicy(
      sanitizeWindowRuntimePanels(state),
      get().windowRuntimePanelPolicy
    );
    const current = get().windowRuntimePanels;
    if (areWindowRuntimePanelsEqual(current, sanitized)) return;
    set(() => ({ windowRuntimePanels: sanitized }));
  },
  setWindowRuntimePanelLayout: (panelId, layout) => {
    const normalizedPanelId = panelId.trim();
    if (normalizedPanelId.length === 0) return;

    const { windowRuntimePanelPolicy, windowRuntimePanels: currentPanels } = get();
    const panelPolicy = windowRuntimePanelPolicy[normalizedPanelId];
    if (!panelPolicy || !panelPolicy.rememberPosition) {
      if (!(normalizedPanelId in currentPanels)) return;
      const nextPanels = { ...currentPanels };
      delete nextPanels[normalizedPanelId];
      set(() => ({ windowRuntimePanels: nextPanels }));
      return;
    }

    if (layout === null) {
      if (!(normalizedPanelId in currentPanels)) return;
      const nextPanels = { ...currentPanels };
      delete nextPanels[normalizedPanelId];
      set(() => ({ windowRuntimePanels: nextPanels }));
      return;
    }

    const sanitizedLayout = clonePanelLayout(layout);
    const currentLayout = currentPanels[normalizedPanelId];
    if (currentLayout && arePanelLayoutsEqual(currentLayout, sanitizedLayout)) {
      return;
    }

    set(() => ({
      windowRuntimePanels: {
        ...currentPanels,
        [normalizedPanelId]: sanitizedLayout,
      },
    }));
  },
  clearWindowRuntimePanels: () => {
    if (Object.keys(get().windowRuntimePanels).length === 0) return;
    set(() => ({ windowRuntimePanels: {} }));
  },
  replaceWindowRuntimePanelPolicy: (state) => {
    const sanitizedPolicy = sanitizeWindowRuntimePanelPolicy(state);
    const { windowRuntimePanels: currentPanels, windowRuntimePanelPolicy: currentPolicy } =
      get();
    const nextPanels = applyRememberPositionPolicy(currentPanels, sanitizedPolicy);
    if (
      areWindowRuntimePanelPoliciesEqual(currentPolicy, sanitizedPolicy) &&
      areWindowRuntimePanelsEqual(currentPanels, nextPanels)
    ) {
      return;
    }
    set(() => ({
      windowRuntimePanelPolicy: sanitizedPolicy,
      windowRuntimePanels: nextPanels,
    }));
  },
  setWindowRuntimePanelPolicy: (panelId, state) => {
    const normalizedPanelId = panelId.trim();
    if (normalizedPanelId.length === 0) return;

    const { windowRuntimePanels: currentPanels, windowRuntimePanelPolicy: currentPolicy } =
      get();
    const nextPolicy = { ...currentPolicy };
    let policyChanged = false;

    if (state === null) {
      if (normalizedPanelId in nextPolicy) {
        delete nextPolicy[normalizedPanelId];
        policyChanged = true;
      }
    } else {
      const sanitizedEntry = cloneWindowRuntimePanelPolicyStateEntry(state);
      const currentEntry = currentPolicy[normalizedPanelId];
      if (
        !currentEntry ||
        !areWindowRuntimePanelPolicyEntriesEqual(currentEntry, sanitizedEntry)
      ) {
        nextPolicy[normalizedPanelId] = sanitizedEntry;
        policyChanged = true;
      }
    }

    const nextPanels = applyRememberPositionPolicy(currentPanels, nextPolicy);
    if (!policyChanged && areWindowRuntimePanelsEqual(currentPanels, nextPanels)) {
      return;
    }

    set(() => ({
      windowRuntimePanelPolicy: policyChanged ? nextPolicy : currentPolicy,
      windowRuntimePanels: nextPanels,
    }));
  },
  clearWindowRuntimePanelPolicy: () => {
    const { windowRuntimePanelPolicy, windowRuntimePanels } = get();
    if (
      Object.keys(windowRuntimePanelPolicy).length === 0 &&
      Object.keys(windowRuntimePanels).length === 0
    ) {
      return;
    }
    const nextPanels = applyRememberPositionPolicy(windowRuntimePanels, {});
    set(() => ({
      windowRuntimePanelPolicy: {},
      windowRuntimePanels: nextPanels,
    }));
  },
  replaceWindowRuntimePanelOpenState: (state) => {
    const sanitized = sanitizeWindowRuntimePanelOpenState(state);
    const current = get().windowRuntimePanelOpenState;
    if (areWindowRuntimePanelOpenStatesEqual(current, sanitized)) return;

    set(() => ({
      windowRuntimePanelOpenState: sanitized,
      isDataInputOpen: sanitized[DATA_INPUT_PANEL_ID] === true,
    }));
  },
  setWindowRuntimePanelOpenState: (panelId, isOpen) => {
    const normalizedPanelId = panelId.trim();
    if (normalizedPanelId.length === 0) return;

    const normalizedIsOpen = isOpen === true;
    const { windowRuntimePanelOpenState: currentState, isDataInputOpen } = get();
    const currentValue = currentState[normalizedPanelId] === true;
    if (currentValue === normalizedIsOpen) return;

    const nextState: WindowRuntimePanelOpenState = {
      ...currentState,
      [normalizedPanelId]: normalizedIsOpen,
    };
    set(() => ({
      windowRuntimePanelOpenState: nextState,
      isDataInputOpen:
        normalizedPanelId === DATA_INPUT_PANEL_ID ? normalizedIsOpen : isDataInputOpen,
    }));
  },
  clearWindowRuntimePanelOpenState: () => {
    const defaultState = sanitizeWindowRuntimePanelOpenState(
      DEFAULT_WINDOW_RUNTIME_PANEL_OPEN_STATE
    );
    const currentState = get().windowRuntimePanelOpenState;
    const currentIsDataInputOpen = get().isDataInputOpen;
    if (
      areWindowRuntimePanelOpenStatesEqual(currentState, defaultState) &&
      !currentIsDataInputOpen
    ) {
      return;
    }
    set(() => ({
      windowRuntimePanelOpenState: defaultState,
      isDataInputOpen: false,
    }));
  },
}));
