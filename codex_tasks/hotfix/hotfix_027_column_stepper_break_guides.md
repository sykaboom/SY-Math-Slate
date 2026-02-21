# Hotfix 077: Column Stepper + Break Guide Toggle

**Status:** COMPLETED  
**Date:** 2026-02-04  
**Assignee:** Codex CLI  

## Context
User requested a compact column stepper UI (`- 3단 +`) and a More menu toggle for break guides.

## Scope
- `v10/src/features/chrome/toolbar/PageNavigator.tsx`
- `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`
- `v10/src/features/platform/store/useUIStore.ts`
- `v10/src/features/editor/canvas/ContentLayer.tsx`

## Changes
- Column UI replaced with stepper; display uses `단` and clamps to 1-4.
- Added `단 구분선` toggle in More menu with dimmed label when off.
- Added `showBreakGuides` state to UI store and wired to ContentLayer.

## Follow-ups
- `showBreakGuides` now wired to `PageGuides` instead of `ContentLayer` (see hotfix_080).

## Verification
- Commands run: none
- Manual verification: not run
