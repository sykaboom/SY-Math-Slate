"use client";

import { useEffect } from "react";

import { dispatchCommand } from "@core/runtime/command/commandBus";

type UseAuthoringShortcutsOptions = {
  enabled?: boolean;
};

const SHORTCUT_META = { source: "shortcut.authoring" } as const;

const isEditableElement = (element: Element | null): boolean => {
  if (!element) return false;
  if (element instanceof HTMLInputElement) return true;
  if (element instanceof HTMLTextAreaElement) return true;
  if (element instanceof HTMLSelectElement) return true;
  if (element instanceof HTMLElement && element.isContentEditable) return true;
  if (!(element instanceof HTMLElement)) return false;
  return Boolean(
    element.closest(
      "input, textarea, select, [contenteditable='true'], [contenteditable='plaintext-only']"
    )
  );
};

const dispatchShortcutCommand = (commandId: string, payload: unknown = {}) => {
  void dispatchCommand(commandId, payload, {
    meta: SHORTCUT_META,
  }).catch(() => undefined);
};

export function useAuthoringShortcuts(
  options: UseAuthoringShortcutsOptions = {}
): void {
  const { enabled = true } = options;

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat) return;

      const targetElement = event.target instanceof Element ? event.target : null;
      const activeElement =
        typeof document !== "undefined" ? document.activeElement : null;
      if (isEditableElement(targetElement) || isEditableElement(activeElement)) {
        return;
      }

      const isModifierPressed = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();

      if (isModifierPressed && !event.altKey && key === "z") {
        event.preventDefault();
        if (event.shiftKey) {
          dispatchShortcutCommand("redo");
          return;
        }
        dispatchShortcutCommand("undo");
        return;
      }

      if (isModifierPressed && !event.altKey && !event.shiftKey && key === "y") {
        event.preventDefault();
        dispatchShortcutCommand("redo");
        return;
      }

      if (
        event.altKey &&
        !isModifierPressed &&
        !event.shiftKey &&
        event.key === "ArrowLeft"
      ) {
        event.preventDefault();
        dispatchShortcutCommand("prevStep");
        return;
      }

      if (
        event.altKey &&
        !isModifierPressed &&
        !event.shiftKey &&
        event.key === "ArrowRight"
      ) {
        event.preventDefault();
        dispatchShortcutCommand("nextStep");
        return;
      }

      if (
        !event.altKey &&
        !isModifierPressed &&
        !event.shiftKey &&
        event.key === "PageUp"
      ) {
        event.preventDefault();
        dispatchShortcutCommand("prevPage");
        return;
      }

      if (
        !event.altKey &&
        !isModifierPressed &&
        !event.shiftKey &&
        event.key === "PageDown"
      ) {
        event.preventDefault();
        dispatchShortcutCommand("nextPage");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled]);
}
