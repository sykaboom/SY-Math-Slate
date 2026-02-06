"use client";

import type { CSSProperties } from "react";

import { RichTextAnimator } from "@features/canvas/animation/RichTextAnimator";

type MathRevealBlockProps = {
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

// Backward-compatible wrapper: math animation now runs through RichTextAnimator.
export function MathRevealBlock(props: MathRevealBlockProps) {
  return <RichTextAnimator {...props} />;
}

