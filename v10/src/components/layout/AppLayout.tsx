import type { ReactNode } from "react";

import { CanvasLayer } from "@/components/canvas/CanvasLayer";
import { Button } from "@/components/ui/button";
import { FloatingToolbar } from "@/components/toolbar/FloatingToolbar";
import { Minus, Plus, ZoomIn } from "lucide-react";

interface AppLayoutProps {
  children?: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-app text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
              SY
            </span>
            <div>
              <p className="text-lg font-semibold">Math Slate</p>
              <p className="text-xs text-white/50">Dark Canvas Workspace</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white/70 hover:text-white"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-xs text-white/60">100%</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white/70 hover:text-white"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              className="border-white/15 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
            >
              <ZoomIn className="h-4 w-4" />
              View
            </Button>
          </div>
        </div>
      </header>

      <main className="relative flex flex-1 items-center justify-center px-6 py-16">
        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_top,_rgba(0,255,255,0.08),_transparent_45%)]" />
        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_bottom,_rgba(255,16,240,0.08),_transparent_40%)]" />
        <CanvasLayer />

        <div className="relative z-10 w-full max-w-3xl rounded-3xl border border-white/10 bg-black/40 px-10 py-14 text-center shadow-[0_0_50px_rgba(0,0,0,0.45)] backdrop-blur-lg">
          {children}
        </div>
      </main>

      <FloatingToolbar />
    </div>
  );
}
