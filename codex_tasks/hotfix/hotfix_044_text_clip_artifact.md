# Hotfix 2026-02-05: Text Clip Artifact

**Status:** COMPLETED
**Context:** Thin white artifact appeared near the left edge of text during step transitions.

## Changes
- Added clip-path overscan + pixel rounding to reduce subpixel sliver artifacts during text reveal.
- Applied a stronger initial clip to fully hide text before reveal begins.

## Files
- `v10/src/features/editor/canvas/animation/AnimatedTextBlock.tsx`

## Commands Run
- None.

## Manual Verification Notes
- Step through text-only sequences and confirm the left-edge artifact no longer appears.
- Confirm text reveal and highlight animation timing remains intact.
