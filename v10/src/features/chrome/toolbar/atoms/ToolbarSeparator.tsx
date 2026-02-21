import { Separator } from "@ui/components/separator";
import { cn } from "@core/utils";

type ToolbarSeparatorProps = {
  className?: string;
};

export function ToolbarSeparator({ className }: ToolbarSeparatorProps) {
  return (
    <Separator
      orientation="vertical"
      className={cn(
        "mx-1 h-6 w-px border-l border-toolbar-border/10 bg-transparent shadow-[var(--toolbar-separator-shadow)]",
        className
      )}
    />
  );
}
