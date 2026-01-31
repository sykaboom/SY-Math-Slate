# Hotfix: Cyan var fallback for gradients/handles

**Status:** COMPLETED  
**Date:** 2026-01-30  
**Scope:** `v10/src/features/canvas/CanvasStage.tsx`, `v10/src/features/layout/OverviewStage.tsx`, `v10/src/features/canvas/objects/ImageBlock.tsx`

## Summary
- Restored baseline gradient strengths/layering and added fallback values to `--neon-cyan-rgb` usage.
- Ensures cyan still renders if the custom property fails to resolve.

## Files Changed
- `v10/src/features/canvas/CanvasStage.tsx`
- `v10/src/features/layout/OverviewStage.tsx`
- `v10/src/features/canvas/objects/ImageBlock.tsx`

## Commands Run
- none

## Manual Verification
- not run (visual check needed)
