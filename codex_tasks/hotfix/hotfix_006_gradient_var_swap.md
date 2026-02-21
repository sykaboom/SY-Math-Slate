# Hotfix: Gradient var swap (cyan -> pink)

**Status:** COMPLETED  
**Date:** 2026-01-30  
**Scope:** `v10/src/features/editor/canvas/CanvasStage.tsx`, `v10/src/features/chrome/layout/OverviewStage.tsx`

## Summary
- Replaced top gradient to use `--neon-pink-rgb` instead of `--neon-cyan-rgb` to isolate cyan variable visibility.
- Removed solid diagnostic overlays from prior test.

## Files Changed
- `v10/src/features/editor/canvas/CanvasStage.tsx`
- `v10/src/features/chrome/layout/OverviewStage.tsx`

## Commands Run
- none

## Manual Verification
- not run (visual check needed)
