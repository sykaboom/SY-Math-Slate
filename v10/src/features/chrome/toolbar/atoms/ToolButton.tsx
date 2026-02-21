"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { LucideIcon } from "lucide-react";

import { buttonVariants } from "@ui/components/button";
import { cn } from "@core/utils";

const activeButtonClass =
  "bg-toolbar-active-bg text-toolbar-active-text shadow-[var(--toolbar-active-shadow)]";

type ToolButtonProps = {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  colorIndicator?: string;
} & Omit<HTMLMotionProps<"button">, "children">;

export function ToolButton({
  icon: Icon,
  label,
  active,
  colorIndicator,
  className,
  ...props
}: ToolButtonProps) {
  const pressedProps =
    typeof active === "boolean" ? { "aria-pressed": active } : {};

  return (
    <motion.button
      type="button"
      aria-label={label}
      title={label}
      whileTap={{ scale: 0.9 }}
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon" }),
        "relative h-11 w-11 bg-toolbar-chip/5 text-toolbar-text/70 hover:bg-toolbar-chip/5 hover:text-toolbar-text disabled:text-toolbar-muted/60",
        active && activeButtonClass,
        className
      )}
      {...pressedProps}
      {...props}
    >
      <Icon className="h-4 w-4" />
      {colorIndicator ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border border-black/20"
          style={{ backgroundColor: colorIndicator }}
        />
      ) : null}
    </motion.button>
  );
}
