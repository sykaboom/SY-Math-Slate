# Hotfix 081: showBreakGuides Scope Fix

**Status:** COMPLETED  
**Date:** 2026-02-04  
**Assignee:** Codex CLI  

## Context
Runtime ReferenceError in `NormalCanvasStage`: `showBreakGuides` was referenced without being defined.

## Scope
- `v10/src/features/canvas/CanvasStage.tsx`

## Changes
- Passed `showBreakGuides` from `CanvasStage` to `NormalCanvasStage`.

## Verification
- Commands run: none
- Manual verification: not run
