import type {
  WindowRuntimeInitInput,
  WindowRuntimeMoveByInput,
  WindowRuntimeMoveToInput,
  WindowRuntimePanelContract,
  WindowRuntimePanelState,
  WindowRuntimePersistedPanelLayout,
  WindowRuntimePersistedState,
  WindowRuntimePoint,
  WindowRuntimeReconcileInput,
  WindowRuntimeRect,
  WindowRuntimeSize,
  WindowRuntimeState,
} from "./windowRuntime.types";

const MIN_Z_INDEX = 1;
const WINDOW_EDGE_SNAP_THRESHOLD_PX = 24;

const normalizeFinite = (value: number, fallback: number): number =>
  Number.isFinite(value) ? value : fallback;

const normalizePoint = (
  value: WindowRuntimePoint,
  fallback: WindowRuntimePoint = { x: 0, y: 0 }
): WindowRuntimePoint => ({
  x: normalizeFinite(value.x, fallback.x),
  y: normalizeFinite(value.y, fallback.y),
});

const normalizeSize = (value: WindowRuntimeSize): WindowRuntimeSize => ({
  width: Math.max(0, normalizeFinite(value.width, 0)),
  height: Math.max(0, normalizeFinite(value.height, 0)),
});

const normalizeRect = (value: WindowRuntimeRect): WindowRuntimeRect => {
  const size = normalizeSize(value);
  return {
    x: normalizeFinite(value.x, 0),
    y: normalizeFinite(value.y, 0),
    width: size.width,
    height: size.height,
  };
};

const normalizeZIndex = (value: number, fallback: number): number => {
  const normalized = Math.trunc(normalizeFinite(value, fallback));
  return normalized < MIN_Z_INDEX ? MIN_Z_INDEX : normalized;
};

const normalizePanelId = (value: string): string => value.trim();

const arePointsEqual = (a: WindowRuntimePoint, b: WindowRuntimePoint): boolean =>
  a.x === b.x && a.y === b.y;

const areSizesEqual = (a: WindowRuntimeSize, b: WindowRuntimeSize): boolean =>
  a.width === b.width && a.height === b.height;

const areRectsEqual = (a: WindowRuntimeRect, b: WindowRuntimeRect): boolean =>
  a.x === b.x && a.y === b.y && areSizesEqual(a, b);

const arePanelStatesEqual = (
  a: WindowRuntimePanelState,
  b: WindowRuntimePanelState
): boolean =>
  a.panelId === b.panelId &&
  a.slot === b.slot &&
  a.displayMode === b.displayMode &&
  a.movable === b.movable &&
  a.rememberPosition === b.rememberPosition &&
  arePointsEqual(a.defaultPosition, b.defaultPosition) &&
  arePointsEqual(a.position, b.position) &&
  areSizesEqual(a.size, b.size) &&
  a.isOpen === b.isOpen &&
  a.zIndex === b.zIndex;

const clampFinite = (value: number, min: number, max: number): number => {
  if (max <= min) return min;
  if (value <= min) return min;
  if (value >= max) return max;
  return value;
};

export const clampWindowRuntimePosition = (
  position: WindowRuntimePoint,
  panelSize: WindowRuntimeSize,
  clampBounds: WindowRuntimeRect
): WindowRuntimePoint => {
  const nextPosition = normalizePoint(position);
  const nextSize = normalizeSize(panelSize);
  const nextBounds = normalizeRect(clampBounds);

  const minX = nextBounds.x;
  const minY = nextBounds.y;
  const maxX = nextBounds.x + nextBounds.width - nextSize.width;
  const maxY = nextBounds.y + nextBounds.height - nextSize.height;

  const clampedX = clampFinite(nextPosition.x, minX, maxX);
  const clampedY = clampFinite(nextPosition.y, minY, maxY);
  const snapThreshold = WINDOW_EDGE_SNAP_THRESHOLD_PX;

  const snappedX =
    Math.abs(clampedX - minX) <= snapThreshold
      ? minX
      : Math.abs(clampedX - maxX) <= snapThreshold
        ? maxX
        : clampedX;

  const snappedY =
    Math.abs(clampedY - minY) <= snapThreshold
      ? minY
      : Math.abs(clampedY - maxY) <= snapThreshold
        ? maxY
        : clampedY;

  return {
    x: snappedX,
    y: snappedY,
  };
};

const sanitizePersistedLayout = (
  value: WindowRuntimePersistedPanelLayout | undefined
): WindowRuntimePersistedPanelLayout | undefined => {
  if (!value) return undefined;
  return {
    position: normalizePoint(value.position),
    zIndex: normalizeZIndex(value.zIndex, MIN_Z_INDEX),
  };
};

type BuildPanelStateInput = {
  contract: WindowRuntimePanelContract;
  panelId: string;
  fallbackZIndex: number;
  clampBounds: WindowRuntimeRect;
  persisted?: WindowRuntimePersistedPanelLayout;
  previous?: WindowRuntimePanelState;
};

const buildPanelState = ({
  contract,
  panelId,
  fallbackZIndex,
  clampBounds,
  persisted,
  previous,
}: BuildPanelStateInput): WindowRuntimePanelState => {
  const defaultPosition = normalizePoint(contract.behavior.defaultPosition);
  const size = normalizeSize(contract.size);
  const persistedLayout = sanitizePersistedLayout(persisted);

  const candidatePosition =
    previous?.position ??
    (contract.behavior.rememberPosition
      ? persistedLayout?.position ?? defaultPosition
      : defaultPosition);

  const position = clampWindowRuntimePosition(candidatePosition, size, clampBounds);
  const zIndex = normalizeZIndex(
    previous?.zIndex ??
      (contract.behavior.rememberPosition
        ? persistedLayout?.zIndex ?? fallbackZIndex
        : fallbackZIndex),
    fallbackZIndex
  );
  const isOpen = contract.isOpen ?? previous?.isOpen ?? contract.behavior.defaultOpen;

  return {
    panelId,
    slot: contract.slot,
    displayMode: contract.behavior.displayMode,
    movable: contract.behavior.movable,
    rememberPosition: contract.behavior.rememberPosition,
    defaultPosition,
    position,
    size,
    isOpen,
    zIndex,
  };
};

const buildRuntimeState = (
  input: WindowRuntimeInitInput,
  previous?: WindowRuntimeState
): WindowRuntimeState => {
  const clampBounds = normalizeRect(input.clampBounds);
  const panelOrder: string[] = [];
  const panels: Record<string, WindowRuntimePanelState> = {};
  const seenPanelIds = new Set<string>();
  let fallbackZIndex = MIN_Z_INDEX;
  let maxZIndex = MIN_Z_INDEX - 1;

  for (const contract of input.panels) {
    const panelId = normalizePanelId(contract.panelId);
    if (panelId.length === 0 || seenPanelIds.has(panelId)) {
      continue;
    }
    seenPanelIds.add(panelId);

    const panelState = buildPanelState({
      contract,
      panelId,
      fallbackZIndex,
      clampBounds,
      persisted: input.persisted?.[panelId],
      previous: previous?.panels[panelId],
    });

    panelOrder.push(panelId);
    panels[panelId] = panelState;
    maxZIndex = Math.max(maxZIndex, panelState.zIndex);
    fallbackZIndex = Math.max(fallbackZIndex + 1, panelState.zIndex + 1);
  }

  return {
    clampBounds,
    panelOrder,
    panels,
    nextZIndex: Math.max(maxZIndex + 1, MIN_Z_INDEX),
  };
};

export const createWindowRuntimeState = (
  input: WindowRuntimeInitInput
): WindowRuntimeState => buildRuntimeState(input);

const isPanelOrderEqual = (a: readonly string[], b: readonly string[]): boolean => {
  if (a.length !== b.length) return false;
  for (let index = 0; index < a.length; index += 1) {
    if (a[index] !== b[index]) return false;
  }
  return true;
};

const arePanelMapsEqual = (
  a: Record<string, WindowRuntimePanelState>,
  b: Record<string, WindowRuntimePanelState>
): boolean => {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;

  for (const panelId of aKeys) {
    const left = a[panelId];
    const right = b[panelId];
    if (!left || !right || !arePanelStatesEqual(left, right)) {
      return false;
    }
  }
  return true;
};

const areRuntimeStatesEqual = (
  a: WindowRuntimeState,
  b: WindowRuntimeState
): boolean =>
  areRectsEqual(a.clampBounds, b.clampBounds) &&
  isPanelOrderEqual(a.panelOrder, b.panelOrder) &&
  arePanelMapsEqual(a.panels, b.panels) &&
  a.nextZIndex === b.nextZIndex;

export const reconcileWindowRuntimeState = (
  input: WindowRuntimeReconcileInput
): WindowRuntimeState => {
  const nextState = buildRuntimeState(input, input.previous);
  return areRuntimeStatesEqual(nextState, input.previous)
    ? input.previous
    : nextState;
};

export const isWindowRuntimePanelDraggable = (
  panel: WindowRuntimePanelState
): boolean => panel.displayMode === "windowed" && panel.movable;

const withPanelUpdate = (
  state: WindowRuntimeState,
  panelId: string,
  updater: (panel: WindowRuntimePanelState) => WindowRuntimePanelState
): WindowRuntimeState => {
  const panel = state.panels[panelId];
  if (!panel) return state;
  const nextPanel = updater(panel);
  if (arePanelStatesEqual(panel, nextPanel)) return state;

  return {
    ...state,
    panels: {
      ...state.panels,
      [panelId]: nextPanel,
    },
  };
};

export const focusWindowRuntimePanel = (
  state: WindowRuntimeState,
  panelId: string
): WindowRuntimeState => {
  const panel = state.panels[panelId];
  if (!panel) return state;
  const nextZIndex = Math.max(state.nextZIndex, MIN_Z_INDEX);

  return {
    ...state,
    panels: {
      ...state.panels,
      [panelId]: {
        ...panel,
        zIndex: nextZIndex,
      },
    },
    nextZIndex: nextZIndex + 1,
  };
};

export const moveWindowRuntimePanelTo = (
  state: WindowRuntimeState,
  input: WindowRuntimeMoveToInput
): WindowRuntimeState =>
  withPanelUpdate(state, input.panelId, (panel) => {
    if (!isWindowRuntimePanelDraggable(panel)) return panel;
    const nextPosition = clampWindowRuntimePosition(
      input.position,
      panel.size,
      state.clampBounds
    );
    if (arePointsEqual(panel.position, nextPosition)) return panel;
    return {
      ...panel,
      position: nextPosition,
    };
  });

export const moveWindowRuntimePanelBy = (
  state: WindowRuntimeState,
  input: WindowRuntimeMoveByInput
): WindowRuntimeState => {
  const panel = state.panels[input.panelId];
  if (!panel) return state;

  const dx = normalizeFinite(input.delta.dx, 0);
  const dy = normalizeFinite(input.delta.dy, 0);

  return moveWindowRuntimePanelTo(state, {
    panelId: input.panelId,
    position: {
      x: panel.position.x + dx,
      y: panel.position.y + dy,
    },
  });
};

export const resetWindowRuntimePanel = (
  state: WindowRuntimeState,
  panelId: string
): WindowRuntimeState =>
  withPanelUpdate(state, panelId, (panel) => {
    const nextPosition = clampWindowRuntimePosition(
      panel.defaultPosition,
      panel.size,
      state.clampBounds
    );
    if (arePointsEqual(panel.position, nextPosition)) return panel;
    return {
      ...panel,
      position: nextPosition,
    };
  });

export const setWindowRuntimePanelOpen = (
  state: WindowRuntimeState,
  panelId: string,
  isOpen: boolean
): WindowRuntimeState =>
  withPanelUpdate(state, panelId, (panel) => {
    if (panel.isOpen === isOpen) return panel;
    return {
      ...panel,
      isOpen,
    };
  });

export const setWindowRuntimePanelDisplayMode = (
  state: WindowRuntimeState,
  panelId: string,
  displayMode: WindowRuntimePanelState["displayMode"]
): WindowRuntimeState =>
  withPanelUpdate(state, panelId, (panel) => {
    if (panel.displayMode === displayMode) return panel;
    return {
      ...panel,
      displayMode,
    };
  });

export const extractWindowRuntimePersistedState = (
  state: WindowRuntimeState
): WindowRuntimePersistedState => {
  const persisted: WindowRuntimePersistedState = {};
  for (const panelId of state.panelOrder) {
    const panel = state.panels[panelId];
    if (!panel) continue;

    persisted[panelId] = {
      position: normalizePoint(panel.position),
      zIndex: normalizeZIndex(panel.zIndex, MIN_Z_INDEX),
    };
  }
  return persisted;
};

const arePersistedLayoutsEqual = (
  a: WindowRuntimePersistedPanelLayout,
  b: WindowRuntimePersistedPanelLayout
): boolean =>
  arePointsEqual(a.position, b.position) &&
  normalizeZIndex(a.zIndex, MIN_Z_INDEX) === normalizeZIndex(b.zIndex, MIN_Z_INDEX);

export const areWindowRuntimePersistedStatesEqual = (
  a: WindowRuntimePersistedState,
  b: WindowRuntimePersistedState
): boolean => {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;

  for (const panelId of aKeys) {
    const left = a[panelId];
    const right = b[panelId];
    if (!left || !right || !arePersistedLayoutsEqual(left, right)) {
      return false;
    }
  }
  return true;
};

export const listWindowRuntimePanelsByOrder = (
  state: WindowRuntimeState
): WindowRuntimePanelState[] => {
  const panels: WindowRuntimePanelState[] = [];
  for (const panelId of state.panelOrder) {
    const panel = state.panels[panelId];
    if (panel) {
      panels.push(panel);
    }
  }
  return panels;
};

export const listWindowRuntimePanelsByZ = (
  state: WindowRuntimeState
): WindowRuntimePanelState[] => {
  const panelOrderIndex = new Map<string, number>();
  for (let index = 0; index < state.panelOrder.length; index += 1) {
    panelOrderIndex.set(state.panelOrder[index], index);
  }

  return listWindowRuntimePanelsByOrder(state).sort((left, right) => {
    if (left.zIndex === right.zIndex) {
      const leftOrder = panelOrderIndex.get(left.panelId) ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = panelOrderIndex.get(right.panelId) ?? Number.MAX_SAFE_INTEGER;
      return leftOrder - rightOrder;
    }
    return left.zIndex - right.zIndex;
  });
};
