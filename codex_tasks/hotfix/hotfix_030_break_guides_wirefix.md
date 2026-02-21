# Hotfix 080: Break Guide Toggle Wiring + Initial Render Stabilization

**Status:** COMPLETED  
**Date:** 2026-02-04  
**Assignee:** Codex CLI  

## Context
Break guide toggle was wired to `editing-breaks` (data input) instead of page guides. Also observed slight visual difference between first render and later steps.

## Scope
- `v10/src/features/editor/canvas/ContentLayer.tsx`
- `v10/src/features/editor/canvas/CanvasStage.tsx`
- `v10/src/features/editor/canvas/PageGuides.tsx`
- `v10/src/features/editor/canvas/PageViewport.tsx`

## Changes
- Restored `editing-breaks` to only follow Data Input open state.
- Wired `showBreakGuides` to `PageGuides` visibility (only column dividers toggle).
- Switched `PageViewport` sizing effect to `useLayoutEffect` to reduce initial scale flash.

## Verification
- Commands run: none
- Manual verification: not run
