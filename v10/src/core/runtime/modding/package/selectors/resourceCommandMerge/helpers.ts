import type { ModPackageCommandRule } from "../../types";

export const normalizeLayerString = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

export const dedupeCommandRulesWithinLayer = (
  rules: readonly ModPackageCommandRule[]
): ModPackageCommandRule[] => {
  const deduped: ModPackageCommandRule[] = [];
  const seen = new Set<string>();
  for (const rule of rules) {
    const commandId = normalizeLayerString(rule.commandId);
    if (commandId.length === 0 || seen.has(commandId)) continue;
    seen.add(commandId);
    deduped.push({
      ...rule,
      commandId,
    });
  }
  return deduped;
};
