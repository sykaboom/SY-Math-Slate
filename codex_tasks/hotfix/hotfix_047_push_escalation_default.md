# Hotfix 2026-02-08: Default Push Escalation Policy

**Status:** COMPLETED
**Context:** In sandbox mode, first-attempt normal `git push` repeatedly fails with DNS resolution errors and creates noisy retry flow.

## Changes
- Updated `AGENTS.md` with a sandbox-aware push policy:
  - run `git push` with escalated permission first
  - on failure, stop and report exact error
  - avoid normal-then-escalated retry loop for push

## Files
- `AGENTS.md`
- `codex_tasks/hotfix/hotfix_047_push_escalation_default.md`

## Commands Run
- None.

## Manual Verification Notes
- Policy text is now explicit in `AGENTS.md` under `Network Push Operation (sandbox-aware default)`.
