import { create } from "zustand";

import type { PenType } from "@core/types/canvas";

import { useChromeStore } from "./useChromeStore";

export type Tool = "pen" | "eraser" | "laser" | "hand" | "text";
export type LaserType = "standard" | "highlighter";
export type { PenType };

interface ToolStoreState {
  activeTool: Tool;
  penColor: string;
  penWidth: number;
  penOpacity: number;
  penType: PenType;
  laserType: LaserType;
  laserColor: string;
  laserWidth: number;
  setTool: (tool: Tool) => void;
  setColor: (color: string) => void;
  setPenWidth: (width: number) => void;
  setPenOpacity: (opacity: number) => void;
  setPenType: (type: PenType) => void;
  setLaserType: (type: LaserType) => void;
  setLaserColor: (color: string) => void;
  setLaserWidth: (width: number) => void;
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
}));
