import {
  registerUISlotComponent,
  type UISlotComponent,
  type UISlotName,
} from "@core/extensions/registry";
import { listRuntimeTemplatePacks } from "../../../mod/runtime/templatePackRegistry";
import {
  CORE_PANEL_POLICY_IDS,
  CORE_PANEL_POLICY_SOURCE,
  type CorePanelPolicyId,
} from "@core/config/panel-policy";
import { assertRuntimeSurfaceClassOrThrow } from "@core/config/coreModBoundary.guards";
import { ModerationConsolePanel } from "@features/moderation/ModerationConsolePanel";
import { HostLiveSessionPanel } from "@features/sharing/HostLiveSessionPanel";
import { ThemePickerPanel } from "@features/theme/ThemePickerPanel";
import { PendingApprovalPanel } from "@features/toolbar/PendingApprovalPanel";
import {
  validatePanelPolicyDocument,
} from "@features/layout/windowing/panelBehavior.schema";
import {
  PANEL_RUNTIME_ROLES,
  type PanelBehaviorContract,
  type PanelPolicyEntry,
  type PanelRoleOverride,
} from "@features/layout/windowing/panelBehavior.types";
import {
  CoreDataInputPanelSlot,
  CoreFloatingToolbarSlot,
  CorePrompterSlot,
} from "./CoreSlotComponents";

const LAYOUT_SLOT_CUTOVER_ENABLED =
  process.env.NEXT_PUBLIC_LAYOUT_SLOT_CUTOVER !== "0";

const CORE_PANEL_POLICY_VALIDATION = validatePanelPolicyDocument(
  CORE_PANEL_POLICY_SOURCE
);

if (!CORE_PANEL_POLICY_VALIDATION.ok) {
  throw new Error(
    `invalid core panel policy: ${CORE_PANEL_POLICY_VALIDATION.code} at ${CORE_PANEL_POLICY_VALIDATION.path} (${CORE_PANEL_POLICY_VALIDATION.message})`
  );
}

const CORE_PANEL_POLICY = CORE_PANEL_POLICY_VALIDATION.value;

type CoreSlotActivation = "always" | "layout-slot-cutover";
type CoreSlotRuntimeRegistration = "when-activated" | "legacy-fallback";

type CorePanelLauncherBinding = {
  launcherId: string;
  title: string;
  description: string;
  icon: string;
};

type CoreSlotBinding = {
  panelId: CorePanelPolicyId;
  component: UISlotComponent;
  activation: CoreSlotActivation;
  registerInSlotRuntime?: CoreSlotRuntimeRegistration;
  launcher?: CorePanelLauncherBinding;
};

export type CoreSlotPanelContract = {
  panelId: CorePanelPolicyId;
  slot: UISlotName;
  behavior: PanelBehaviorContract;
  activation: CoreSlotActivation;
};

export type CorePanelLauncherContract = {
  panelId: CorePanelPolicyId;
  slot: UISlotName;
  launcherId: string;
  title: string;
  description: string;
  icon: string;
  activation: CoreSlotActivation;
};

const CORE_SLOT_BINDINGS: readonly CoreSlotBinding[] = [
  {
    panelId: CORE_PANEL_POLICY_IDS.PENDING_APPROVAL,
    component: PendingApprovalPanel,
    activation: "layout-slot-cutover",
    registerInSlotRuntime: "legacy-fallback",
    launcher: {
      launcherId: "core-launcher-panel-pending-approval",
      title: "Pending Approval",
      description: "Opens teacher approval queue.",
      icon: "Keyboard",
    },
  },
  {
    panelId: CORE_PANEL_POLICY_IDS.MODERATION_CONSOLE,
    component: ModerationConsolePanel,
    activation: "layout-slot-cutover",
    registerInSlotRuntime: "legacy-fallback",
    launcher: {
      launcherId: "core-launcher-panel-moderation-console",
      title: "Moderation Console",
      description: "Opens trust and safety controls.",
      icon: "Captions",
    },
  },
  {
    panelId: CORE_PANEL_POLICY_IDS.HOST_LIVE_SESSION,
    component: HostLiveSessionPanel,
    activation: "layout-slot-cutover",
    registerInSlotRuntime: "legacy-fallback",
    launcher: {
      launcherId: "core-launcher-panel-host-live-session",
      title: "Host Live Session",
      description: "Opens host live session controls and proposals.",
      icon: "Captions",
    },
  },
  {
    panelId: CORE_PANEL_POLICY_IDS.DATA_INPUT,
    component: CoreDataInputPanelSlot,
    activation: "layout-slot-cutover",
    registerInSlotRuntime: "legacy-fallback",
    launcher: {
      launcherId: "core-launcher-panel-data-input",
      title: "Input Studio",
      description: "Opens the data input authoring panel.",
      icon: "Keyboard",
    },
  },
  {
    panelId: CORE_PANEL_POLICY_IDS.PROMPTER,
    component: CorePrompterSlot,
    activation: "layout-slot-cutover",
    registerInSlotRuntime: "legacy-fallback",
    launcher: {
      launcherId: "core-launcher-panel-prompter",
      title: "Prompter",
      description: "Opens the script and prompting panel.",
      icon: "Captions",
    },
  },
  {
    panelId: CORE_PANEL_POLICY_IDS.THEME_PICKER,
    component: ThemePickerPanel,
    activation: "layout-slot-cutover",
    registerInSlotRuntime: "legacy-fallback",
    launcher: {
      launcherId: "core-launcher-panel-theme-picker",
      title: "Theme",
      description: "Opens the theme preset picker.",
      icon: "Palette",
    },
  },
  {
    panelId: CORE_PANEL_POLICY_IDS.FLOATING_TOOLBAR,
    component: CoreFloatingToolbarSlot,
    activation: "layout-slot-cutover",
    registerInSlotRuntime: "legacy-fallback",
    launcher: {
      launcherId: "core-launcher-panel-floating-toolbar",
      title: "Toolbar Deck",
      description: "Opens floating authoring controls.",
      icon: "SlidersHorizontal",
    },
  },
];

for (const binding of CORE_SLOT_BINDINGS) {
  const expectedClass =
    binding.panelId === CORE_PANEL_POLICY_IDS.FLOATING_TOOLBAR
      ? "core-engine"
      : "mod-managed";
  assertRuntimeSurfaceClassOrThrow(`panel:${binding.panelId}`, expectedClass);
}

assertRuntimeSurfaceClassOrThrow(
  "engine:engine.toolbar.mode-selector-shell",
  "core-engine"
);
assertRuntimeSurfaceClassOrThrow(
  "engine:engine.command.dispatch-shell",
  "core-engine"
);
assertRuntimeSurfaceClassOrThrow(
  "engine:engine.policy.role-gate-bridge",
  "core-engine"
);
assertRuntimeSurfaceClassOrThrow(
  "engine:engine.window-host.mount-bridge",
  "core-engine"
);

const cloneRoleOverride = (
  value: PanelBehaviorContract["roleOverride"]
): PanelBehaviorContract["roleOverride"] => {
  if (value === undefined) return undefined;

  const clone: Partial<Record<(typeof PANEL_RUNTIME_ROLES)[number], PanelRoleOverride>> = {};
  for (const role of PANEL_RUNTIME_ROLES) {
    const roleOverride = value[role];
    if (!roleOverride) continue;
    clone[role] = { ...roleOverride };
  }
  return clone;
};

const clonePanelBehaviorContract = (
  value: PanelBehaviorContract
): PanelBehaviorContract => {
  const clone: PanelBehaviorContract = {
    displayMode: value.displayMode,
    movable: value.movable,
    defaultPosition: {
      x: value.defaultPosition.x,
      y: value.defaultPosition.y,
    },
    rememberPosition: value.rememberPosition,
    defaultOpen: value.defaultOpen,
  };

  const roleOverride = cloneRoleOverride(value.roleOverride);
  if (roleOverride !== undefined) {
    clone.roleOverride = roleOverride;
  }

  return clone;
};

const resolveCorePanelPolicyEntry = (panelId: CorePanelPolicyId): PanelPolicyEntry => {
  const entry = CORE_PANEL_POLICY.panels[panelId];
  if (!entry) {
    throw new Error(`missing core panel policy entry for '${panelId}'.`);
  }
  return entry;
};

const isCoreSlotBindingActivated = (
  binding: CoreSlotBinding,
  layoutSlotCutoverEnabled: boolean
): boolean => {
  if (
    binding.activation === "layout-slot-cutover" &&
    !layoutSlotCutoverEnabled
  ) {
    return false;
  }
  return true;
};

const shouldRegisterCoreSlotBindingInRuntime = (
  binding: CoreSlotBinding,
  layoutSlotCutoverEnabled: boolean
): boolean => {
  if (binding.registerInSlotRuntime === "legacy-fallback") {
    return !layoutSlotCutoverEnabled;
  }
  if (binding.registerInSlotRuntime === "when-activated") {
    return isCoreSlotBindingActivated(binding, layoutSlotCutoverEnabled);
  }
  return isCoreSlotBindingActivated(binding, layoutSlotCutoverEnabled);
};

const isCoreSlotBindingActivatedInCurrentRuntime = (
  binding: CoreSlotBinding
): boolean =>
  isCoreSlotBindingActivated(binding, LAYOUT_SLOT_CUTOVER_ENABLED);

export const listCoreSlotPanelContract = (): readonly CoreSlotPanelContract[] =>
  CORE_SLOT_BINDINGS.map((binding) => {
    const entry = resolveCorePanelPolicyEntry(binding.panelId);
    return {
      panelId: binding.panelId,
      slot: entry.slot,
      behavior: clonePanelBehaviorContract(entry.behavior),
      activation: binding.activation,
    };
  });

export const getCoreSlotPanelContract = (
  panelId: CorePanelPolicyId
): CoreSlotPanelContract | null => {
  const binding = CORE_SLOT_BINDINGS.find((entry) => entry.panelId === panelId);
  if (!binding) return null;

  const entry = resolveCorePanelPolicyEntry(panelId);
  return {
    panelId,
    slot: entry.slot,
    behavior: clonePanelBehaviorContract(entry.behavior),
    activation: binding.activation,
  };
};

const hasLauncherBinding = (
  binding: CoreSlotBinding
): binding is CoreSlotBinding & { launcher: CorePanelLauncherBinding } =>
  binding.launcher !== undefined;

export const listCorePanelLauncherContract = (): readonly CorePanelLauncherContract[] =>
  CORE_SLOT_BINDINGS.filter(hasLauncherBinding)
    .filter(isCoreSlotBindingActivatedInCurrentRuntime)
    .map((binding) => {
      const entry = resolveCorePanelPolicyEntry(binding.panelId);
      return {
        panelId: binding.panelId,
        slot: entry.slot,
        launcherId: binding.launcher.launcherId,
        title: binding.launcher.title,
        description: binding.launcher.description,
        icon: binding.launcher.icon,
        activation: binding.activation,
      };
    });

export const getCorePanelLauncherContract = (
  panelId: CorePanelPolicyId
): CorePanelLauncherContract | null => {
  const binding = CORE_SLOT_BINDINGS.find((entry) => entry.panelId === panelId);
  if (!binding) return null;
  if (!hasLauncherBinding(binding)) return null;
  if (!isCoreSlotBindingActivatedInCurrentRuntime(binding)) return null;

  const entry = resolveCorePanelPolicyEntry(panelId);
  return {
    panelId,
    slot: entry.slot,
    launcherId: binding.launcher.launcherId,
    title: binding.launcher.title,
    description: binding.launcher.description,
    icon: binding.launcher.icon,
    activation: binding.activation,
  };
};

export const isCorePanelRegisteredInSlotRuntime = (
  panelId: CorePanelPolicyId,
  layoutSlotCutoverEnabled = LAYOUT_SLOT_CUTOVER_ENABLED
): boolean => {
  const binding = CORE_SLOT_BINDINGS.find((entry) => entry.panelId === panelId);
  if (!binding) return false;
  return shouldRegisterCoreSlotBindingInRuntime(
    binding,
    layoutSlotCutoverEnabled
  );
};

let hasRegisteredCoreSlots = false;

export const registerCoreSlots = (): void => {
  if (hasRegisteredCoreSlots) return;

  for (const binding of CORE_SLOT_BINDINGS) {
    const shouldRegisterInSlotRuntime = shouldRegisterCoreSlotBindingInRuntime(
      binding,
      LAYOUT_SLOT_CUTOVER_ENABLED
    );
    if (!shouldRegisterInSlotRuntime) {
      continue;
    }

    const entry = resolveCorePanelPolicyEntry(binding.panelId);
    registerUISlotComponent(entry.slot, binding.component);
  }

  for (const pack of listRuntimeTemplatePacks()) {
    for (const slotComponent of pack.slotComponents ?? []) {
      registerUISlotComponent(slotComponent.slot, slotComponent.component);
    }
  }

  hasRegisteredCoreSlots = true;
};
