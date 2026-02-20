"use client";

import { Popover, PopoverTrigger } from "@ui/components/popover";
import { dispatchCommand } from "@core/engine/commandBus";
import { useUIStore, type Tool } from "@features/store/useUIStoreBridge";
import { useCanvasStore } from "@features/store/useCanvasStore";
import {
  ClipboardList,
  Columns,
  CornerDownLeft,
  Eraser,
  FilePlus,
  Hand,
  Image as ImageIcon,
  PenLine,
  Redo2,
  Type,
  Undo2,
  Zap,
} from "lucide-react";

import { EraserControls } from "./EraserControls";
import { LaserControls } from "./LaserControls";
import { PenControls } from "./PenControls";
import { ToolButton } from "./atoms/ToolButton";
import { ToolbarPanel } from "./atoms/ToolbarPanel";
import { fireToolbarCommand, publishToolbarNotice } from "./toolbarFeedback";

type DrawModeToolsProps = {
  compact?: boolean;
  showHandTool: boolean;
  showPenTool: boolean;
  showEraserTool: boolean;
  showLaserTool: boolean;
  showTextTool: boolean;
  showImageTool: boolean;
  showClipboardTool: boolean;
  showUndoRedo: boolean;
  showBreakActions: boolean;
  onImagePicker: () => void;
};

export function DrawModeTools({
  compact = false,
  showHandTool,
  showPenTool,
  showEraserTool,
  showLaserTool,
  showTextTool,
  showImageTool,
  showClipboardTool,
  showUndoRedo,
  showBreakActions,
  onImagePicker,
}: DrawModeToolsProps) {
  const {
    activeTool,
    penColor,
    openPanel,
    isOverviewMode,
    isDataInputOpen,
    togglePanel,
    toggleDataInput,
    openPasteHelper,
  } = useUIStore();
  const { pages, currentPageId, strokeRedoByPage } = useCanvasStore();

  const isPenOpen = openPanel === "pen";
  const currentItems = pages[currentPageId] ?? [];
  const canUndo = currentItems.some((item) => item.type === "stroke");
  const canRedo = (strokeRedoByPage[currentPageId]?.length ?? 0) > 0;
  const isEraserOpen = openPanel === "eraser";
  const isLaserOpen = openPanel === "laser";
  const normalizedPenColor = penColor;

  const dispatchToolbarCommand = (commandId: string, payload: unknown = {}) => {
    void dispatchCommand(commandId, payload, {
      meta: { source: "toolbar.draw-mode" },
    }).catch(() => {
      publishToolbarNotice({
        tone: "error",
        message: "요청을 처리하지 못했습니다.",
      });
    });
  };

  const handleTool = (tool: Tool) => () =>
    dispatchToolbarCommand("setTool", { tool });

  const handleToolPanelClick = (
    tool: Tool,
    panel: "pen" | "eraser" | "laser"
  ) => {
    if (activeTool === tool) {
      togglePanel(panel);
      return;
    }
    dispatchToolbarCommand("setTool", { tool });
  };

  const handleToolPopoverOpenChange =
    (panel: "pen" | "eraser" | "laser") => (open: boolean) => {
      if (!open && openPanel === panel) {
        togglePanel(panel);
      }
    };

  const handlePenClick = () => handleToolPanelClick("pen", "pen");
  const handleEraserClick = () => handleToolPanelClick("eraser", "eraser");
  const handleLaserClick = () => handleToolPanelClick("laser", "laser");

  const handlePasteHelper = () => {
    if (isOverviewMode) return;
    openPasteHelper();
  };

  const handleInsertBreak = (type: "line" | "column" | "page") => {
    fireToolbarCommand({
      commandId: "insertBreak",
      payload: { type, panelOpen: isDataInputOpen },
      source: "toolbar.draw-mode.break-actions",
      errorMessage: "구분선 삽입을 처리하지 못했습니다.",
    });
  };

  const popoverOffset = compact ? 14 : 18;

  return (
    <>
      {showHandTool && (
        <ToolButton
          icon={Hand}
          label="Hand"
          active={activeTool === "hand"}
          onClick={handleTool("hand")}
          className={compact ? "h-11 w-11 shrink-0" : undefined}
        />
      )}

      {showPenTool && (
        <>
          <Popover
            open={isPenOpen}
            onOpenChange={handleToolPopoverOpenChange("pen")}
          >
            <PopoverTrigger asChild>
              <ToolButton
                icon={PenLine}
                label="Pen"
                active={activeTool === "pen"}
                colorIndicator={normalizedPenColor}
                onClick={handlePenClick}
                className={compact ? "h-11 w-11 shrink-0" : undefined}
              />
            </PopoverTrigger>
            <ToolbarPanel side="top" align="center" sideOffset={popoverOffset}>
              <PenControls />
            </ToolbarPanel>
          </Popover>
        </>
      )}

      {showEraserTool && (
        <Popover
          open={isEraserOpen}
          onOpenChange={handleToolPopoverOpenChange("eraser")}
        >
          <PopoverTrigger asChild>
            <ToolButton
              icon={Eraser}
              label="Eraser"
              active={activeTool === "eraser"}
              onClick={handleEraserClick}
              className={compact ? "h-11 w-11 shrink-0" : undefined}
            />
          </PopoverTrigger>
          <ToolbarPanel side="top" align="center" sideOffset={popoverOffset}>
            <EraserControls />
          </ToolbarPanel>
        </Popover>
      )}

      {showLaserTool && (
        <Popover
          open={isLaserOpen}
          onOpenChange={handleToolPopoverOpenChange("laser")}
        >
          <PopoverTrigger asChild>
            <ToolButton
              icon={Zap}
              label="Laser"
              active={activeTool === "laser"}
              onClick={handleLaserClick}
              className={compact ? "h-11 w-11 shrink-0" : undefined}
            />
          </PopoverTrigger>
          <ToolbarPanel side="top" align="center" sideOffset={popoverOffset}>
            <LaserControls />
          </ToolbarPanel>
        </Popover>
      )}

      {showTextTool && (
        <ToolButton
          icon={Type}
          label="Text"
          active={isDataInputOpen}
          onClick={toggleDataInput}
          disabled={isOverviewMode}
          className={compact ? "h-11 w-11 shrink-0" : undefined}
        />
      )}
      {showImageTool && (
        <ToolButton
          icon={ImageIcon}
          label="Image"
          onClick={onImagePicker}
          disabled={isOverviewMode}
          className={compact ? "h-11 w-11 shrink-0" : undefined}
        />
      )}
      {showClipboardTool && (
        <ToolButton
          icon={ClipboardList}
          label="붙여넣기 도움말"
          onClick={handlePasteHelper}
          disabled={isOverviewMode}
          className={compact ? "h-11 w-11 shrink-0" : undefined}
        />
      )}

      {showUndoRedo &&
        (compact ? (
          <>
            <ToolButton
              icon={Undo2}
              label="Undo"
              onClick={() => dispatchToolbarCommand("undo")}
              disabled={!canUndo || isOverviewMode}
              className="h-11 w-11 shrink-0"
            />
            <ToolButton
              icon={Redo2}
              label="Redo"
              onClick={() => dispatchToolbarCommand("redo")}
              disabled={!canRedo || isOverviewMode}
              className="h-11 w-11 shrink-0"
            />
          </>
        ) : (
          <div className="flex items-center gap-1 rounded-full border border-toolbar-border/10 bg-toolbar-chip/5 px-2 py-1">
            <ToolButton
              icon={Undo2}
              label="Undo"
              onClick={() => dispatchToolbarCommand("undo")}
              disabled={!canUndo || isOverviewMode}
              className="h-8 w-8"
            />
            <ToolButton
              icon={Redo2}
              label="Redo"
              onClick={() => dispatchToolbarCommand("redo")}
              disabled={!canRedo || isOverviewMode}
              className="h-8 w-8"
            />
          </div>
        ))}

      {showBreakActions &&
        (compact ? (
          <>
            <ToolButton
              icon={CornerDownLeft}
              label="Line Break"
              onClick={() => handleInsertBreak("line")}
              disabled={isOverviewMode}
              className="h-11 w-11 shrink-0"
            />
            <ToolButton
              icon={Columns}
              label="Column Break"
              onClick={() => handleInsertBreak("column")}
              disabled={isOverviewMode}
              className="h-11 w-11 shrink-0"
            />
            <ToolButton
              icon={FilePlus}
              label="Page Break"
              onClick={() => handleInsertBreak("page")}
              disabled={isOverviewMode}
              className="h-11 w-11 shrink-0"
            />
          </>
        ) : (
          <div className="flex items-center gap-1 rounded-full border border-toolbar-border/10 bg-toolbar-chip/5 px-2 py-1 text-[11px] text-toolbar-text/70">
            <ToolButton
              icon={CornerDownLeft}
              label="Line Break"
              onClick={() => handleInsertBreak("line")}
              disabled={isOverviewMode}
              className="h-8 w-8"
            />
            <ToolButton
              icon={Columns}
              label="Column Break"
              onClick={() => handleInsertBreak("column")}
              disabled={isOverviewMode}
              className="h-8 w-8"
            />
            <ToolButton
              icon={FilePlus}
              label="Page Break"
              onClick={() => handleInsertBreak("page")}
              disabled={isOverviewMode}
              className="h-8 w-8"
            />
          </div>
        ))}
    </>
  );
}
