"use client";

import { useEffect, type ReactNode } from "react";

import { useThemeStore } from "@features/platform/store/useThemeStore";

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const applyActiveTheme = useThemeStore((state) => state.applyActiveTheme);

  useEffect(() => {
    applyActiveTheme();
  }, [applyActiveTheme]);

  return <>{children}</>;
}
