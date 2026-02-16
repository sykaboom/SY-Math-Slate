import { isKnownUISlotName, type UISlotName } from "@core/extensions/registry";
import {
  PANEL_DISPLAY_MODES,
  type PanelDisplayMode,
  type PanelRuntimeRole,
} from "./panelBehavior.types";
import type {
  WindowRuntimePersistedPanelLayout,
  WindowRuntimePersistedState,
  WindowRuntimePoint,
} from "./windowRuntime.types";

const DEFAULT_RUNTIME_ROLE: PanelRuntimeRole = "student";
const DEFAULT_SLOT: UISlotName = "toolbar-bottom";
const DEFAULT_DISPLAY_MODE: PanelDisplayMode = "docked";
const DEFAULT_POSITION: WindowRuntimePoint = { x: 0, y: 0 };

type PlainRecord = Record<string, unknown>;

const isPlainRecord = (value: unknown): value is PlainRecord => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

const isRuntimeRole = (value: unknown): value is PanelRuntimeRole =>
  value === "host" || value === "student";

const isPanelDisplayMode = (value: unknown): value is PanelDisplayMode =>
  typeof value === "string" &&
  (PANEL_DISPLAY_MODES as readonly string[]).includes(value);

const normalizePanelId = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

const normalizeFinite = (value: unknown, fallback: number): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const normalizePoint = (
  value: WindowRuntimePoint,
  fallback: WindowRuntimePoint = DEFAULT_POSITION
): WindowRuntimePoint => ({
  x: normalizeFinite(value.x, fallback.x),
  y: normalizeFinite(value.y, fallback.y),
});

const clonePoint = (value: WindowRuntimePoint): WindowRuntimePoint => ({
  x: value.x,
  y: value.y,
});

const normalizeZIndex = (value: unknown, fallback: number): number =>
  Math.max(0, Math.trunc(normalizeFinite(value, fallback)));

const sanitizePersistedLayout = (
  value: unknown
): WindowRuntimePersistedPanelLayout | null => {
  if (!isPlainRecord(value)) return null;
  if (!isPlainRecord(value.position)) return null;
  return {
    position: {
      x: normalizeFinite(value.position.x, DEFAULT_POSITION.x),
      y: normalizeFinite(value.position.y, DEFAULT_POSITION.y),
    },
    zIndex: normalizeZIndex(value.zIndex, 0),
  };
};

const toPanelIdSet = (
  value?: readonly string[] | ReadonlySet<string>
): ReadonlySet<string> => {
  if (!value) return new Set<string>();
  const ids = Array.from(value);

  const next = new Set<string>();
  for (const candidate of ids) {
    const panelId = normalizePanelId(candidate);
    if (panelId.length === 0) continue;
    next.add(panelId);
  }
  return next;
};

type FallbackState = { used: boolean };

const markFallback = (state: FallbackState): void => {
  state.used = true;
};

const takeFallback = <T>(state: FallbackState, fallback: T): T => {
  markFallback(state);
  return fallback;
};

type ResolvedRoleOverride = {
  visible?: boolean;
  displayMode?: PanelDisplayMode;
  movable?: boolean;
  defaultOpen?: boolean;
};

const resolveRoleOverride = (
  roleOverrideValue: unknown,
  role: PanelRuntimeRole,
  fallbackState: FallbackState
): ResolvedRoleOverride => {
  if (roleOverrideValue === undefined) {
    return {};
  }

  if (!isPlainRecord(roleOverrideValue)) {
    markFallback(fallbackState);
    return {};
  }

  const roleValue = roleOverrideValue[role];
  if (roleValue === undefined) {
    return {};
  }
  if (!isPlainRecord(roleValue)) {
    markFallback(fallbackState);
    return {};
  }

  const resolved: ResolvedRoleOverride = {};

  if (roleValue.visible !== undefined) {
    if (typeof roleValue.visible === "boolean") {
      resolved.visible = roleValue.visible;
    } else {
      markFallback(fallbackState);
    }
  }

  if (roleValue.displayMode !== undefined) {
    if (isPanelDisplayMode(roleValue.displayMode)) {
      resolved.displayMode = roleValue.displayMode;
    } else {
      markFallback(fallbackState);
    }
  }

  if (roleValue.movable !== undefined) {
    if (typeof roleValue.movable === "boolean") {
      resolved.movable = roleValue.movable;
    } else {
      markFallback(fallbackState);
    }
  }

  if (roleValue.defaultOpen !== undefined) {
    if (typeof roleValue.defaultOpen === "boolean") {
      resolved.defaultOpen = roleValue.defaultOpen;
    } else {
      markFallback(fallbackState);
    }
  }

  return resolved;
};

export type PanelPolicyRuntimeResolvedBehavior = {
  visible: boolean;
  displayMode: PanelDisplayMode;
  movable: boolean;
  defaultOpen: boolean;
  rememberPosition: boolean;
  defaultPosition: WindowRuntimePoint;
};

export type PanelPolicyRuntimeResolvedEntry = {
  panelId: string;
  slot: UISlotName;
  behavior: PanelPolicyRuntimeResolvedBehavior;
  initialPosition: WindowRuntimePoint;
  persistedLayout: WindowRuntimePersistedPanelLayout | null;
  isEditOnlyPanel: boolean;
  usedFallbackDefaults: boolean;
};

export type ResolvePanelPolicyRuntimeEntryInput = {
  panelId: string;
  panelPolicy?: unknown;
  role: unknown;
  persistedPanels?: WindowRuntimePersistedState;
  editOnlyPanelIds?: readonly string[] | ReadonlySet<string>;
  isEditOnlyPanel?: boolean;
};

export const resolvePanelPolicyRuntimeRole = (
  role: unknown
): PanelRuntimeRole => (isRuntimeRole(role) ? role : DEFAULT_RUNTIME_ROLE);

export const resolvePanelPolicyRuntimeEntry = (
  input: ResolvePanelPolicyRuntimeEntryInput
): PanelPolicyRuntimeResolvedEntry => {
  const normalizedPanelId = normalizePanelId(input.panelId);
  const panelId =
    normalizedPanelId.length > 0 ? normalizedPanelId : "panel.invalid-id";
  const role = resolvePanelPolicyRuntimeRole(input.role);
  const editOnlyPanelIdSet = toPanelIdSet(input.editOnlyPanelIds);
  const isEditOnlyPanel =
    input.isEditOnlyPanel ?? editOnlyPanelIdSet.has(panelId);

  const fallbackState: FallbackState = { used: false };
  const panelPolicyRecord = isPlainRecord(input.panelPolicy)
    ? input.panelPolicy
    : null;
  if (!panelPolicyRecord) {
    markFallback(fallbackState);
  }

  const slot = isKnownUISlotName(panelPolicyRecord?.slot)
    ? panelPolicyRecord.slot
    : takeFallback(fallbackState, DEFAULT_SLOT);

  const behaviorRecord =
    panelPolicyRecord && isPlainRecord(panelPolicyRecord.behavior)
      ? panelPolicyRecord.behavior
      : null;
  if (!behaviorRecord) {
    markFallback(fallbackState);
  }

  const baseDisplayMode =
    behaviorRecord && isPanelDisplayMode(behaviorRecord.displayMode)
      ? behaviorRecord.displayMode
      : takeFallback(fallbackState, DEFAULT_DISPLAY_MODE);
  const baseMovable =
    behaviorRecord && typeof behaviorRecord.movable === "boolean"
      ? behaviorRecord.movable
      : takeFallback(fallbackState, false);
  const baseDefaultOpen =
    behaviorRecord && typeof behaviorRecord.defaultOpen === "boolean"
      ? behaviorRecord.defaultOpen
      : takeFallback(fallbackState, false);
  const rememberPosition =
    behaviorRecord && typeof behaviorRecord.rememberPosition === "boolean"
      ? behaviorRecord.rememberPosition
      : takeFallback(fallbackState, false);

  const defaultPositionRecord =
    behaviorRecord && isPlainRecord(behaviorRecord.defaultPosition)
      ? behaviorRecord.defaultPosition
      : null;
  if (!defaultPositionRecord) {
    markFallback(fallbackState);
  }

  const defaultPosition = normalizePoint({
    x:
      defaultPositionRecord &&
      typeof defaultPositionRecord.x === "number" &&
      Number.isFinite(defaultPositionRecord.x)
        ? defaultPositionRecord.x
        : takeFallback(fallbackState, DEFAULT_POSITION.x),
    y:
      defaultPositionRecord &&
      typeof defaultPositionRecord.y === "number" &&
      Number.isFinite(defaultPositionRecord.y)
        ? defaultPositionRecord.y
        : takeFallback(fallbackState, DEFAULT_POSITION.y),
  });

  const roleOverride = resolveRoleOverride(
    behaviorRecord?.roleOverride,
    role,
    fallbackState
  );

  const displayMode = roleOverride.displayMode ?? baseDisplayMode;
  const movable = roleOverride.movable ?? baseMovable;
  const defaultOpen = roleOverride.defaultOpen ?? baseDefaultOpen;
  const visibleFallback = role === "student" && isEditOnlyPanel ? false : true;
  const visible = roleOverride.visible ?? visibleFallback;

  const persistedLayout = rememberPosition
    ? sanitizePersistedLayout(input.persistedPanels?.[panelId])
    : null;

  return {
    panelId,
    slot,
    behavior: {
      visible,
      displayMode,
      movable,
      defaultOpen,
      rememberPosition,
      defaultPosition,
    },
    initialPosition: persistedLayout
      ? clonePoint(persistedLayout.position)
      : clonePoint(defaultPosition),
    persistedLayout,
    isEditOnlyPanel,
    usedFallbackDefaults: fallbackState.used,
  };
};

export type PanelPolicyRuntimeResolvedDocument = {
  role: PanelRuntimeRole;
  panels: Record<string, PanelPolicyRuntimeResolvedEntry>;
};

export type ResolvePanelPolicyRuntimeDocumentInput = {
  policyDocument: unknown;
  role: unknown;
  persistedPanels?: WindowRuntimePersistedState;
  editOnlyPanelIds?: readonly string[] | ReadonlySet<string>;
};

const resolvePolicyPanels = (policyDocument: unknown): Record<string, unknown> => {
  if (!isPlainRecord(policyDocument)) {
    return {};
  }
  if (!isPlainRecord(policyDocument.panels)) {
    return {};
  }

  const panels: Record<string, unknown> = {};
  const panelIds = Object.keys(policyDocument.panels).sort();
  for (const rawPanelId of panelIds) {
    const panelId = normalizePanelId(rawPanelId);
    if (panelId.length === 0) continue;
    panels[panelId] = policyDocument.panels[rawPanelId];
  }
  return panels;
};

export const resolvePanelPolicyRuntimeDocument = (
  input: ResolvePanelPolicyRuntimeDocumentInput
): PanelPolicyRuntimeResolvedDocument => {
  const role = resolvePanelPolicyRuntimeRole(input.role);
  const policyPanels = resolvePolicyPanels(input.policyDocument);
  const editOnlyPanelIdSet = toPanelIdSet(input.editOnlyPanelIds);
  const panelIdSet = new Set<string>([
    ...Object.keys(policyPanels),
    ...Array.from(editOnlyPanelIdSet),
  ]);

  const panels: Record<string, PanelPolicyRuntimeResolvedEntry> = {};
  for (const panelId of Array.from(panelIdSet).sort()) {
    panels[panelId] = resolvePanelPolicyRuntimeEntry({
      panelId,
      panelPolicy: policyPanels[panelId],
      role,
      persistedPanels: input.persistedPanels,
      isEditOnlyPanel: editOnlyPanelIdSet.has(panelId),
    });
  }

  return {
    role,
    panels,
  };
};

export type WindowRuntimePanelPolicyStateEntry =
  PanelPolicyRuntimeResolvedBehavior;
export type WindowRuntimePanelPolicyState = Record<
  string,
  WindowRuntimePanelPolicyStateEntry
>;

const cloneResolvedBehavior = (
  behavior: PanelPolicyRuntimeResolvedBehavior
): PanelPolicyRuntimeResolvedBehavior => ({
  visible: behavior.visible,
  displayMode: behavior.displayMode,
  movable: behavior.movable,
  defaultOpen: behavior.defaultOpen,
  rememberPosition: behavior.rememberPosition,
  defaultPosition: clonePoint(behavior.defaultPosition),
});

export const createWindowRuntimePanelPolicyState = (
  panels: Record<string, PanelPolicyRuntimeResolvedEntry>
): WindowRuntimePanelPolicyState => {
  const nextState: WindowRuntimePanelPolicyState = {};
  const panelIds = Object.keys(panels).sort();

  for (const panelId of panelIds) {
    const panel = panels[panelId];
    if (!panel) continue;
    nextState[panelId] = cloneResolvedBehavior(panel.behavior);
  }

  return nextState;
};
