import { Separator } from "@ui/components/separator";
import { cn } from "@core/utils";

type ToolbarSeparatorProps = {
  className?: string;
};

export function ToolbarSeparator({ className }: ToolbarSeparatorProps) {
  return (
    <Separator
      orientation="vertical"
      className={cn("mx-1 h-6 bg-white/10", className)}
    />
  );
}
