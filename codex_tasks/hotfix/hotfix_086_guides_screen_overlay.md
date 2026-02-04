# Hotfix 086: Screen-Space Guides

**Status:** COMPLETED  
**Date:** 2026-02-04  
**Assignee:** Codex CLI  

## Context
Guide/border lines still varied in sharpness due to subpixel offsets from scaled layout. Required screen-space rendering.

## Scope
- `v10/src/features/canvas/PageViewport.tsx`
- `v10/src/features/canvas/CanvasStage.tsx`
- `v10/src/features/canvas/PageGuides.tsx`

## Changes
- Added overlay slot in `PageViewport` to render guides outside the board transform.
- Moved `PageGuides` into the overlay layer.
- Rebuilt guide coordinates in screen space with pixel snapping.
- Added rAF throttling to avoid redundant guide recalculation during pan/zoom.

## Verification
- Commands run: none
- Manual verification: not run
