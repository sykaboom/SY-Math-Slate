# Task 245: Layout Hardcoding Freeze Guard and Docs Sync

Status: PENDING
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Add automated guardrails that fail when new hardcoded functional mounts reappear in layout shell paths.
  - Sync architecture docs to reflect the new shell/module/policy runtime.
  - Lock in post-cutover invariants for future waves.
- What must NOT change:
  - Do not alter product behavior.
  - Do not add dependencies.
  - Do not broaden checks beyond layout/module scope in this task.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_245_layout_hardcoding_freeze_guard_and_docs_sync.md`
- `scripts/check_v10_layout_hardcoding_freeze.sh` (new)
- `scripts/run_repo_verifications.sh` (wire new check)
- `v10/AI_READ_ME.md`
- `v10/AI_READ_ME_MAP.md` (if structure changes)
- `codex_tasks/workflow/roadmap_70spec_local_ai_mesh_task_matrix.csv` (status alignment if needed)

Out of scope:
- Core runtime refactors
- New UX features
- API/backend changes

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Guard script should use stable pattern checks (`rg`) and clear failure output.
  - Avoid brittle checks that depend on line numbers.
- Compatibility:
  - Must run in existing verification pipeline.
  - Must not break unrelated tasks.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-F
- Depends on tasks:
  - [`task_244`]
- Enables tasks:
  - [`task_246`]
- Parallel group:
  - G-guard-docs
- Max parallel slots:
  - 6 (default)
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
  - [ ] Structure changes (file/folder add/move/delete):
    - Run `node scripts/gen_ai_read_me_map.mjs`
    - Verify `v10/AI_READ_ME_MAP.md` update if needed
  - [ ] Semantic/rule changes:
    - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: New check script fails when hardcoded functional mounts are added to shell layout paths.
- [ ] AC-2: Verification pipeline runs the new check in `mid` stage.
- [ ] AC-3: `AI_READ_ME` docs reflect module-driven shell/runtime boundaries.
- [ ] AC-4: `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh` passes with the new check enabled.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: run guard script directly.
   - Expected result: clear PASS/FAIL output with blocked pattern list.
   - Covers: AC-1

2) Step:
   - Command / click path: run repo verification pipeline at `mid`.
   - Expected result: new check is invoked and passes.
   - Covers: AC-2, AC-4

3) Step:
   - Command / click path: inspect `v10/AI_READ_ME.md` and map file.
   - Expected result: updated architecture description matches post-cutover runtime.
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Over-strict guard regex can block valid future extensions.
  - Missing doc updates can create contributor confusion.
- Roll-back:
  - Revert guard wiring and docs updates.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [ ] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: PENDING

Changed files:
- (to be filled)

Commands run (only if user asked or required by spec):
- (to be filled)

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
- (to be filled)

Notes:
- (to be filled)
