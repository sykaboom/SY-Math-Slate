import { fail } from "../../utils";

export const parseDefaultEnabledImpl = (
  value: unknown
): { ok: true; value: boolean | undefined } | { ok: false; value: ReturnType<typeof fail> } => {
  if (value === undefined) {
    return { ok: true, value: undefined };
  }
  if (typeof value !== "boolean") {
    return {
      ok: false,
      value: fail(
        "invalid-default-enabled",
        "manifest.defaultEnabled",
        "defaultEnabled must be a boolean when provided."
      ),
    };
  }
  return { ok: true, value };
};
