"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { LucideIcon } from "lucide-react";

import { buttonVariants } from "@ui/components/button";
import { cn } from "@core/utils";

const activeButtonClass =
  "bg-neon-yellow text-black shadow-[0_0_16px_rgba(255,255,0,0.4)]";

type ToolButtonProps = {
  icon: LucideIcon;
  label: string;
  active?: boolean;
} & Omit<HTMLMotionProps<"button">, "children">;

export function ToolButton({
  icon: Icon,
  label,
  active,
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
        "h-11 w-11 text-white/70 hover:text-white disabled:text-white/30",
        active && activeButtonClass,
        className
      )}
      {...pressedProps}
      {...props}
    >
      <Icon className="h-4 w-4" />
    </motion.button>
  );
}
