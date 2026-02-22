import { fail } from "../../../utils";
import { validateActivation } from "./activation/validate";

export type ParsedActivation = {
  activation: Record<string, unknown>;
  defaultModId: string;
};

export const parseActivation = (
  value: unknown,
  modIdSet: Set<string>
): { ok: true; value: ParsedActivation } | { ok: false; value: ReturnType<typeof fail> } => {
  const validated = validateActivation(value, modIdSet);
  if (!validated.ok) return { ok: false, value: validated.value };

  return {
    ok: true,
    value: {
      activation: validated.value.activation,
      defaultModId: validated.value.defaultModId,
    },
  };
};
