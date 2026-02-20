# Task 348: Mod Package Docs Rollout + Operator Guide

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-20

---

## Goal (Base Required)
- What to change:
  - Document canonical `Mod` vs `ModPackage` ownership and rollout operations.
  - Update architecture and AI-readme docs to remove naming confusion.
- What must NOT change:
  - runtime code behavior.

---

## Scope (Base Required)

Touched files/directories:
- `v10/docs/architecture/ModeEngine.md` -> `v10/docs/architecture/ModEngine.md` (rename + content sync)
- `v10/AI_READ_ME.md`
- `v10/AI_READ_ME_MAP.md`
- `PROJECT_ROADMAP.md`
- `codex_tasks/workflow/*` (operator notes)

Out of scope:
- runtime implementation changes.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - docs must reflect actual paths (`core/mod/*`, `src/mod/*`) and migration status.
  - rename migration must leave no stale canonical reference to `ModeEngine.md`.
- Compatibility:
  - preserve prior historical references with ARCHIVE markers where needed.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W348
- Depends on tasks:
  - [`task_347_mod_package_regression_matrix_and_runtime_checks`]
- Enables tasks:
  - `task_349_legacy_dual_axis_retirement`
- Parallel group:
  - G7-docs
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `mid`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 4
- Files shared with other PENDING tasks:
  - none
- Cross-module dependency:
  - NO
- Parallelizable sub-units:
  - 2
- Estimated single-agent duration:
  - ~20min
- Recommended mode:
  - DELEGATED
- Batch-eligible:
  - YES
- Rationale:
  - doc-only work can run in parallel lanes and be merged safely.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: YES / NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES / NO
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - architecture docs + ai readme sync
  - Assigned roles:
    - Implementer-A: architecture doc
    - Implementer-B: ai readme/map
    - Reviewer+Verifier: Codex
  - File ownership lock plan:
    - doc files split by owner
  - Parallel slot plan:
    - 2 slots
  - Scheduler plan (required in delegated mode):
    - Slot allocation mode:
      - DYNAMIC
    - Slot priority rule (DYNAMIC only):
      - architecture-first then map generation
    - Requested orchestration mode:
      - max orchestration mode on

---

## Optional Block C — Hotfix Exception

- [ ] Applies: YES / NO

---

## Optional Block D — Speculative Defense Check

- [x] Applies: YES / NO
- If YES:
  - Evidence (real input, spec, or bug report):
    - repeated confusion from `mode` vs `mod` naming and dual-axis runtime docs.
  - Sunset criteria:
    - docs and architecture map consistently describe package-first runtime.

---

## Optional Block E — Documentation Update Check

- [x] Applies: YES / NO
- If YES:
  - [x] Structure changes (file/folder add/move/delete):
    - Run `node scripts/gen_ai_read_me_map.mjs`
  - [x] Semantic/rule changes:
    - verify `v10/AI_READ_ME.md`

---

## Acceptance Criteria (Base Required)

- [x] AC-1: docs define `Mod` vs `ModPackage` contracts and current migration phase.
- [x] AC-2: AI readme/map include package layer and routing ownership.
- [x] AC-3: operator guide contains rollback and cutover checkpoints.
- [x] AC-4: architecture doc canonical path is `v10/docs/architecture/ModEngine.md`, and roadmap references are synced to the new name.
- [x] AC-5: `PROJECT_ROADMAP.md` is updated to include the 336~349 purpose and current phase boundaries.

---

## Manual Verification Steps (Base Required)

1) architecture review
   - Command / click path:
     - inspect ModEngine architecture sections (`v10/docs/architecture/ModEngine.md`)
   - Expected result:
     - package-first ownership is explicit
   - Covers: AC-1

2) ai map sync
   - Command / click path:
     - `node scripts/gen_ai_read_me_map.mjs`
   - Expected result:
     - map includes package paths
   - Covers: AC-2

3) canonical path check
   - Command / click path:
     - `rg -n "ModeEngine\\.md|ModEngine\\.md" v10 PROJECT_ROADMAP.md codex_tasks`
   - Expected result:
     - canonical docs point to `ModEngine.md`; legacy mentions are archived-only.
   - Covers: AC-4

4) roadmap sync check
   - Command / click path:
     - read `PROJECT_ROADMAP.md`
   - Expected result:
     - includes ModPackage/input-routing migration wave (`task_336~349`) summary and phase mapping.
   - Covers: AC-5

5) operator checklist
   - Command / click path:
     - inspect workflow notes
   - Expected result:
     - cutover/rollback checkpoints present
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - docs diverge from runtime if prior tasks are changed later.
- Roll-back:
  - rerun docs sync after final runtime merge.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/docs/architecture/ModeEngine.md` (deleted; canonical path moved)
- `v10/docs/architecture/ModEngine.md` (new canonical architecture doc; Mod/ModPackage sync + migration phase map)
- `v10/AI_READ_ME.md` (canonical architecture path + package/runtime ownership updates)
- `v10/AI_READ_ME_MAP.md` (regenerated map output)
- `PROJECT_ROADMAP.md` (added `task_336~349` purpose + phase mapping track)
- `codex_tasks/workflow/mod_package_docs_rollout_operator_guide.md` (operator cutover/rollback checkpoints)
- `codex_tasks/task_348_mod_package_docs_rollout_and_operator_guide.md` (closeout log)

Commands run (only if user asked or required by spec):
- `node scripts/gen_ai_read_me_map.mjs`
- `bash scripts/check_layer_rules.sh`
- `bash scripts/check_mod_contract.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - PASS

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - none
- Newly introduced failures:
  - none
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- `v10/docs/architecture/ModEngine.md` now defines `Mod` vs `ModPackage`, package-first ownership, and `task_336~349` migration phase boundaries.
- `v10/AI_READ_ME.md` now points to `v10/docs/architecture/ModEngine.md` as canonical architecture source and documents package/runtime ownership paths.
- `PROJECT_ROADMAP.md` now includes purpose + phase mapping for `task_336~349` and explicit current boundary (`task_348` -> `task_349`).
- `codex_tasks/workflow/mod_package_docs_rollout_operator_guide.md` adds cutover and rollback checkpoints for docs rollout.
- Canonical path check confirms active docs use `ModEngine.md`; legacy `ModeEngine.md` mentions remain historical/archive context only.
