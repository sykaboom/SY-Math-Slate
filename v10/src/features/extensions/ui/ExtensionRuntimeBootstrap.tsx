"use client";

import { useEffect } from "react";

import {
  registerToolExecutionPolicy,
  resetToolExecutionPolicy,
} from "@features/extensions/toolExecutionPolicy";

import { registerCoreSlots } from "./registerCoreSlots";

export function ExtensionRuntimeBootstrap() {
  useEffect(() => {
    registerCoreSlots();
    registerToolExecutionPolicy();

    return () => {
      resetToolExecutionPolicy();
    };
  }, []);

  return null;
}
