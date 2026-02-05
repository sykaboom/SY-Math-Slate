# Hotfix 2026-02-05: Render Jitter Stabilization

**Status:** COMPLETED
**Context:** Rendering showed frame jitter during animation/drawing.

## Changes
- Throttled board transform updates and removed per-call layout reads in `toBoardPoint`.
- Snapped actor movement to device pixel ratio.
- Avoided redundant actor state updates during move.

## Files
- `v10/src/features/hooks/useBoardTransform.ts`
- `v10/src/features/hooks/useSequence.ts`

## Commands Run
- None.

## Manual Verification Notes
- Check animation playback for reduced cursor jitter.
- Draw strokes and confirm pointer alignment remains stable during pan/zoom.
