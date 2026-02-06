# Hotfix 2026-02-05: Mixed Text Overlay Line-Box Alignment

**Status:** COMPLETED
**Context:** Mixed-step text overlay rendered slightly lower during reveal, then jumped up when the original text became visible.

## Changes
- Adjust overlay line boxes using computed `line-height` to align to the original line box (prevents vertical snap at reveal end).
- Preserve cursor baseline using glyph bottom while expanding overlay container height to line box.

## Files
- `v10/src/features/canvas/animation/MixedRevealBlock.tsx`

## Commands Run
- None.

## Manual Verification Notes
- Mixed text+math step: overlay text no longer sits lower or snaps upward at the end.
- Text-only and math-only steps remain unchanged.
