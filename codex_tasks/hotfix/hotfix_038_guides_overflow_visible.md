# Hotfix 088: Guide Overflow Visible

**Status:** COMPLETED  
**Date:** 2026-02-04  
**Assignee:** Codex CLI  

## Context
Screen-space guides were clipped by the SVG bounds while panning, making borders look masked.

## Scope
- `v10/src/features/canvas/PageGuides.tsx`

## Changes
- Allowed the guide SVG to render beyond its bounds via `overflow: visible`.

## Verification
- Commands run: none
- Manual verification: not run
