# Task 118: AI_READ_ME Sync Guard Script

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-14

---

## Goal (Base Required)
- What to change:
  - Add a repository verification script that fails commits when staged `v10/src/**` changes exist without staged `v10/AI_READ_ME.md` updates.
  - Keep the guard compatible with current hook flow (`scripts/run_repo_verifications.sh` auto-discovery).
- What must NOT change:
  - No changes to runtime app behavior.
  - No new dependencies.
  - No forced failure on non-commit contexts (e.g., pre-push with no staged files).

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_118_ai_read_me_sync_guard.md`
- `scripts/check_ai_read_me_sync.sh` (new)

Out of scope:
- `.githooks/pre-commit` / `.githooks/pre-push` logic changes
- `scripts/run_repo_verifications.sh` matching rule changes
- Any `v10/src/**` application code changes

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Bash script only.
  - Must use staged-file inspection (`git diff --cached`) for commit-time enforcement.
  - Must support opt-out env var for emergency use.
- Compatibility:
  - Should pass silently when no staged files or no staged `v10/src/**` changes.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: NO

If NO:
- Execution mode: MANUAL

---

## Optional Block C — Hotfix Exception

- [x] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [x] Applies: NO

---

## Optional Block E — Documentation Update Check

- [x] Applies: NO

---

## Acceptance Criteria (Base Required)

- [x] AC-1: `scripts/check_ai_read_me_sync.sh` exists and is executable.
- [x] AC-2: Script exits 0 when staged files do not include `v10/src/**`.
- [x] AC-3: Script exits 1 when staged files include `v10/src/**` but not `v10/AI_READ_ME.md`.
- [x] AC-4: Script exits 0 when both `v10/src/**` and `v10/AI_READ_ME.md` are staged.
- [x] AC-5: Script supports bypass via `SKIP_AI_READ_ME_SYNC=1`.
- [x] AC-6: `bash scripts/run_repo_verifications.sh` includes and runs this script via current auto-discovery.

---

## Manual Verification Steps (Base Required)

> Each step should map to one or more Acceptance Criteria.

1) Step:
   - Command / click path: `chmod +x scripts/check_ai_read_me_sync.sh`
   - Expected result: script is executable
   - Covers: AC-1

2) Step:
   - Command / click path: run script with no staged files
   - Expected result: exits 0 and prints skip/ok message
   - Covers: AC-2

3) Step:
   - Command / click path: stage one `v10/src/**` file only, then run script
   - Expected result: exits 1 with guidance message
   - Covers: AC-3

4) Step:
   - Command / click path: additionally stage `v10/AI_READ_ME.md`, then run script
   - Expected result: exits 0
   - Covers: AC-4

5) Step:
   - Command / click path: `SKIP_AI_READ_ME_SYNC=1 scripts/check_ai_read_me_sync.sh`
   - Expected result: exits 0 (guard bypass)
   - Covers: AC-5

6) Step:
   - Command / click path: `bash scripts/run_repo_verifications.sh`
   - Expected result: script is discovered and executed in verification pipeline
   - Covers: AC-6

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Guard may feel strict for tiny code changes unless contributors stage doc updates intentionally.
- Roll-back:
  - Revert this task commit to remove the guard script.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (chat: "응 진행해.")

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_118_ai_read_me_sync_guard.md`
- `scripts/check_ai_read_me_sync.sh`

Commands run (only if user asked or required by spec):
- `ls -l scripts/check_ai_read_me_sync.sh`
- `scripts/check_ai_read_me_sync.sh`
- `AI_READ_ME_SYNC_STAGED_FILES=$'v10/src/core/extensions/mcpGateway.ts' scripts/check_ai_read_me_sync.sh`
- `AI_READ_ME_SYNC_STAGED_FILES=$'v10/src/core/extensions/mcpGateway.ts\nv10/AI_READ_ME.md' scripts/check_ai_read_me_sync.sh`
- `SKIP_AI_READ_ME_SYNC=1 scripts/check_ai_read_me_sync.sh`
- `bash scripts/run_repo_verifications.sh`

## Gate Results (Codex fills)

- Lint:
  - N/A
- Build:
  - N/A
- Script checks:
  - PASS

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - None
- Newly introduced failures:
  - None
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- AC-1 verified via executable bit: `-rwxr-xr-x scripts/check_ai_read_me_sync.sh`.
- AC-2 verified: no staged files -> skip/pass (exit 0).
- AC-3 verified with injected staged set (`v10/src/**` only) -> fail (exit 1).
- AC-4 verified with injected staged set (`v10/src/**` + `v10/AI_READ_ME.md`) -> pass (exit 0).
- AC-5 verified: `SKIP_AI_READ_ME_SYNC=1` -> skipped/pass (exit 0).
- AC-6 verified: `scripts/run_repo_verifications.sh` auto-discovers and runs `scripts/check_ai_read_me_sync.sh`.

Notes:
- Guard script should focus on staged changes only.
