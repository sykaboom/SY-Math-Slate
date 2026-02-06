# Hotfix 078: Step/Page Jump Sliders

**Status:** COMPLETED  
**Date:** 2026-02-04  
**Assignee:** Codex CLI  

## Context
User requested restoring step slider jump and adding the same slider behavior to page navigator for long documents.

## Scope
- `v10/src/features/toolbar/PlaybackControls.tsx`
- `v10/src/features/toolbar/PageNavigator.tsx`

## Changes
- Step label now opens a popover slider to jump steps (immediate updates).
- Page label now opens a popover slider to jump pages (immediate updates).
- Removed page prompt jump.

## Verification
- Commands run: none
- Manual verification: not run
