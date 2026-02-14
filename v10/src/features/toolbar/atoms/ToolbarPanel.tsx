"use client";

import { motion } from "framer-motion";
import type { ComponentPropsWithoutRef, PropsWithChildren } from "react";

import { PopoverContent } from "@ui/components/popover";
import { cn } from "@core/utils";

type ToolbarPanelProps = PropsWithChildren<
  ComponentPropsWithoutRef<typeof PopoverContent>
>;

export function ToolbarPanel({
  children,
  className,
  ...props
}: ToolbarPanelProps) {
  return (
    <PopoverContent asChild {...props}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className={cn(
          "w-auto rounded-2xl border border-toolbar-border/10 bg-toolbar-surface/95 p-4 text-toolbar-text/70 shadow-[var(--toolbar-panel-shadow)]",
          className
        )}
      >
        {children}
      </motion.div>
    </PopoverContent>
  );
}
