# Hotfix 084: Guide Line Crispness

**Status:** COMPLETED  
**Date:** 2026-02-04  
**Assignee:** Codex CLI  

## Context
Initial screen guide/border lines appeared blurrier than later steps. Adjusted guide rendering to reduce subpixel blur.

## Scope
- `v10/src/features/editor/canvas/PageGuides.tsx`
- `v10/src/features/editor/canvas/PageViewport.tsx`

## Changes
- Added a page-scale context in `PageViewport` so guide rendering can align to the current render scale.
- Rebuilt `PageGuides` to use SVG lines with pixel snapping and consistent 1px strokes.
- Removed shadow-based guide lines to avoid double/blurred edges.

## Verification
- Commands run: none
- Manual verification: not run
