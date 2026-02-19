export const CORE_PANEL_POLICY_IDS = {
  PENDING_APPROVAL: "core.pending-approval.panel",
  MODERATION_CONSOLE: "core.moderation-console.panel",
  HOST_LIVE_SESSION: "core.host-live-session.panel",
  DATA_INPUT: "core.data-input.panel",
  PROMPTER: "core.prompter.panel",
  THEME_PICKER: "core.theme-picker.panel",
  FLOATING_TOOLBAR: "core.floating-toolbar.panel",
} as const;

export type CorePanelPolicyId =
  (typeof CORE_PANEL_POLICY_IDS)[keyof typeof CORE_PANEL_POLICY_IDS];

export const CORE_EDIT_ONLY_PANEL_POLICY_IDS: readonly CorePanelPolicyId[] = [
  CORE_PANEL_POLICY_IDS.PENDING_APPROVAL,
  CORE_PANEL_POLICY_IDS.MODERATION_CONSOLE,
  CORE_PANEL_POLICY_IDS.HOST_LIVE_SESSION,
  CORE_PANEL_POLICY_IDS.DATA_INPUT,
  CORE_PANEL_POLICY_IDS.PROMPTER,
  CORE_PANEL_POLICY_IDS.FLOATING_TOOLBAR,
];

export const isCoreEditOnlyPanelPolicyId = (
  panelId: unknown
): panelId is CorePanelPolicyId =>
  typeof panelId === "string" &&
  (CORE_EDIT_ONLY_PANEL_POLICY_IDS as readonly string[]).includes(panelId);

export const CORE_PANEL_POLICY_SOURCE = {
  version: 1,
  panels: {
    [CORE_PANEL_POLICY_IDS.PENDING_APPROVAL]: {
      slot: "toolbar-bottom",
      behavior: {
        displayMode: "docked",
        movable: false,
        defaultPosition: { x: 20, y: 20 },
        rememberPosition: false,
        defaultOpen: false,
        roleOverride: {
          host: { visible: true, defaultOpen: false },
          student: { visible: false, defaultOpen: false },
        },
      },
    },
    [CORE_PANEL_POLICY_IDS.MODERATION_CONSOLE]: {
      slot: "toolbar-bottom",
      behavior: {
        displayMode: "windowed",
        movable: true,
        defaultPosition: { x: 24, y: 24 },
        rememberPosition: true,
        defaultOpen: false,
        roleOverride: {
          host: { visible: true, defaultOpen: false },
          student: { visible: false, defaultOpen: false },
        },
      },
    },
    [CORE_PANEL_POLICY_IDS.HOST_LIVE_SESSION]: {
      slot: "toolbar-bottom",
      behavior: {
        displayMode: "windowed",
        movable: true,
        defaultPosition: { x: 32, y: 56 },
        rememberPosition: true,
        defaultOpen: false,
        roleOverride: {
          host: { visible: true, defaultOpen: false },
          student: { visible: false, defaultOpen: false },
        },
      },
    },
    [CORE_PANEL_POLICY_IDS.DATA_INPUT]: {
      slot: "left-panel",
      behavior: {
        displayMode: "windowed",
        movable: true,
        defaultPosition: { x: 32, y: 72 },
        rememberPosition: true,
        defaultOpen: false,
        roleOverride: {
          host: { visible: true, defaultOpen: false },
          student: { visible: false, defaultOpen: false },
        },
      },
    },
    [CORE_PANEL_POLICY_IDS.PROMPTER]: {
      slot: "toolbar-bottom",
      behavior: {
        displayMode: "docked",
        movable: false,
        defaultPosition: { x: 12, y: 12 },
        rememberPosition: false,
        defaultOpen: false,
        roleOverride: {
          host: { visible: true, defaultOpen: false },
          student: { visible: false, defaultOpen: false },
        },
      },
    },
    [CORE_PANEL_POLICY_IDS.THEME_PICKER]: {
      slot: "toolbar-bottom",
      behavior: {
        displayMode: "windowed",
        movable: true,
        defaultPosition: { x: 40, y: 64 },
        rememberPosition: true,
        defaultOpen: false,
        roleOverride: {
          host: { visible: true, defaultOpen: false },
          student: { visible: false, defaultOpen: false },
        },
      },
    },
    [CORE_PANEL_POLICY_IDS.FLOATING_TOOLBAR]: {
      slot: "toolbar-bottom",
      behavior: {
        displayMode: "windowed",
        movable: true,
        defaultPosition: { x: 40, y: 640 },
        rememberPosition: true,
        defaultOpen: false,
        roleOverride: {
          host: { visible: true, defaultOpen: false },
          student: { visible: false, defaultOpen: false },
        },
      },
    },
  },
} as const;
