import { create } from "zustand";

import type { PenType } from "@core/foundation/types/canvas";

import { useChromeStore } from "./useChromeStore";

export type Tool = "pen" | "eraser" | "laser" | "hand" | "text";
export type LaserType = "standard" | "highlighter";
export type { PenType };
export const ERASER_WIDTH_MIN = 4;
export const ERASER_WIDTH_MAX = 120;
export const DEFAULT_ERASER_WIDTH = 40;

const clampEraserWidth = (value: number): number => {
  if (!Number.isFinite(value)) return DEFAULT_ERASER_WIDTH;
  return Math.min(Math.max(value, ERASER_WIDTH_MIN), ERASER_WIDTH_MAX);
};

interface ToolStoreState {
  activeTool: Tool;
  penColor: string;
  penWidth: number;
  penOpacity: number;
  penType: PenType;
  laserType: LaserType;
  laserColor: string;
  laserWidth: number;
  eraserWidth: number;
  setTool: (tool: Tool) => void;
  setColor: (color: string) => void;
  setPenWidth: (width: number) => void;
  setPenOpacity: (opacity: number) => void;
  setPenType: (type: PenType) => void;
  setLaserType: (type: LaserType) => void;
  setLaserColor: (color: string) => void;
  setLaserWidth: (width: number) => void;
  setEraserWidth: (width: number) => void;
}

export const useToolStore = create<ToolStoreState>((set) => ({
  activeTool: "pen",
  penColor: "#FFFF00",
  penWidth: 4,
  penOpacity: 80,
  penType: "ink",
  laserType: "standard",
  laserColor: "#FF3B30",
  laserWidth: 10,
  eraserWidth: DEFAULT_ERASER_WIDTH,
  setTool: (tool) => {
    set(() => ({ activeTool: tool }));
    useChromeStore.getState().closePanel();
  },
  setColor: (color) => set(() => ({ penColor: color })),
  setPenWidth: (width) => set(() => ({ penWidth: width })),
  setPenOpacity: (opacity) => set(() => ({ penOpacity: opacity })),
  setPenType: (type) =>
    set((state) => {
      if (type === "ink") {
        return {
          penType: type,
          penWidth: 3,
          penOpacity: 100,
          penColor: state.penColor || "#FFFFFF",
        };
      }
      if (type === "pencil") {
        return {
          penType: type,
          penWidth: 2,
          penOpacity: 80,
          penColor: "#CCCCCC",
        };
      }
      return {
        penType: type,
        penWidth: 20,
        penOpacity: 30,
        penColor: "#FFFF00",
      };
    }),
  setLaserType: (type) =>
    set(() => ({
      laserType: type,
      laserWidth: type === "standard" ? 10 : 40,
      laserColor: type === "standard" ? "#FF3B30" : "#FFFF00",
    })),
  setLaserColor: (color) => set(() => ({ laserColor: color })),
  setLaserWidth: (width) => set(() => ({ laserWidth: width })),
  setEraserWidth: (width) =>
    set(() => ({ eraserWidth: clampEraserWidth(width) })),
}));
