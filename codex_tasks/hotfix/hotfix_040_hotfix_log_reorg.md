# Hotfix 2026-02-06: Hotfix Log Reorg + Numbering

**Status:** COMPLETED
**Context:** Hotfix logs were split across `codex_tasks/` and `codex_tasks/hotfix/`, with mixed date and number naming.

## Changes
- Moved all hotfix md files into `codex_tasks/hotfix/`.
- Renumbered hotfix files to `hotfix_###_slug.md` sequential order.
- Placed date-based hotfixes at the end of the sequence.
- Updated `AGENTS.md` with hotfix log policy (location, naming, numbering, Codex-only creation).

## Files
- `AGENTS.md`
- `codex_tasks/hotfix/` (all hotfix md files)

## Commands Run
- `python3` (local script for rename/move)
- `mv` (renumbered latest date hotfixes)

## Manual Verification Notes
- `codex_tasks/` root has no remaining `hotfix_*.md` files.
- Hotfix logs are sequentially numbered in `codex_tasks/hotfix/`.
