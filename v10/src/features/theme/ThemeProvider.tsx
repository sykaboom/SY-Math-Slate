"use client";

import { useEffect, type ReactNode } from "react";

import { useThemeStore } from "@features/store/useThemeStore";

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
