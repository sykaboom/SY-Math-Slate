"use client";

import type { ReactNode } from "react";

import { CORE_PANEL_POLICY_IDS, type CorePanelPolicyId } from "@core/config/panel-policy";
import { resolveExecutionRole } from "@core/config/rolePolicy";
import {
  getCoreSlotPanelContract,
  type CoreSlotPanelContract,
} from "@features/extensions/ui/registerCoreSlots";
import { DataInputPanel } from "@features/layout/DataInputPanel";
import { Prompter } from "@features/layout/Prompter";
import { ModerationConsolePanel } from "@features/moderation/ModerationConsolePanel";
import { HostLiveSessionPanel } from "@features/sharing/HostLiveSessionPanel";
import { ThemePickerPanel } from "@features/theme/ThemePickerPanel";
import { FloatingToolbar } from "@features/toolbar/FloatingToolbar";
import { PendingApprovalPanel } from "@features/toolbar/PendingApprovalPanel";
import { listResolvedModPanelContributions } from "@features/ui-host/modContributionBridge";
import type {
  PanelBehaviorContract,
  PanelRoleOverride,
  PanelRuntimeRole,
} from "./panelBehavior.types";
import type {
  WindowHostPanelModule,
  WindowHostPanelRenderContext,
} from "./WindowHost";

const PANEL_HOST_ACTION_BUTTON_CLASS =
  "inline-flex h-9 items-center rounded-md border border-theme-border/15 bg-theme-surface/35 px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-theme-text/70 transition hover:border-theme-border/30 hover:text-theme-text";
const HOST_LIVE_SESSION_ACTION_BUTTON_CLASS =
  "inline-flex h-9 items-center rounded-md border border-theme-border/15 bg-theme-surface/35 px-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-theme-text/70 transition hover:border-theme-border/30 hover:text-theme-text";

const clamp = (value: number, min: number, max: number): number => {
  if (value <= min) return min;
  if (value >= max) return max;
  return value;
};

const normalizeViewportSize = (value: {
  width: number;
  height: number;
}): {
  width: number;
  height: number;
} => ({
  width: Math.max(320, Math.trunc(Number.isFinite(value.width) ? value.width : 320)),
  height: Math.max(240, Math.trunc(Number.isFinite(value.height) ? value.height : 240)),
});

const resolvePanelBehaviorForRole = (
  behavior: PanelBehaviorContract,
  role: PanelRuntimeRole
): { behavior: PanelBehaviorContract; visible: boolean } => {
  const roleOverride: PanelRoleOverride | undefined = behavior.roleOverride?.[role];

  const nextBehavior: PanelBehaviorContract = {
    ...behavior,
    displayMode: roleOverride?.displayMode ?? behavior.displayMode,
    movable: roleOverride?.movable ?? behavior.movable,
    defaultPosition: {
      x: behavior.defaultPosition.x,
      y: behavior.defaultPosition.y,
    },
    rememberPosition: behavior.rememberPosition,
    defaultOpen: roleOverride?.defaultOpen ?? behavior.defaultOpen,
  };

  if (behavior.roleOverride !== undefined) {
    nextBehavior.roleOverride = behavior.roleOverride;
  }

  return {
    behavior: nextBehavior,
    visible: roleOverride?.visible ?? true,
  };
};

type ResolvedCorePanelContract = CoreSlotPanelContract & {
  behavior: PanelBehaviorContract;
  visible: boolean;
};

const resolveCorePanelContract = (
  panelId: CorePanelPolicyId,
  role: PanelRuntimeRole,
  layoutSlotCutoverEnabled: boolean
): ResolvedCorePanelContract | null => {
  const contract = getCoreSlotPanelContract(panelId);
  if (!contract) return null;

  if (
    contract.activation === "layout-slot-cutover" &&
    !layoutSlotCutoverEnabled
  ) {
    return null;
  }

  const resolved = resolvePanelBehaviorForRole(contract.behavior, role);
  return {
    ...contract,
    behavior: resolved.behavior,
    visible: resolved.visible,
  };
};

const resolveDataInputSize = (viewportSize: { width: number; height: number }) => ({
  width: clamp(Math.round(viewportSize.width * 0.38), 320, 640),
  height: clamp(Math.round(viewportSize.height * 0.74), 320, 800),
});

const resolveToolbarSize = (viewportSize: { width: number; height: number }) => ({
  width: clamp(Math.round(viewportSize.width - 32), 320, 1120),
  height: clamp(Math.round(viewportSize.height * 0.2), 112, 180),
});

const resolvePrompterSize = (viewportSize: { width: number; height: number }) => ({
  width: clamp(Math.round(viewportSize.width * 0.62), 320, 920),
  height: 92,
});

const resolvePendingApprovalSize = (viewportSize: { width: number; height: number }) => ({
  width: clamp(Math.round(viewportSize.width * 0.36), 320, 420),
  height: clamp(Math.round(viewportSize.height * 0.42), 220, 480),
});

const resolveModerationConsoleSize = (viewportSize: { width: number; height: number }) => ({
  width: clamp(Math.round(viewportSize.width * 0.42), 320, 520),
  height: clamp(Math.round(viewportSize.height * 0.78), 320, 820),
});

const resolveHostLiveSessionSize = (viewportSize: { width: number; height: number }) => ({
  width: clamp(420, 360, clamp(viewportSize.width, 360, 560)),
  height: clamp(520, 320, clamp(viewportSize.height, 320, 820)),
});
const resolveModPanelSize = (viewportSize: { width: number; height: number }) => ({
  width: clamp(Math.round(viewportSize.width * 0.34), 300, 460),
  height: clamp(Math.round(viewportSize.height * 0.36), 220, 420),
});

type WindowPanelShellProps = {
  title: string;
  context: WindowHostPanelRenderContext;
  onRequestClose?: () => void;
  actionButtonClassName?: string;
  allowOverflow?: boolean;
  children: ReactNode;
};

const WindowPanelShell = ({
  title,
  context,
  onRequestClose,
  actionButtonClassName,
  allowOverflow = false,
  children,
}: WindowPanelShellProps) => {
  const resolvedActionButtonClassName =
    actionButtonClassName ?? PANEL_HOST_ACTION_BUTTON_CLASS;

  return (
    <section
      className={`flex h-full w-full min-h-0 flex-col rounded-2xl border border-theme-border/15 bg-theme-surface/45 shadow-[0_18px_48px_rgba(0,0,0,0.5)] ${
        allowOverflow ? "overflow-visible" : "overflow-hidden"
      }`}
    >
      <header className="flex items-center gap-2 border-b border-theme-border/10 bg-theme-surface/35 px-3 py-2">
        <div
          data-window-host-drag-handle="true"
          className="min-w-0 flex-1 cursor-move select-none touch-none text-[10px] font-semibold uppercase tracking-[0.16em] text-theme-text/65"
        >
          {title}
        </div>
        <button
          type="button"
          className={resolvedActionButtonClassName}
          onClick={context.reset}
        >
          Reset
        </button>
        {onRequestClose ? (
          <button
            type="button"
            className={resolvedActionButtonClassName}
            onClick={onRequestClose}
          >
            Close
          </button>
        ) : null}
      </header>
      <div className={`min-h-0 flex-1 ${allowOverflow ? "overflow-visible" : ""}`}>
        {children}
      </div>
    </section>
  );
};

export type CoreWindowHostPanelAdapterOptions = {
  role: unknown;
  layoutSlotCutoverEnabled: boolean;
  showDataInputPanel: boolean;
  showThemePicker: boolean;
  showHostToolchips: boolean;
  isDataInputOpen: boolean;
  closeDataInput: () => void;
  isPendingApprovalOpen: boolean;
  closePendingApproval: () => void;
  isModerationConsoleOpen: boolean;
  closeModerationConsole: () => void;
  isHostLiveSessionOpen: boolean;
  closeHostLiveSession: () => void;
  closeThemePicker: () => void;
  viewportSize: {
    width: number;
    height: number;
  };
};

export const buildCoreWindowHostPanelAdapters = (
  options: CoreWindowHostPanelAdapterOptions
): WindowHostPanelModule[] => {
  const runtimeRole = resolveExecutionRole(options.role);
  const viewportSize = normalizeViewportSize(options.viewportSize);
  const modules: WindowHostPanelModule[] = [];

  const dataInputContract = resolveCorePanelContract(
    CORE_PANEL_POLICY_IDS.DATA_INPUT,
    runtimeRole,
    options.layoutSlotCutoverEnabled
  );
  if (dataInputContract && dataInputContract.visible && options.showDataInputPanel) {
    modules.push({
      panelId: dataInputContract.panelId,
      slot: dataInputContract.slot,
      behavior: dataInputContract.behavior,
      size: resolveDataInputSize(viewportSize),
      isOpen: options.isDataInputOpen,
      className: "pointer-events-auto",
      render: (context) => (
        <WindowPanelShell
          title="Input Studio"
          context={context}
          onRequestClose={options.closeDataInput}
        >
          <DataInputPanel mountMode="window-host" className="bg-transparent" />
        </WindowPanelShell>
      ),
    });
  }

  const pendingApprovalContract = resolveCorePanelContract(
    CORE_PANEL_POLICY_IDS.PENDING_APPROVAL,
    runtimeRole,
    options.layoutSlotCutoverEnabled
  );
  if (
    pendingApprovalContract &&
    pendingApprovalContract.visible &&
    options.showHostToolchips
  ) {
    modules.push({
      panelId: pendingApprovalContract.panelId,
      slot: pendingApprovalContract.slot,
      behavior: pendingApprovalContract.behavior,
      size: resolvePendingApprovalSize(viewportSize),
      isOpen: options.isPendingApprovalOpen,
      className: "pointer-events-auto w-full max-w-[min(460px,96vw)]",
      render: (context) => (
        <WindowPanelShell
          title="Pending Approval"
          context={context}
          onRequestClose={options.closePendingApproval}
        >
          <div className="h-full w-full overflow-y-auto p-2">
            <PendingApprovalPanel />
          </div>
        </WindowPanelShell>
      ),
    });
  }

  const moderationConsoleContract = resolveCorePanelContract(
    CORE_PANEL_POLICY_IDS.MODERATION_CONSOLE,
    runtimeRole,
    options.layoutSlotCutoverEnabled
  );
  if (
    moderationConsoleContract &&
    moderationConsoleContract.visible &&
    options.showHostToolchips
  ) {
    modules.push({
      panelId: moderationConsoleContract.panelId,
      slot: moderationConsoleContract.slot,
      behavior: moderationConsoleContract.behavior,
      size: resolveModerationConsoleSize(viewportSize),
      isOpen: options.isModerationConsoleOpen,
      className: "pointer-events-auto w-full max-w-[min(560px,96vw)]",
      render: (context) => (
        <WindowPanelShell
          title="Moderation Console"
          context={context}
          onRequestClose={options.closeModerationConsole}
        >
          <div className="h-full w-full overflow-y-auto p-2">
            <ModerationConsolePanel />
          </div>
        </WindowPanelShell>
      ),
    });
  }

  const hostLiveSessionContract = resolveCorePanelContract(
    CORE_PANEL_POLICY_IDS.HOST_LIVE_SESSION,
    runtimeRole,
    options.layoutSlotCutoverEnabled
  );
  if (
    hostLiveSessionContract &&
    hostLiveSessionContract.visible &&
    options.showHostToolchips
  ) {
    modules.push({
      panelId: hostLiveSessionContract.panelId,
      slot: hostLiveSessionContract.slot,
      behavior: hostLiveSessionContract.behavior,
      size: resolveHostLiveSessionSize(viewportSize),
      isOpen: options.isHostLiveSessionOpen,
      className: "pointer-events-auto w-full max-w-[min(560px,96vw)]",
      render: (context) => (
        <WindowPanelShell
          title="Host Live Session"
          context={context}
          onRequestClose={options.closeHostLiveSession}
          actionButtonClassName={HOST_LIVE_SESSION_ACTION_BUTTON_CLASS}
        >
          <HostLiveSessionPanel />
        </WindowPanelShell>
      ),
    });
  }

  const themePickerContract = resolveCorePanelContract(
    CORE_PANEL_POLICY_IDS.THEME_PICKER,
    runtimeRole,
    options.layoutSlotCutoverEnabled
  );
  if (themePickerContract && themePickerContract.visible && options.showThemePicker) {
    modules.push({
      panelId: themePickerContract.panelId,
      slot: themePickerContract.slot,
      behavior: themePickerContract.behavior,
      size: { width: 280, height: 210 },
      className: "pointer-events-auto",
      render: (context) => (
        <WindowPanelShell
          title="Theme"
          context={context}
          onRequestClose={options.closeThemePicker}
        >
          <ThemePickerPanel />
        </WindowPanelShell>
      ),
    });
  }

  const floatingToolbarContract = resolveCorePanelContract(
    CORE_PANEL_POLICY_IDS.FLOATING_TOOLBAR,
    runtimeRole,
    options.layoutSlotCutoverEnabled
  );
  if (
    floatingToolbarContract &&
    floatingToolbarContract.visible &&
    options.showHostToolchips
  ) {
    modules.push({
      panelId: floatingToolbarContract.panelId,
      slot: floatingToolbarContract.slot,
      behavior: floatingToolbarContract.behavior,
      size: resolveToolbarSize(viewportSize),
      isOpen: floatingToolbarContract.behavior.defaultOpen,
      className: "pointer-events-auto",
      render: (context) => (
        <WindowPanelShell title="Floating Toolbar" context={context} allowOverflow>
          <div
            data-layout-id="region_toolchips"
            className="h-full w-full overflow-visible px-3 pb-3 pt-2"
          >
            <FloatingToolbar mountMode="window-host" />
          </div>
        </WindowPanelShell>
      ),
    });
  }

  const prompterContract = resolveCorePanelContract(
    CORE_PANEL_POLICY_IDS.PROMPTER,
    runtimeRole,
    options.layoutSlotCutoverEnabled
  );
  if (prompterContract && prompterContract.visible && options.showHostToolchips) {
    modules.push({
      panelId: prompterContract.panelId,
      slot: prompterContract.slot,
      behavior: prompterContract.behavior,
      size: resolvePrompterSize(viewportSize),
      isOpen: prompterContract.behavior.defaultOpen,
      className: "pointer-events-auto w-full max-w-[min(960px,96vw)]",
      render: () => (
        <div data-layout-id="region_prompter" className="w-full">
          <Prompter />
        </div>
      ),
    });
  }

  const modPanelContributions = listResolvedModPanelContributions({
    role: runtimeRole,
  });
  for (const contribution of modPanelContributions) {
    const panelId = `mod-panel:${contribution.id}`;
    if (modules.some((module) => module.panelId === panelId)) continue;
    modules.push({
      panelId,
      slot: contribution.slot,
      behavior: {
        displayMode: "windowed",
        movable: true,
        defaultPosition: { x: 24, y: 24 },
        rememberPosition: true,
        defaultOpen: contribution.defaultOpen ?? false,
      },
      size: resolveModPanelSize(viewportSize),
      className: "pointer-events-auto",
      render: (context) => (
        <WindowPanelShell
          title={contribution.title}
          context={context}
          onRequestClose={() => context.setOpen(false)}
        >
          <div className="h-full w-full overflow-y-auto p-3 text-xs text-theme-text/70">
            <div className="rounded border border-theme-border/10 bg-theme-surface-soft p-2">
              This panel is contributed by the active mod runtime.
            </div>
          </div>
        </WindowPanelShell>
      ),
    });
  }

  return modules;
};
