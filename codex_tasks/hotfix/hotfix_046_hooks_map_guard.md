# Hotfix 2026-02-08: Hook Map Guard and HookPath Warning

**Status:** COMPLETED
**Context:** `AI_READ_ME_MAP` CI check could fail when `scripts/gen_ai_read_me_map.mjs` changed without local map regeneration. Also needed explicit warning when `core.hooksPath` is not `.githooks`.

## Changes
- Updated `.githooks/pre-commit`:
  - Refresh `v10/AI_READ_ME_MAP.md` when staged changes include either `v10/**` or `scripts/gen_ai_read_me_map.mjs`.
  - Print warning if `git config core.hooksPath` is not `.githooks`.
- Updated `.githooks/pre-push`:
  - Run `node scripts/gen_ai_read_me_map.mjs --check` when push diff includes `v10/**` or `scripts/gen_ai_read_me_map.mjs`.
  - In no-diff fallback path, also run map freshness check.
  - Print warning if `git config core.hooksPath` is not `.githooks`.

## Files
- `.githooks/pre-commit`
- `.githooks/pre-push`
- `codex_tasks/hotfix/hotfix_046_hooks_map_guard.md`

## Commands Run
- `bash -n .githooks/pre-commit`
- `bash -n .githooks/pre-push`

## Manual Verification Notes
- Confirm syntax checks pass for both hook scripts.
- On commits touching `scripts/gen_ai_read_me_map.mjs`, verify map regeneration/staging triggers in pre-commit.
- On pushes touching `v10/**` or map generator script, verify map freshness check runs in pre-push.
