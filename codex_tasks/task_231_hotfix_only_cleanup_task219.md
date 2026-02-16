# Task 231: Keep React #185 Record as Hotfix Only (Cleanup)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Remove duplicated root task spec `task_219_vercel_react185_viewport_snapshot_stability.md` and keep only hotfix log record.
- What must NOT change:
  - Do not modify `codex_tasks/hotfix/hotfix_053_react185_viewport_snapshot_stability.md` content.
  - Do not modify roadmap/task matrix semantics.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_231_hotfix_only_cleanup_task219.md`
- `codex_tasks/task_219_vercel_react185_viewport_snapshot_stability.md` (delete)

Out of scope:
- Any `v10/` source changes
- Any wave task implementation changes (`task_220`~`task_223` etc.)

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Documentation/task file cleanup only.
- Compatibility:
  - Keep historical hotfix trace intact via `hotfix_053`.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - HOTFIX-CLEANUP
- Depends on tasks:
  - []
- Enables tasks:
  - []
- Parallel group:
  - G-cleanup
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `mid`

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [ ] Applies: NO

If NO:
- Execution mode: MANUAL

---

## Optional Block C — Hotfix Exception

- [ ] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [ ] Applies: NO

---

## Optional Block E — Documentation Update Check

- [ ] Applies: NO

---

## Acceptance Criteria (Base Required)

- [x] AC-1: `codex_tasks/task_219_vercel_react185_viewport_snapshot_stability.md` no longer exists.
- [x] AC-2: `codex_tasks/hotfix/hotfix_053_react185_viewport_snapshot_stability.md` still exists.
- [x] AC-3: This task introduces changes only to scope files (pre-existing unrelated changes are allowed to remain in working tree).

---

## Manual Verification Steps (Base Required)

> Each step should map to one or more Acceptance Criteria.

1) Step:
   - Command / click path: `test ! -f codex_tasks/task_219_vercel_react185_viewport_snapshot_stability.md && echo OK`
   - Expected result: `OK`
   - Covers: AC-1

2) Step:
   - Command / click path: `test -f codex_tasks/hotfix/hotfix_053_react185_viewport_snapshot_stability.md && echo OK`
   - Expected result: `OK`
   - Covers: AC-2

3) Step:
   - Command / click path: `git status --short -- codex_tasks/task_231_hotfix_only_cleanup_task219.md codex_tasks/task_219_vercel_react185_viewport_snapshot_stability.md`
   - Expected result: output includes only scoped cleanup paths.
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Loss of per-task metadata from root task file.
- Roll-back:
  - Restore removed file from git history (`git checkout <commit> -- codex_tasks/task_219_vercel_react185_viewport_snapshot_stability.md`).

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_231_hotfix_only_cleanup_task219.md`
- `codex_tasks/task_219_vercel_react185_viewport_snapshot_stability.md` (deleted)

Commands run (only if user asked or required by spec):
- `test ! -f codex_tasks/task_219_vercel_react185_viewport_snapshot_stability.md && echo OK_AC1 || echo FAIL_AC1`
- `test -f codex_tasks/hotfix/hotfix_053_react185_viewport_snapshot_stability.md && echo OK_AC2 || echo FAIL_AC2`
- `git status --short -- codex_tasks/task_231_hotfix_only_cleanup_task219.md codex_tasks/task_219_vercel_react185_viewport_snapshot_stability.md`

## Gate Results (Codex fills)

- Lint:
  - N/A
- Build:
  - N/A
- Script checks:
  - N/A

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - N/A
- Newly introduced failures:
  - N/A
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- AC-1 PASS (`OK_AC1`)
- AC-2 PASS (`OK_AC2`)
- AC-3 PASS (`git status --short` path-scoped output showed only the two scope paths)

Notes:
- Cleanup done intentionally to remove task ID collision with roadmap `task_219` (UGC safety pipeline), while preserving hotfix record in `codex_tasks/hotfix/hotfix_053_react185_viewport_snapshot_stability.md`.
