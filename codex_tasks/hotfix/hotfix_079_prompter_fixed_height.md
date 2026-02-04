# Hotfix 079: Prompter Fixed Two-Line Height

**Status:** COMPLETED  
**Date:** 2026-02-04  
**Assignee:** Codex CLI  

## Context
User requested the prompter preview to keep a fixed two-line height; the next hint line should be blank when absent to avoid layout shifts.

## Scope
- `v10/src/features/layout/Prompter.tsx`

## Changes
- Always render two lines; next hint line uses a placeholder to preserve height.
- Next hint line is hidden (opacity 0) when no hint.

## Verification
- Commands run: none
- Manual verification: not run
