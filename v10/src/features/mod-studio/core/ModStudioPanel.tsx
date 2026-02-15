"use client";

import { MOD_STUDIO_TABS, type ModStudioTab } from "@features/mod-studio/core/types";
import { PolicyStudioSection } from "@features/mod-studio/policy/PolicyStudioSection";
import { LayoutStudioSection } from "@features/mod-studio/layout/LayoutStudioSection";
import { ModuleStudioSection } from "@features/mod-studio/modules/ModuleStudioSection";
import { ThemeStudioSection } from "@features/mod-studio/theme/ThemeStudioSection";
import { PublishStudioSection } from "@features/mod-studio/publish/PublishStudioSection";
import { IoStudioSection } from "@features/mod-studio/io/IoStudioSection";
import { useModStudioStore } from "@features/store/useModStudioStore";

const TAB_LABELS: Record<ModStudioTab, string> = {
  policy: "Policy",
  layout: "Layout",
  modules: "Modules",
  theme: "Theme",
  publish: "Publish",
  io: "Import/Export",
};

const renderTabSection = (tab: ModStudioTab) => {
  if (tab === "policy") return <PolicyStudioSection />;
  if (tab === "layout") return <LayoutStudioSection />;
  if (tab === "modules") return <ModuleStudioSection />;
  if (tab === "theme") return <ThemeStudioSection />;
  if (tab === "publish") return <PublishStudioSection />;
  return <IoStudioSection />;
};

export function ModStudioPanel() {
  const activeTab = useModStudioStore((state) => state.activeTab);
  const setActiveTab = useModStudioStore((state) => state.setActiveTab);
  const close = useModStudioStore((state) => state.close);

  return (
    <section
      data-mod-studio="panel"
      className="fixed right-3 top-14 z-[70] h-[min(78vh,680px)] w-[min(92vw,820px)] overflow-hidden rounded-lg border border-white/15 bg-black/85 shadow-2xl backdrop-blur-md"
      aria-label="Mod Studio"
    >
      <header className="flex items-center justify-between border-b border-white/10 px-3 py-2">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
          Mod Studio
        </div>
        <button
          type="button"
          onClick={close}
          className="rounded border border-white/20 px-2 py-1 text-xs text-white/80 hover:bg-white/10"
        >
          Close
        </button>
      </header>
      <div className="flex h-[calc(100%-41px)] min-h-0">
        <nav className="w-40 shrink-0 border-r border-white/10 p-2">
          <ul className="grid gap-1">
            {MOD_STUDIO_TABS.map((tab) => {
              const active = tab === activeTab;
              return (
                <li key={tab}>
                  <button
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={
                      active
                        ? "w-full rounded bg-white/20 px-2 py-1.5 text-left text-xs text-white"
                        : "w-full rounded px-2 py-1.5 text-left text-xs text-white/70 hover:bg-white/10 hover:text-white"
                    }
                  >
                    {TAB_LABELS[tab]}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="min-h-0 flex-1 overflow-auto p-3">{renderTabSection(activeTab)}</div>
      </div>
    </section>
  );
}
