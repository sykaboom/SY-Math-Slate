"use client";

import { useMemo } from "react";

import { listAppCommands } from "@core/runtime/command/commandBus";
import { listKnownUISlotNames } from "@core/runtime/plugin-runtime/registry";
import { getRuntimeModManager, getRuntimeModRegistry } from "@core/runtime/modding/host";
import { listRuntimeModPackages } from "@core/runtime/modding/package";
import {
  getModuleDiagnostics,
  getRuntimeModDiagnostics,
} from "@features/platform/mod-studio/modules/moduleDiagnostics";
import { ModuleStudioAuthorPanel } from "@features/platform/mod-studio/modules/ModuleStudioAuthorPanel";
import { ModuleStudioManagerPanel } from "@features/platform/mod-studio/modules/ModuleStudioManagerPanel";
import { useModStore } from "@features/platform/store/useModStore";
import {
  useModStudioStore,
  type ModStudioModuleWorkspace,
} from "@features/platform/store/useModStudioStore";
import { resolveToolbarModeFromActiveModId } from "@features/chrome/toolbar/toolbarModePolicy";
import { listToolbarActionIdsByMode } from "@features/chrome/toolbar/catalog/toolbarActionCatalog";
import { listResolvedModToolbarContributions } from "@features/chrome/ui-host/modContributionBridge";

const MODULE_WORKSPACE_LABELS: Record<ModStudioModuleWorkspace, string> = {
  author: "Author",
  manager: "Manager",
};

const MODULE_WORKSPACE_HINTS: Record<ModStudioModuleWorkspace, string> = {
  author: "Create and edit module drafts.",
  manager: "Apply runtime enable/order controls and inspect conflicts.",
};

export function ModuleStudioSection() {
  const modules = useModStudioStore((state) => state.draft.modules);
  const template = useModStudioStore((state) => state.draft.template);
  const moduleWorkspace = useModStudioStore((state) => state.moduleWorkspace);
  const setModuleWorkspace = useModStudioStore((state) => state.setModuleWorkspace);
  const upsertModuleDraft = useModStudioStore((state) => state.upsertModuleDraft);
  const removeModuleDraft = useModStudioStore((state) => state.removeModuleDraft);
  const setModuleEnabled = useModStudioStore((state) => state.setModuleEnabled);
  const setModuleOrder = useModStudioStore((state) => state.setModuleOrder);
  const moveModuleOrder = useModStudioStore((state) => state.moveModuleOrder);

  const activePackageId = useModStore((state) => state.activePackageId);
  const activeModId = useModStore((state) => state.activeModId);
  const setActivePackageContext = useModStore(
    (state) => state.setActivePackageContext
  );
  const setActiveModId = useModStore((state) => state.setActiveModId);

  const knownCommands = listAppCommands();
  const knownCommandIds = useMemo(
    () => new Set(knownCommands.map((command) => command.id)),
    [knownCommands]
  );
  const moduleDiagnostics = useMemo(
    () => getModuleDiagnostics(modules, knownCommandIds),
    [modules, knownCommandIds]
  );

  const runtimeSnapshot = useMemo(() => {
    const runtimeRegistry = getRuntimeModRegistry();
    const runtimeManager = getRuntimeModManager();
    const runtimePackages = listRuntimeModPackages();
    const registeredMods = runtimeRegistry.list();
    const toolbarMode = resolveToolbarModeFromActiveModId(activeModId, {
      activePackageId,
      packageDefinitions: runtimePackages,
    });
    const reservedActionIds = new Set(listToolbarActionIdsByMode(toolbarMode));
    const rawToolbarContributions = runtimeManager.listToolbarContributions();
    const resolvedToolbarContributions = listResolvedModToolbarContributions({
      mountMode: "window-host",
      role: "host",
      reservedActionIds,
      activePackageId,
    });

    return {
      runtimePackages,
      runtimeModDiagnostics: getRuntimeModDiagnostics({
        activeModId,
        activePackageId,
        registeredPackages: runtimePackages,
        toolbarMode,
        registeredMods,
        rawToolbarContributions,
        resolvedToolbarContributions,
      }),
    };
  }, [activeModId, activePackageId]);

  const knownSlots = listKnownUISlotNames();

  return (
    <div className="grid gap-3 text-xs text-theme-text/85">
      <div className="text-[11px] uppercase tracking-[0.18em] text-theme-text/60">
        Module Manager
      </div>

      <div className="rounded border border-theme-border/10 bg-theme-surface-soft px-2 py-1 text-[11px] text-theme-text/70">
        Template: <span className="font-semibold text-theme-text/85">{template.packId}</span>
      </div>

      <section className="grid gap-2 rounded border border-theme-border/10 bg-theme-surface-soft p-2">
        <div className="flex flex-wrap items-center gap-2">
          {(Object.keys(MODULE_WORKSPACE_LABELS) as ModStudioModuleWorkspace[]).map(
            (workspace) => {
              const active = workspace === moduleWorkspace;
              return (
                <button
                  key={workspace}
                  type="button"
                  onClick={() => setModuleWorkspace(workspace)}
                  className={
                    active
                      ? "rounded border border-theme-border/25 bg-theme-surface/20 px-2 py-1 text-[11px] text-theme-text"
                      : "rounded border border-theme-border/20 px-2 py-1 text-[11px] text-theme-text/70 hover:bg-theme-surface/20"
                  }
                >
                  {MODULE_WORKSPACE_LABELS[workspace]}
                </button>
              );
            }
          )}
        </div>
        <div className="text-[11px] text-theme-text/65">
          {MODULE_WORKSPACE_HINTS[moduleWorkspace]}
        </div>
      </section>

      {moduleWorkspace === "author" ? (
        <ModuleStudioAuthorPanel
          modules={modules}
          moduleDiagnostics={moduleDiagnostics}
          knownSlots={knownSlots}
          knownCommands={knownCommands}
          onUpsertModuleDraft={upsertModuleDraft}
          onRemoveModuleDraft={removeModuleDraft}
        />
      ) : (
        <ModuleStudioManagerPanel
          modules={modules}
          moduleDiagnostics={moduleDiagnostics}
          runtimeModDiagnostics={runtimeSnapshot.runtimeModDiagnostics}
          activePackageId={activePackageId}
          activeModId={activeModId}
          runtimePackages={runtimeSnapshot.runtimePackages}
          onSetActivePackageContext={setActivePackageContext}
          onSetActiveModId={setActiveModId}
          onSetModuleEnabled={setModuleEnabled}
          onSetModuleOrder={setModuleOrder}
          onMoveModuleOrder={moveModuleOrder}
        />
      )}
    </div>
  );
}
