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
          "w-auto rounded-2xl border border-white/10 bg-slate-900/95 p-4 text-white shadow-[0_16px_40px_rgba(0,0,0,0.45)]",
          className
        )}
      >
        {children}
      </motion.div>
    </PopoverContent>
  );
}
