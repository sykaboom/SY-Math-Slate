import { InputStudioActionsSection } from "@features/editor/input-studio/components";
import { Button } from "@ui/components/button";

import type { DataInputPanelRuntime } from "./useDataInputPanelRuntime";

type DataInputActionsProps = {
  actions: DataInputPanelRuntime["actions"];
};

export function DataInputActions({ actions }: DataInputActionsProps) {
  return (
    <>
      <InputStudioActionsSection
        onClose={actions.closeDataInput}
        onRestoreLayoutSnapshot={actions.onRestoreLayoutSnapshot}
        canRestoreLayoutSnapshot={actions.canRestoreLayoutSnapshot}
        onAutoLayout={actions.onAutoLayout}
        isAutoLayoutRunning={actions.isAutoLayoutRunning}
        onApply={actions.onApply}
        canApply={actions.canApply}
        unmatchedBlockCount={actions.unmatchedBlockCount}
        onRestoreUnmatchedBlocks={actions.onRestoreUnmatchedBlocks}
        onDiscardUnmatchedBlocks={actions.onDiscardUnmatchedBlocks}
      />

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          className="h-10 px-3 text-xs"
          disabled={!actions.canRollback}
          onClick={actions.onRollback}
        >
          입력 롤백
        </Button>
        <Button
          variant="ghost"
          className="h-10 px-3 text-xs text-theme-text/65"
          disabled={!actions.canRollback}
          onClick={actions.onClearSnapshots}
        >
          스냅샷 초기화
        </Button>
      </div>
    </>
  );
}
