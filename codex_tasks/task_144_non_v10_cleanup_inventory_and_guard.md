# Task 144: Non-v10 Cleanup Inventory and Guardrail Plan

Status: PENDING
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Build a deterministic inventory of repository assets outside `v10/`.
  - Classify each path into `KEEP`, `ARCHIVE`, `DELETE` with rationale and dependency evidence.
  - Define hard guardrails to prevent accidental deletion of governance/runtime-critical files.
- What must NOT change:
  - No file deletion in this task.
  - No modification of runtime code paths.
  - Never touch paths outside `/home/sykab/SY-Math-Slate`.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_155_non_v10_cleanup_inventory_and_guard.md`
- `codex_tasks/cleanup/non_v10_inventory.md` (new)
- `codex_tasks/cleanup/non_v10_cleanup_matrix.md` (new)
- `scripts/` (only if inventory helper script is added)
- `v10/AI_READ_ME.md` (if guardrail semantics require note)

Out of scope:
- Actual delete/move operations.
- `v10/` app feature changes.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Path safety invariant:
    - All candidates must be under repository root (`/home/sykab/SY-Math-Slate/**`).
    - Any path containing `..`, absolute path outside repo, or home/global config path is auto-rejected.
  - Guardrails must preserve mandatory assets:
    - `v10/**`
    - `codex_tasks/**`
    - `AGENTS.md`, `PROJECT_BLUEPRINT.md`, `PROJECT_CONTEXT.md`, protocol docs
    - verification scripts used by hooks/CI
  - Classification must reference actual usage (`rg`, scripts, hooks).
- Compatibility:
  - Plan must be executable in two phases:
    - Phase 1 after Task 143
    - Final purge after Task 156 + stabilization

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [ ] Applies: YES
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - task_139~157
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: Codex
    - Implementer-B: Codex
    - Implementer-C: Codex
    - Reviewer+Verifier: Codex
  - File ownership lock plan:
    - A: inventory collection
    - B: dependency usage evidence
    - C: cleanup matrix and rollout notes
  - Parallel slot plan:
    - max 6 active slots

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

- [ ] Applies: YES
- If YES:
  - [ ] Structure changes (file/folder add/move/delete):
    - Run `node scripts/gen_ai_read_me_map.mjs`
    - Verify `v10/AI_READ_ME_MAP.md` update if needed
  - [ ] Semantic/rule changes:
    - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: Inventory lists all top-level non-v10 assets with classification (`KEEP/ARCHIVE/DELETE`).
- [ ] AC-2: Each `DELETE/ARCHIVE` candidate includes dependency evidence and rollback note.
- [ ] AC-3: Guardrail list explicitly protects governance/task/verification critical files.
- [ ] AC-4: Plan specifies phase gates (`after-143`, `after-156+stabilization`).

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: review `codex_tasks/cleanup/non_v10_inventory.md`.
   - Expected result: complete inventory with clear classification.
   - Covers: AC-1

2) Step:
   - Command / click path: review `codex_tasks/cleanup/non_v10_cleanup_matrix.md`.
   - Expected result: dependency evidence and rollback notes per candidate.
   - Covers: AC-2, AC-3

3) Step:
   - Command / click path: confirm phase gates documented.
   - Expected result: explicit `after-143` and `after-156+stabilization` gates.
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Misclassification can schedule critical files for deletion.
- Roll-back:
  - Keep matrix as plan-only artifact; no deletion in this task.

---

## Approval Gate (Base Required)

- [ ] Spec self-reviewed by Codex
- [ ] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- ...

Commands run (only if user asked or required by spec):
- ...

## Gate Results (Codex fills)

- Lint:
  - PASS | FAIL | N/A
- Build:
  - PASS | FAIL | N/A
- Script checks:
  - PASS | FAIL | N/A

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - ...
- Newly introduced failures:
  - ...
- Blocking:
  - YES / NO
- Mitigation:
  - ...

Manual verification notes:
- ...

Notes:
- ...
