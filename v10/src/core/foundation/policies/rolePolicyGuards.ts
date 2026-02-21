export type RolePolicyDecision = "allow" | "deny";

export type RolePolicyDefaultDecision = "deny";

export type RolePolicyActionMap = Record<string, RolePolicyDecision>;

export type RolePolicySurfaceMap = Record<string, RolePolicyActionMap>;

export type RolePolicyRoleEntry = {
  surfaces: RolePolicySurfaceMap;
};

export type RolePolicyDocument = {
  version: number;
  defaultDecision: RolePolicyDefaultDecision;
  roles: Record<string, RolePolicyRoleEntry>;
};

export type RolePolicyValidationResult =
  | { ok: true; value: RolePolicyDocument }
  | { ok: false; error: string };

const ROOT_KEYS = new Set<string>(["version", "defaultDecision", "roles"]);
const ROLE_ENTRY_KEYS = new Set<string>(["surfaces"]);

const isPlainRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const hasOnlyKnownKeys = (
  value: Record<string, unknown>,
  allowedKeys: ReadonlySet<string>
): boolean => {
  for (const key of Object.keys(value)) {
    if (!allowedKeys.has(key)) {
      return false;
    }
  }
  return true;
};

const toNonEmptyKey = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};

const isRolePolicyDecision = (value: unknown): value is RolePolicyDecision => {
  return value === "allow" || value === "deny";
};

export const validateRolePolicyDocument = (
  value: unknown
): RolePolicyValidationResult => {
  if (!isPlainRecord(value)) {
    return {
      ok: false,
      error: "role policy must be a plain object.",
    };
  }

  if (!hasOnlyKnownKeys(value, ROOT_KEYS)) {
    return {
      ok: false,
      error: "role policy has unknown root keys.",
    };
  }

  const version = value.version;
  if (
    typeof version !== "number" ||
    !Number.isInteger(version) ||
    !Number.isFinite(version) ||
    version <= 0
  ) {
    return {
      ok: false,
      error: "role policy.version must be a positive integer.",
    };
  }

  if (value.defaultDecision !== "deny") {
    return {
      ok: false,
      error: "role policy.defaultDecision must be 'deny'.",
    };
  }

  if (!isPlainRecord(value.roles)) {
    return {
      ok: false,
      error: "role policy.roles must be a plain object.",
    };
  }

  const roles: Record<string, RolePolicyRoleEntry> = {};
  for (const [rawRoleKey, rawRoleEntry] of Object.entries(value.roles)) {
    const roleKey = toNonEmptyKey(rawRoleKey);
    if (!roleKey) {
      return {
        ok: false,
        error: "role policy role keys must be non-empty strings.",
      };
    }

    if (!isPlainRecord(rawRoleEntry)) {
      return {
        ok: false,
        error: `role policy role '${roleKey}' must be a plain object.`,
      };
    }

    if (!hasOnlyKnownKeys(rawRoleEntry, ROLE_ENTRY_KEYS)) {
      return {
        ok: false,
        error: `role policy role '${roleKey}' has unknown keys.`,
      };
    }

    if (!isPlainRecord(rawRoleEntry.surfaces)) {
      return {
        ok: false,
        error: `role policy role '${roleKey}'.surfaces must be a plain object.`,
      };
    }

    const surfaces: RolePolicySurfaceMap = {};
    for (const [rawSurfaceKey, rawActions] of Object.entries(rawRoleEntry.surfaces)) {
      const surfaceKey = toNonEmptyKey(rawSurfaceKey);
      if (!surfaceKey) {
        return {
          ok: false,
          error: `role policy role '${roleKey}' contains an empty surface key.`,
        };
      }

      if (!isPlainRecord(rawActions)) {
        return {
          ok: false,
          error: `role policy role '${roleKey}' surface '${surfaceKey}' must be a plain object.`,
        };
      }

      const actions: RolePolicyActionMap = {};
      for (const [rawActionKey, rawDecision] of Object.entries(rawActions)) {
        const actionKey = toNonEmptyKey(rawActionKey);
        if (!actionKey) {
          return {
            ok: false,
            error: `role policy role '${roleKey}' surface '${surfaceKey}' contains an empty action key.`,
          };
        }

        if (!isRolePolicyDecision(rawDecision)) {
          return {
            ok: false,
            error: `role policy role '${roleKey}' surface '${surfaceKey}' action '${actionKey}' must be 'allow' or 'deny'.`,
          };
        }

        actions[actionKey] = rawDecision;
      }

      surfaces[surfaceKey] = actions;
    }

    roles[roleKey] = { surfaces };
  }

  return {
    ok: true,
    value: {
      version,
      defaultDecision: "deny",
      roles,
    },
  };
};
