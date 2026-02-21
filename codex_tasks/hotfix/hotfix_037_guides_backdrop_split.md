# Hotfix 087: Guides Backdrop Split

**Status:** COMPLETED  
**Date:** 2026-02-04  
**Assignee:** Codex CLI  

## Context
Screen-space guides introduced a "black mask" feel while panning due to the guide backdrop fill.

## Scope
- `v10/src/features/editor/canvas/PageGuides.tsx`
- `v10/src/features/editor/canvas/CanvasStage.tsx`
- `v10/src/features/editor/canvas/viewport/useViewportInteraction.ts`

## Changes
- Restored guide backdrop fill to avoid masking border lines.
- Removed board-layer backdrop to prevent overlay conflicts.
- Fixed invalid React prop (`onPointerLeaveCapture`) to stop console warning.

## Verification
- Commands run: none
- Manual verification: not run
