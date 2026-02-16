import {
  registerUISlotComponent,
  type UISlotComponent,
  type UISlotName,
} from "@core/extensions/registry";
import {
  CORE_PANEL_POLICY_IDS,
  CORE_PANEL_POLICY_SOURCE,
  type CorePanelPolicyId,
} from "@core/config/panel-policy";
import { ModerationConsolePanel } from "@features/moderation/ModerationConsolePanel";
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
import { listActiveCoreTemplateManifests } from "./coreTemplates";

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
  registerInSlotRuntime?: boolean;
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
    activation: "always",
    registerInSlotRuntime: true,
  },
  {
    panelId: CORE_PANEL_POLICY_IDS.MODERATION_CONSOLE,
    component: ModerationConsolePanel,
    activation: "always",
    registerInSlotRuntime: true,
  },
  {
    panelId: CORE_PANEL_POLICY_IDS.DATA_INPUT,
    component: CoreDataInputPanelSlot,
    activation: "layout-slot-cutover",
    registerInSlotRuntime: !LAYOUT_SLOT_CUTOVER_ENABLED,
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
    registerInSlotRuntime: !LAYOUT_SLOT_CUTOVER_ENABLED,
    launcher: {
      launcherId: "core-launcher-panel-prompter",
      title: "Prompter",
      description: "Opens the script and prompting panel.",
      icon: "Captions",
    },
  },
  {
    panelId: CORE_PANEL_POLICY_IDS.FLOATING_TOOLBAR,
    component: CoreFloatingToolbarSlot,
    activation: "layout-slot-cutover",
    registerInSlotRuntime: !LAYOUT_SLOT_CUTOVER_ENABLED,
    launcher: {
      launcherId: "core-launcher-panel-floating-toolbar",
      title: "Toolbar Deck",
      description: "Opens floating authoring controls.",
      icon: "SlidersHorizontal",
    },
  },
];

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

const isCoreSlotBindingActivated = (binding: CoreSlotBinding): boolean => {
  if (
    binding.activation === "layout-slot-cutover" &&
    !LAYOUT_SLOT_CUTOVER_ENABLED
  ) {
    return false;
  }
  return true;
};

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
    .filter(isCoreSlotBindingActivated)
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
  if (!isCoreSlotBindingActivated(binding)) return null;

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

let hasRegisteredCoreSlots = false;

export const registerCoreSlots = (): void => {
  if (hasRegisteredCoreSlots) return;

  for (const binding of CORE_SLOT_BINDINGS) {
    const shouldRegisterInSlotRuntime =
      binding.registerInSlotRuntime ?? isCoreSlotBindingActivated(binding);
    if (!shouldRegisterInSlotRuntime) {
      continue;
    }

    const entry = resolveCorePanelPolicyEntry(binding.panelId);
    registerUISlotComponent(entry.slot, binding.component);
  }

  for (const template of listActiveCoreTemplateManifests()) {
    registerUISlotComponent(template.slot, template.component);
  }

  hasRegisteredCoreSlots = true;
};
