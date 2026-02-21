# Hotfix 089: Guide Viewport Expansion

**Status:** COMPLETED  
**Date:** 2026-02-04  
**Assignee:** Codex CLI  

## Context
Screen-space page guides still clipped at the base viewport bounds when panning/zooming.

## Scope
- `v10/src/features/editor/canvas/PageGuides.tsx`
- `v10/AI_READ_ME.md`

## Changes
- Expanded the guide SVG viewport based on pan/zoom extents so borders/columns are not clipped.
- Documented the screen-space guide overlay in `v10/AI_READ_ME.md`.

## Verification
- Commands run: none
- Manual verification: not run
