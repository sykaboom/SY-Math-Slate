"use client";

import { MOD_STUDIO_TABS, type ModStudioTab } from "@features/platform/mod-studio/core/types";
import { PolicyStudioSection } from "@features/platform/mod-studio/policy/PolicyStudioSection";
import { LayoutStudioSection } from "@features/platform/mod-studio/layout/LayoutStudioSection";
import { ModuleStudioSection } from "@features/platform/mod-studio/modules/ModuleStudioSection";
import { ThemeStudioSection } from "@features/platform/mod-studio/theme/ThemeStudioSection";
import { PublishStudioSection } from "@features/platform/mod-studio/publish/PublishStudioSection";
import { IoStudioSection } from "@features/platform/mod-studio/io/IoStudioSection";
import { useModStudioStore } from "@features/platform/store/useModStudioStore";

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
      className="fixed right-3 top-14 z-[70] h-[min(78vh,680px)] w-[min(92vw,820px)] overflow-hidden rounded-lg border border-theme-border/15 bg-theme-surface/85 shadow-2xl backdrop-blur-md"
      aria-label="Mod Studio"
    >
      <header className="flex items-center justify-between border-b border-theme-border/10 px-3 py-2">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-theme-text/70">
          Mod Studio
        </div>
        <button
          type="button"
          onClick={close}
          className="rounded border border-theme-border/20 px-2 py-1 text-xs text-theme-text/80 hover:bg-theme-surface-soft"
        >
          Close
        </button>
      </header>
      <div className="flex h-[calc(100%-41px)] min-h-0">
        <nav className="w-40 shrink-0 border-r border-theme-border/10 p-2">
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
                        ? "w-full rounded bg-theme-surface/20 px-2 py-1.5 text-left text-xs text-theme-text"
                        : "w-full rounded px-2 py-1.5 text-left text-xs text-theme-text/70 hover:bg-theme-surface-soft hover:text-theme-text"
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
