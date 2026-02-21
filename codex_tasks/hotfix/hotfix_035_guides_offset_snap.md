# Hotfix 085: Guide Offset Snap

**Status:** COMPLETED  
**Date:** 2026-02-04  
**Assignee:** Codex CLI  

## Context
Initial screen guide/border lines still appeared softer due to subpixel offsets from centered layout.

## Scope
- `v10/src/features/editor/canvas/PageGuides.tsx`

## Changes
- Added board screen-offset tracking to snap guide coordinates with layout offset.
- Updated pixel snapping to account for board origin offset in screen space.

## Verification
- Commands run: none
- Manual verification: not run
