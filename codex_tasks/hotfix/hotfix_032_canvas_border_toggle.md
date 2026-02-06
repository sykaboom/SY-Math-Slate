# Hotfix 082: Canvas Border Toggle

**Status:** COMPLETED  
**Date:** 2026-02-04  
**Assignee:** Codex CLI  

## Context
User requested an independent toggle for the canvas boundary line in the Layout menu.

## Scope
- `v10/src/features/store/useUIStore.ts`
- `v10/src/features/canvas/CanvasStage.tsx`
- `v10/src/features/canvas/PageGuides.tsx`
- `v10/src/features/toolbar/FloatingToolbar.tsx`

## Changes
- Added `showCanvasBorder` state + toggle in UI store.
- Wired `showCanvasBorder` to `PageGuides`.
- Added `캔버스 경계선` toggle in More → Layout.

## Verification
- Commands run: none
- Manual verification: not run
