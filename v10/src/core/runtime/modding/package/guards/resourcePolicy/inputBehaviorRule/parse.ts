import type { ModPackageInputBehaviorRule } from "../../../types";
import type { ModPackageValidationFailure } from "../../types";
import { ensureInputBehaviorRecord } from "./parse/object";
import { validateInputBehaviorStrategy } from "./parse/strategy";
import {
  buildInputBehaviorRule,
  normalizeChain,
  normalizeModId,
} from "./normalize";

export const parseInputBehaviorRule = (
  value: unknown,
  modIdSet: Set<string>
):
  | { ok: true; value: ModPackageInputBehaviorRule }
  | { ok: false; value: ModPackageValidationFailure } => {
  const objectResult = ensureInputBehaviorRecord(value);
  if (!objectResult.ok) return { ok: false, value: objectResult.value };
  const record = objectResult.value;

  const strategyResult = validateInputBehaviorStrategy(record.strategy);
  if (!strategyResult.ok) return { ok: false, value: strategyResult.value };

  const modIdResult = normalizeModId(record.modId, modIdSet);
  if (!modIdResult.ok) return { ok: false, value: modIdResult.value };

  const chainResult = normalizeChain(record.chain, modIdSet);
  if (!chainResult.ok) return { ok: false, value: chainResult.value };
  return { ok: true, value: buildInputBehaviorRule(strategyResult.value, modIdResult.value, chainResult.value) };
};
