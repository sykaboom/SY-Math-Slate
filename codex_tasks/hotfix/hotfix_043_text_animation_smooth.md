# Hotfix 2026-02-05: Text Animation rAF Reveal

**Status:** COMPLETED
**Context:** Text-only steps felt choppy compared to MathJax steps.

## Changes
- Replaced per-character `setTimeout` loop with rAF-based reveal + clip for smoother playback.
- Cursor movement now follows continuous progress (same path as clip reveal).
- Highlight animation restored as a second pass after text reveal (paint-over effect).
- Slowed highlight pacing and smoothed marker movement for better frame feel.

## Files
- `v10/src/features/editor/canvas/animation/AnimatedTextBlock.tsx`

## Commands Run
- None.

## Manual Verification Notes
- Compare text-only vs MathJax steps for smoothness.
- Confirm highlight styles still appear during reveal.
