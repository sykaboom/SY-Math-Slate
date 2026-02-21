"use client";

import type { CSSProperties } from "react";

import { RichTextAnimator } from "@features/editor/canvas/animation/RichTextAnimator";

type MixedRevealBlockProps = {
  html: string;
  className?: string;
  style?: CSSProperties;
  isActive: boolean;
  speed: number;
  isPaused: boolean;
  skipSignal: number;
  stopSignal: number;
  onMove: (pos: { x: number; y: number }, tool?: "chalk" | "marker") => void;
  onDone: () => void;
};

// Backward-compatible wrapper: mixed/text/math are now unified in RichTextAnimator.
export function MixedRevealBlock(props: MixedRevealBlockProps) {
  return <RichTextAnimator {...props} />;
}
