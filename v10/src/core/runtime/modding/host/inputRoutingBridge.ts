import type {
  ModInputHandleResult,
  NormalizedKeyEvent,
  NormalizedPointerEvent,
  NormalizedWheelGestureEvent,
} from "@core/runtime/modding/api";
import type { ModManagerInputRouter } from "./manager";

type ReactOrDomEvent<TNativeEvent extends object> =
  | TNativeEvent
  | { nativeEvent: TNativeEvent };

type PointerEventLike = {
  type?: string;
  pointerId?: number;
  clientX?: number;
  clientY?: number;
  pressure?: number;
  buttons?: number;
  timeStamp?: number;
  altKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
};

type KeyEventLike = {
  type?: string;
  code?: string;
  key?: string;
  repeat?: boolean;
  timeStamp?: number;
  altKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
};

type WheelEventLike = {
  deltaX?: number;
  deltaY?: number;
  deltaZ?: number;
  ctrlKey?: boolean;
  timeStamp?: number;
};

export type PointerRoutingEvent = ReactOrDomEvent<PointerEventLike>;
export type KeyRoutingEvent = ReactOrDomEvent<KeyEventLike>;
export type WheelRoutingEvent = ReactOrDomEvent<WheelEventLike>;

export type PointerNormalizationOptions = {
  phase?: NormalizedPointerEvent["phase"];
  toLocalPoint?: (clientX: number, clientY: number) => {
    x: number;
    y: number;
  };
};

export type KeyNormalizationOptions = {
  phase?: NormalizedKeyEvent["phase"];
};

type RouteWithManagerOptions = {
  manager: ModManagerInputRouter | null | undefined;
};

export type RouteModPointerInputOptions = RouteWithManagerOptions &
  PointerNormalizationOptions & {
    event: PointerRoutingEvent | null | undefined;
  };

export type RouteModKeyInputOptions = RouteWithManagerOptions &
  KeyNormalizationOptions & {
    event: KeyRoutingEvent | null | undefined;
  };

export type RouteModWheelInputOptions = RouteWithManagerOptions & {
  event: WheelRoutingEvent | null | undefined;
};

const POINTER_PHASE_BY_EVENT_TYPE: Readonly<
  Record<string, NormalizedPointerEvent["phase"]>
> = {
  pointerdown: "down",
  pointermove: "move",
  pointerup: "up",
  pointercancel: "cancel",
  pointerleave: "cancel",
};

const KEY_PHASE_BY_EVENT_TYPE: Readonly<
  Record<string, NormalizedKeyEvent["phase"]>
> = {
  keydown: "down",
  keyup: "up",
};

const PASS_RESULT: ModInputHandleResult = "pass";

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const hasNativeEvent = <TNativeEvent extends object>(
  value: unknown
): value is { nativeEvent: TNativeEvent } => {
  if (!isObject(value)) return false;
  if (!("nativeEvent" in value)) return false;
  return isObject((value as { nativeEvent: unknown }).nativeEvent);
};

const unwrapNativeEvent = <TNativeEvent extends object>(
  event: ReactOrDomEvent<TNativeEvent>
): TNativeEvent => (hasNativeEvent<TNativeEvent>(event) ? event.nativeEvent : event);

const toFiniteNumber = (value: unknown, fallback: number): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const toBoolean = (value: unknown): boolean => value === true;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export const resolvePointerPhaseFromEventType = (
  eventType: string | undefined
): NormalizedPointerEvent["phase"] | null => {
  if (typeof eventType !== "string") return null;
  const normalizedType = eventType.toLowerCase();
  return POINTER_PHASE_BY_EVENT_TYPE[normalizedType] ?? null;
};

export const resolveKeyPhaseFromEventType = (
  eventType: string | undefined
): NormalizedKeyEvent["phase"] | null => {
  if (typeof eventType !== "string") return null;
  const normalizedType = eventType.toLowerCase();
  return KEY_PHASE_BY_EVENT_TYPE[normalizedType] ?? null;
};

export const toNormalizedModPointerEvent = (
  event: PointerRoutingEvent | null | undefined,
  options: PointerNormalizationOptions = {}
): NormalizedPointerEvent | null => {
  if (!event) return null;
  const nativeEvent = unwrapNativeEvent(event);
  const phase = options.phase ?? resolvePointerPhaseFromEventType(nativeEvent.type);
  if (!phase) return null;

  const clientX = toFiniteNumber(nativeEvent.clientX, 0);
  const clientY = toFiniteNumber(nativeEvent.clientY, 0);
  const localPoint = options.toLocalPoint?.(clientX, clientY) ?? {
    x: clientX,
    y: clientY,
  };

  return {
    pointerId: toFiniteNumber(nativeEvent.pointerId, -1),
    phase,
    x: toFiniteNumber(localPoint.x, clientX),
    y: toFiniteNumber(localPoint.y, clientY),
    pressure: clamp(toFiniteNumber(nativeEvent.pressure, 0.5), 0, 1),
    buttons: toFiniteNumber(nativeEvent.buttons, 0),
    timestamp: toFiniteNumber(nativeEvent.timeStamp, 0),
    modifiers: {
      alt: toBoolean(nativeEvent.altKey),
      ctrl: toBoolean(nativeEvent.ctrlKey),
      shift: toBoolean(nativeEvent.shiftKey),
      meta: toBoolean(nativeEvent.metaKey),
    },
  };
};

export const toNormalizedModKeyEvent = (
  event: KeyRoutingEvent | null | undefined,
  options: KeyNormalizationOptions = {}
): NormalizedKeyEvent | null => {
  if (!event) return null;
  const nativeEvent = unwrapNativeEvent(event);
  const phase = options.phase ?? resolveKeyPhaseFromEventType(nativeEvent.type);
  if (!phase) return null;

  return {
    phase,
    code: typeof nativeEvent.code === "string" ? nativeEvent.code : "",
    key: typeof nativeEvent.key === "string" ? nativeEvent.key : "",
    repeat: toBoolean(nativeEvent.repeat),
    timestamp: toFiniteNumber(nativeEvent.timeStamp, 0),
    modifiers: {
      alt: toBoolean(nativeEvent.altKey),
      ctrl: toBoolean(nativeEvent.ctrlKey),
      shift: toBoolean(nativeEvent.shiftKey),
      meta: toBoolean(nativeEvent.metaKey),
    },
  };
};

export const toNormalizedModWheelGestureEvent = (
  event: WheelRoutingEvent | null | undefined
): NormalizedWheelGestureEvent | null => {
  if (!event) return null;
  const nativeEvent = unwrapNativeEvent(event);
  return {
    dx: toFiniteNumber(nativeEvent.deltaX, 0),
    dy: toFiniteNumber(nativeEvent.deltaY, 0),
    dz: toFiniteNumber(nativeEvent.deltaZ, 0),
    ctrlKey: toBoolean(nativeEvent.ctrlKey),
    timestamp: toFiniteNumber(nativeEvent.timeStamp, 0),
  };
};

export const routeModPointerInput = (
  options: RouteModPointerInputOptions
): ModInputHandleResult => {
  if (!options.manager) return PASS_RESULT;
  const normalizedEvent = toNormalizedModPointerEvent(options.event, options);
  if (!normalizedEvent) return PASS_RESULT;
  return options.manager.routePointer(normalizedEvent);
};

export const routeModKeyInput = (
  options: RouteModKeyInputOptions
): ModInputHandleResult => {
  if (!options.manager) return PASS_RESULT;
  const normalizedEvent = toNormalizedModKeyEvent(options.event, options);
  if (!normalizedEvent) return PASS_RESULT;
  return options.manager.routeKey(normalizedEvent);
};

export const routeModWheelInput = (
  options: RouteModWheelInputOptions
): ModInputHandleResult => {
  if (!options.manager) return PASS_RESULT;
  const normalizedEvent = toNormalizedModWheelGestureEvent(options.event);
  if (!normalizedEvent) return PASS_RESULT;
  return options.manager.routeWheel(normalizedEvent);
};
