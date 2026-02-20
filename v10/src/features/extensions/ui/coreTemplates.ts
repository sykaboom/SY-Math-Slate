"use client";

import { createElement } from "react";
import { dispatchCommand } from "@core/engine/commandBus";
import { assertRuntimeSurfaceClassOrThrow } from "@core/config/coreModBoundary.guards";
import type { UISlotComponent, UISlotName } from "@core/extensions/registry";
import { getPrimaryRuntimeTemplatePack } from "../../../mod/runtime/templatePackRegistry";
import { Popover, PopoverTrigger } from "@ui/components/popover";
import { useUIStore, type Tool } from "@features/store/useUIStoreBridge";
import { LaserControls } from "@features/toolbar/LaserControls";
import { PenControls } from "@features/toolbar/PenControls";
import { PlaybackControls } from "@features/toolbar/PlaybackControls";
import { ToolButton } from "@features/toolbar/atoms/ToolButton";
import { ToolbarPanel } from "@features/toolbar/atoms/ToolbarPanel";
import { Hand, PenLine, Zap } from "lucide-react";

export type CoreTemplateActivation = "core-toolbar-cutover";

export type CoreTemplateLauncherMetadata = {
  launcherId: string;
  panelId: string;
  title: string;
  description: string;
  icon: string;
};

export type CoreTemplateManifest = {
  manifestVersion: 1;
  pluginId: "core.toolbar.templates";
  templateId: string;
  slot: UISlotName;
  component: UISlotComponent;
  activation: CoreTemplateActivation;
  launcher: CoreTemplateLauncherMetadata;
};

export type CoreTemplateLauncherEntry = CoreTemplateLauncherMetadata & {
  templateId: string;
  slot: UISlotName;
  pluginId: CoreTemplateManifest["pluginId"];
  enabled: boolean;
};

const CORE_TOOLBAR_TEMPLATE_CUTOVER_ENABLED =
  process.env.NEXT_PUBLIC_CORE_TOOLBAR_CUTOVER !== "0";
const CORE_TEMPLATE_BASE_ACTION_INJECTION_ENABLED = false;

const isTemplatePackRuntimeEnabled = (): boolean =>
  getPrimaryRuntimeTemplatePack() !== null;

const dispatchToolbarCommand = (commandId: string, payload: unknown): void => {
  void dispatchCommand(commandId, payload, {
    meta: { source: "toolbar.core-template" },
  }).catch(() => undefined);
};

const CorePanTemplateControl = () => {
  const { activeTool } = useUIStore();
  const handleTool = (tool: Tool) => () => {
    dispatchToolbarCommand("setTool", { tool });
  };

  return createElement(ToolButton, {
    icon: Hand,
    label: "Hand",
    active: activeTool === "hand",
    onClick: handleTool("hand"),
    className: "h-11 w-11 shrink-0",
  });
};

const CorePenTemplateControl = () => {
  const { activeTool, openPanel, togglePanel } = useUIStore();
  const isPenOpen = openPanel === "pen";

  const handlePenClick = () => {
    if (activeTool === "pen") {
      togglePanel("pen");
      return;
    }
    dispatchToolbarCommand("setTool", { tool: "pen" });
  };

  return createElement(
    Popover,
    {
      open: isPenOpen,
      onOpenChange: (open: boolean) => {
        if (!open && isPenOpen) {
          togglePanel("pen");
        }
      },
    },
    createElement(
      PopoverTrigger,
      { asChild: true },
      createElement(ToolButton, {
        icon: PenLine,
        label: "Pen",
        active: activeTool === "pen",
        onClick: handlePenClick,
        className: "h-11 w-11 shrink-0",
      })
    ),
    createElement(
      ToolbarPanel,
      { side: "top", align: "center", sideOffset: 18 },
      createElement(PenControls)
    )
  );
};

const CoreLaserTemplateControl = () => {
  const { activeTool, openPanel, togglePanel } = useUIStore();
  const isLaserOpen = openPanel === "laser";

  const handleLaserClick = () => {
    if (activeTool === "laser") {
      togglePanel("laser");
      return;
    }
    dispatchToolbarCommand("setTool", { tool: "laser" });
  };

  return createElement(
    Popover,
    {
      open: isLaserOpen,
      onOpenChange: (open: boolean) => {
        if (!open && isLaserOpen) {
          togglePanel("laser");
        }
      },
    },
    createElement(
      PopoverTrigger,
      { asChild: true },
      createElement(ToolButton, {
        icon: Zap,
        label: "Laser",
        active: activeTool === "laser",
        onClick: handleLaserClick,
        className: "h-11 w-11 shrink-0",
      })
    ),
    createElement(
      ToolbarPanel,
      { side: "top", align: "center", sideOffset: 18 },
      createElement(LaserControls)
    )
  );
};

const CorePlaybackTemplateControl = () => createElement(PlaybackControls);

const CORE_TEMPLATE_MANIFESTS: readonly CoreTemplateManifest[] = [
  {
    manifestVersion: 1,
    pluginId: "core.toolbar.templates",
    templateId: "core.template.toolbar.pan",
    slot: "toolbar-inline",
    component: CorePanTemplateControl,
    activation: "core-toolbar-cutover",
    launcher: {
      launcherId: "core-launcher-toolbar-pan",
      panelId: "core.template.toolbar.pan",
      title: "Pan Tool",
      description: "Switches pointer mode to panning.",
      icon: "Hand",
    },
  },
  {
    manifestVersion: 1,
    pluginId: "core.toolbar.templates",
    templateId: "core.template.toolbar.pen",
    slot: "toolbar-inline",
    component: CorePenTemplateControl,
    activation: "core-toolbar-cutover",
    launcher: {
      launcherId: "core-launcher-toolbar-pen",
      panelId: "core.template.toolbar.pen",
      title: "Pen Tool",
      description: "Opens pen tool selection and settings.",
      icon: "PenLine",
    },
  },
  {
    manifestVersion: 1,
    pluginId: "core.toolbar.templates",
    templateId: "core.template.toolbar.laser",
    slot: "toolbar-inline",
    component: CoreLaserTemplateControl,
    activation: "core-toolbar-cutover",
    launcher: {
      launcherId: "core-launcher-toolbar-laser",
      panelId: "core.template.toolbar.laser",
      title: "Laser Tool",
      description: "Opens laser pointer controls.",
      icon: "Zap",
    },
  },
  {
    manifestVersion: 1,
    pluginId: "core.toolbar.templates",
    templateId: "core.template.toolbar.playback",
    slot: "toolbar-inline",
    component: CorePlaybackTemplateControl,
    activation: "core-toolbar-cutover",
    launcher: {
      launcherId: "core-launcher-toolbar-playback",
      panelId: "core.template.toolbar.playback",
      title: "Playback Controls",
      description: "Runs play, pause, and step playback controls.",
      icon: "Play",
    },
  },
] as const;

for (const template of CORE_TEMPLATE_MANIFESTS) {
  assertRuntimeSurfaceClassOrThrow(
    `template:${template.templateId}`,
    "mod-managed"
  );
}

const isTemplateActivationEnabled = (activation: CoreTemplateActivation): boolean => {
  if (activation === "core-toolbar-cutover") {
    if (!CORE_TEMPLATE_BASE_ACTION_INJECTION_ENABLED) {
      return false;
    }
    return CORE_TOOLBAR_TEMPLATE_CUTOVER_ENABLED && isTemplatePackRuntimeEnabled();
  }
  return false;
};

export const isCoreTemplateCutoverEnabled = (): boolean =>
  CORE_TOOLBAR_TEMPLATE_CUTOVER_ENABLED;

export const listCoreTemplateManifests = (): readonly CoreTemplateManifest[] =>
  CORE_TEMPLATE_MANIFESTS;

export const listActiveCoreTemplateManifests = (): readonly CoreTemplateManifest[] =>
  CORE_TEMPLATE_MANIFESTS.filter((template) =>
    isTemplateActivationEnabled(template.activation)
  );

export const listCoreTemplateLauncherEntries = (): readonly CoreTemplateLauncherEntry[] =>
  CORE_TEMPLATE_MANIFESTS.map((template) => ({
    ...template.launcher,
    templateId: template.templateId,
    slot: template.slot,
    pluginId: template.pluginId,
    enabled: isTemplateActivationEnabled(template.activation),
  }));
