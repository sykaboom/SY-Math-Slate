"use client";

import { useSyncExternalStore } from "react";

import { dispatchCommand } from "@core/engine/commandBus";
import {
  getUISlotRegistryVersion,
  listUISlotComponents,
  subscribeUISlotRegistry,
  type UISlotName,
} from "@core/extensions/registry";
import {
  getDeclarativePluginManifestVersion,
  listDeclarativeSlotContributions,
  subscribeDeclarativePluginManifests,
  type DeclarativeSlotContribution,
} from "@core/extensions/pluginLoader";
import ErrorBoundary from "@ui/components/ErrorBoundary";
import { Button } from "@ui/components/button";

type ExtensionSlotProps = {
  name?: UISlotName;
  slot?: UISlotName;
  className?: string;
};

type DeclarativeEntryRendererProps = {
  slotName: UISlotName;
  entry: DeclarativeSlotContribution;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export function ExtensionSlot(props: ExtensionSlotProps) {
  const slotName = props.name ?? props.slot;
  const className = props.className;

  useSyncExternalStore(
    subscribeUISlotRegistry,
    getUISlotRegistryVersion,
    getUISlotRegistryVersion
  );
  useSyncExternalStore(
    subscribeDeclarativePluginManifests,
    getDeclarativePluginManifestVersion,
    getDeclarativePluginManifestVersion
  );
  const components = slotName ? listUISlotComponents(slotName) : [];
  const declarativeEntries = slotName
    ? listDeclarativeSlotContributions(slotName)
    : [];

  if (!slotName) return null;
  if (components.length === 0 && declarativeEntries.length === 0) return null;

  const renderedComponents = components.map((SlotComponent, index) => (
    <ErrorBoundary
      key={`component-${slotName}-${index}`}
      fallback={
        <section
          role="alert"
          className="rounded border border-[var(--theme-border-strong)] bg-[var(--theme-danger-soft)] px-2 py-1 text-xs text-[var(--theme-text)]"
        >
          Extension component failed to render.
        </section>
      }
    >
      <SlotComponent />
    </ErrorBoundary>
  ));
  const renderedDeclarative = declarativeEntries.map((entry) => (
    <ErrorBoundary
      key={`declarative-${entry.contributionId}`}
      fallback={
        <section
          role="alert"
          className="rounded border border-[var(--theme-border-strong)] bg-[var(--theme-danger-soft)] px-2 py-1 text-xs text-[var(--theme-text)]"
        >
          Extension contribution failed to render.
        </section>
      }
    >
      <DeclarativeEntryRenderer slotName={slotName} entry={entry} />
    </ErrorBoundary>
  ));
  const rendered = [...renderedComponents, ...renderedDeclarative];

  if (!className) return <>{rendered}</>;
  return <div className={className}>{rendered}</div>;
}

const renderDeclarativeEntry = (
  slotName: UISlotName,
  entry: DeclarativeSlotContribution
) => {
  const label = entry.props?.label ?? entry.id;
  const icon = entry.props?.icon;
  const disabled = entry.props?.disabled ?? false;

  if (entry.type === "button") {
    const handleClick = () => {
      if (!entry.action) return;
      if (disabled) return;
      const context = isRecord(entry.action.context) ? entry.action.context : {};
      void dispatchCommand(entry.action.commandId, entry.action.payload, {
        meta: {
          ...context,
          source: "extension-slot",
          slot: slotName,
          pluginId: entry.pluginId,
          contributionId: entry.contributionId,
        },
      });
    };

    return (
      <Button
        key={entry.contributionId}
        type="button"
        size="sm"
        variant="outline"
        className="h-7 px-2 text-[11px]"
        disabled={disabled}
        onClick={handleClick}
      >
        {icon ? <span aria-hidden>{icon}</span> : null}
        <span>{label}</span>
      </Button>
    );
  }

  return (
    <section
      key={entry.contributionId}
      className="rounded border border-[var(--theme-border-strong)] bg-[var(--theme-surface)] px-2 py-1 text-xs text-[var(--theme-text)]"
    >
      {icon ? <span className="mr-1" aria-hidden>{icon}</span> : null}
      <span>{label}</span>
    </section>
  );
};

const DeclarativeEntryRenderer = ({
  slotName,
  entry,
}: DeclarativeEntryRendererProps) => renderDeclarativeEntry(slotName, entry);
