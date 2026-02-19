import type { ModuleDraft } from "@features/mod-studio/core/types";

export type ModuleDiagnostic = {
  level: "error" | "warning";
  code: string;
  message: string;
};

export const getModuleDiagnostics = (
  modules: ModuleDraft[],
  knownCommandIds?: Set<string>
): ModuleDiagnostic[] => {
  const diagnostics: ModuleDiagnostic[] = [];
  const enabled = modules.filter((module) => module.enabled);
  const idSeen = new Set<string>();
  const orderSeen = new Set<number>();

  enabled.forEach((module) => {
    if (knownCommandIds) {
      const commandId = module.action.commandId.trim();
      if (commandId.length === 0) {
        diagnostics.push({
          level: "error",
          code: "empty-command-id",
          message: "commandId is empty.",
        });
      } else if (knownCommandIds.size === 0) {
        diagnostics.push({
          level: "warning",
          code: "command-catalog-empty",
          message: "command catalog is empty. commandId cannot be validated.",
        });
      } else if (!knownCommandIds.has(commandId)) {
        diagnostics.push({
          level: "error",
          code: "unknown-command-id",
          message: `commandId '${commandId}' is not registered in command bus.`,
        });
      }
    }

    const trimmedId = module.id.trim();
    if (trimmedId.length === 0) {
      diagnostics.push({
        level: "error",
        code: "empty-id",
        message: "enabled module has an empty id.",
      });
      return;
    }
    if (idSeen.has(trimmedId)) {
      diagnostics.push({
        level: "error",
        code: "duplicate-id",
        message: `duplicate enabled module id: '${trimmedId}'.`,
      });
    }
    idSeen.add(trimmedId);

    if (orderSeen.has(module.order)) {
      diagnostics.push({
        level: "warning",
        code: "duplicate-order",
        message: `duplicate order value detected: ${module.order}.`,
      });
    }
    orderSeen.add(module.order);
  });

  return diagnostics;
};
