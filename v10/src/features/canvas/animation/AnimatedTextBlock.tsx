"use client";

import type { CSSProperties } from "react";

import { RichTextAnimator } from "@features/canvas/animation/RichTextAnimator";

type AnimatedTextBlockProps = {
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

// Backward-compatible wrapper: text animation now runs through RichTextAnimator.
export function AnimatedTextBlock(props: AnimatedTextBlockProps) {
  return <RichTextAnimator {...props} />;
}

