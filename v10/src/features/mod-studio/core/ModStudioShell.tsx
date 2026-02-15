"use client";

import { useLocalStore } from "@features/store/useLocalStore";
import { useModStudioStore } from "@features/store/useModStudioStore";

import { ModStudioPanel } from "./ModStudioPanel";

export function ModStudioShell() {
  const role = useLocalStore((state) => state.role);
  const { isOpen, toggle } = useModStudioStore((state) => ({
    isOpen: state.isOpen,
    toggle: state.toggle,
  }));

  if (role !== "host") return null;

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        className={
          isOpen
            ? "rounded border border-white/30 bg-white/20 px-3 py-1.5 text-xs text-white"
            : "rounded border border-white/20 bg-white/5 px-3 py-1.5 text-xs text-white/75 hover:bg-white/10 hover:text-white"
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
