import {
  classifyRuntimeSurface,
  isFixedCoreEngineSurface,
  type CoreEngineSurfaceId,
  type RuntimeSurfaceClass,
  type RuntimeSurfaceId,
} from "@core/config/coreModBoundary";

export type RuntimeBoundaryGuardFailure = {
  ok: false;
  code:
    | "invalid-surface-id"
    | "core-surface-not-allowlisted"
    | "surface-class-mismatch";
  message: string;
};

export type RuntimeBoundaryGuardSuccess = { ok: true };

export type RuntimeBoundaryGuardResult =
  | RuntimeBoundaryGuardFailure
  | RuntimeBoundaryGuardSuccess;

const isRuntimeSurfaceId = (value: string): value is RuntimeSurfaceId =>
  value.startsWith("panel:") ||
  value.startsWith("template:") ||
  value.startsWith("engine:");

const isCoreEngineSurfaceId = (value: string): value is CoreEngineSurfaceId =>
  value === "engine.toolbar.mode-selector-shell" ||
  value === "engine.command.dispatch-shell" ||
  value === "engine.policy.role-gate-bridge" ||
  value === "engine.window-host.mount-bridge";

export const validateRuntimeSurfaceId = (
  surfaceId: string
): RuntimeBoundaryGuardResult => {
  if (!isRuntimeSurfaceId(surfaceId)) {
    return {
      ok: false,
      code: "invalid-surface-id",
      message: `unknown runtime surface id '${surfaceId}'.`,
    };
  }

  if (surfaceId.startsWith("engine:")) {
    const engineSurfaceId = surfaceId.slice(7);
    if (!isCoreEngineSurfaceId(engineSurfaceId)) {
      return {
        ok: false,
        code: "core-surface-not-allowlisted",
        message: `engine surface '${engineSurfaceId}' is not in core allowlist.`,
      };
    }
    if (!isFixedCoreEngineSurface(engineSurfaceId)) {
      return {
        ok: false,
        code: "core-surface-not-allowlisted",
        message: `engine surface '${engineSurfaceId}' is not allowlisted.`,
      };
    }
  }

  return { ok: true };
};

export const assertRuntimeSurfaceClass = (
  surfaceId: RuntimeSurfaceId,
  expectedClass: RuntimeSurfaceClass
): RuntimeBoundaryGuardResult => {
  const validation = validateRuntimeSurfaceId(surfaceId);
  if (!validation.ok) return validation;

  const actualClass = classifyRuntimeSurface(surfaceId);
  if (actualClass !== expectedClass) {
    return {
      ok: false,
      code: "surface-class-mismatch",
      message: `surface '${surfaceId}' resolved to '${actualClass}', expected '${expectedClass}'.`,
    };
  }

  return { ok: true };
};

export const assertRuntimeSurfaceClassOrThrow = (
  surfaceId: RuntimeSurfaceId,
  expectedClass: RuntimeSurfaceClass
): void => {
  const result = assertRuntimeSurfaceClass(surfaceId, expectedClass);
  if (!result.ok) {
    throw new Error(
      `runtime boundary guard failed: ${result.code} (${result.message})`
    );
  }
};

