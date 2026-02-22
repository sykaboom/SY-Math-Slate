import { InputStudioHeaderSection } from "@features/editor/input-studio/components";
import { Button } from "@ui/components/button";

import type { DataInputPanelRuntime } from "./useDataInputPanelRuntime";

type DataInputHeaderProps = {
  header: DataInputPanelRuntime["header"];
};

export function DataInputHeader({ header }: DataInputHeaderProps) {
  return (
    <>
      <InputStudioHeaderSection
        mode={header.studioMode}
        onModeChange={header.setStudioMode}
        onClose={header.closeDataInput}
      />

      <div className="mb-3 flex items-center gap-2 xl:hidden">
        <Button
          variant={header.activeTab === "input" ? "default" : "outline"}
          className="h-11 flex-1 text-xs"
          onClick={() => header.setActiveTab("input")}
        >
          Input
        </Button>
        <Button
          variant={header.activeTab === "blocks" ? "default" : "outline"}
          className="h-11 flex-1 text-xs"
          onClick={() => header.setActiveTab("blocks")}
        >
          Blocks
        </Button>
      </div>
    </>
  );
}
