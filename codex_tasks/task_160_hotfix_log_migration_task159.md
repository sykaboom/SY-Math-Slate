# Task 160: Migrate Task 159 Record into Hotfix Log Folder

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Move the already completed hotfix record from `codex_tasks/task_159_...` into `codex_tasks/hotfix/` using sequential hotfix numbering.
  - Keep the record content intact while aligning with hotfix logging policy.
- What must NOT change:
  - No source code changes under `v10/`.
  - No behavioral/runtime changes.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_160_hotfix_log_migration_task159.md`
- `codex_tasks/task_159_vercel_client_exception_zustand_selector_hotfix.md` (move out)
- `codex_tasks/hotfix/hotfix_051_vercel_client_exception_zustand_selector_hotfix.md` (move in)

Out of scope:
- Any hotfix code rework.
- Any additional task renumbering.
- Any deployment/build operations.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Documentation/log migration only.
  - Preserve hotfix chronology (`hotfix_051` after `hotfix_050`).
- Compatibility:
  - Existing task history remains readable.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - HOTFIX-GOV
- Depends on tasks:
  - [`task_159`]
- Enables tasks:
  - []
- Parallel group:
  - G-docs
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

- [x] Applies: YES
- If YES:
  - [x] Structure changes (file/folder add/move/delete):
    - Move `task_159` record to hotfix folder.
  - [ ] Semantic/rule changes:
    - N/A

---

## Acceptance Criteria (Base Required)

- [x] AC-1: `codex_tasks/hotfix/hotfix_051_vercel_client_exception_zustand_selector_hotfix.md` exists with the previous task_159 content.
- [x] AC-2: `codex_tasks/task_159_vercel_client_exception_zustand_selector_hotfix.md` no longer exists.
- [x] AC-3: `task_160` implementation log records the migration and verification commands.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: `ls codex_tasks/hotfix | grep '^hotfix_051_vercel_client_exception_zustand_selector_hotfix.md$'`
   - Expected result: exact match exists.
   - Covers: AC-1

2) Step:
   - Command / click path: `test ! -f codex_tasks/task_159_vercel_client_exception_zustand_selector_hotfix.md && echo OK`
   - Expected result: prints `OK`.
   - Covers: AC-2

3) Step:
   - Command / click path: `git status --short`
   - Expected result: shows rename/move and task_160 update only.
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Broken references if any external note points to old `task_159` path.
- Roll-back:
  - Move file back to original path and revert this task change.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User quote: "이관."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_160_hotfix_log_migration_task159.md`
- `codex_tasks/task_159_vercel_client_exception_zustand_selector_hotfix.md` (moved)
- `codex_tasks/hotfix/hotfix_051_vercel_client_exception_zustand_selector_hotfix.md`

Commands run (only if user asked or required by spec):
- `mv codex_tasks/task_159_vercel_client_exception_zustand_selector_hotfix.md codex_tasks/hotfix/hotfix_051_vercel_client_exception_zustand_selector_hotfix.md`
- `ls codex_tasks/hotfix | grep '^hotfix_051_vercel_client_exception_zustand_selector_hotfix.md$'`
- `test ! -f codex_tasks/task_159_vercel_client_exception_zustand_selector_hotfix.md && echo OK`
- `git status --short`

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
- `hotfix_051_vercel_client_exception_zustand_selector_hotfix.md` exists in `codex_tasks/hotfix/`.
- Old `task_159` path is absent.
- Working tree shows only the expected migration docs changes.

Notes:
- Migrated misplaced hotfix record into the governed hotfix folder sequence.
