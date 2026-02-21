"use client";

import { useLocalStore } from "@features/platform/store/useLocalStore";
import { useModStudioStore } from "@features/platform/store/useModStudioStore";

import { ModStudioPanel } from "./ModStudioPanel";

export function ModStudioShell() {
  const role = useLocalStore((state) => state.role);
  const isOpen = useModStudioStore((state) => state.isOpen);
  const toggle = useModStudioStore((state) => state.toggle);

  if (role !== "host") return null;

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        className={
          isOpen
            ? "rounded border border-theme-border/30 bg-theme-surface/20 px-3 py-1.5 text-xs text-theme-text"
            : "rounded border border-theme-border/20 bg-theme-surface-soft px-3 py-1.5 text-xs text-theme-text/75 hover:bg-theme-surface-soft hover:text-theme-text"
        }
        aria-expanded={isOpen}
        aria-controls="mod-studio-panel"
      >
        Studio
      </button>
      {isOpen ? <ModStudioPanel /> : null}
    </>
  );
}
