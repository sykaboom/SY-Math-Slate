# Task 573: Large-file Budget Wave22 (toolbar-plan surface/rules resolution split)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - wave22 split 반영 budget/env/script/doc 동기화.
  - facade budget tighten.
- What must NOT change:
  - 기존 wave1~21 budget semantics 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `scripts/check_v10_large_file_budget.sh`
- `codex_tasks/workflow/large_file_budget.env`
- `v10/AI_READ_ME.md`
- `v10/AI_READ_ME_MAP.md`
- `codex_tasks/task_573_large_file_budget_wave22_toolbar_plan_split.md`

Out of scope:
- toolbar runtime behavior semantics 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - budget/env/doc only
- Compatibility:
  - existing keys keep intact

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W22
- Depends on tasks:
  - `task_571`, `task_572`
- Enables tasks:
  - next wave
- Parallel group:
  - G-P6-SLICE-W22-C
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 4~6
- Files shared with other PENDING tasks:
  - none
- Cross-module dependency:
  - NO
- Parallelizable sub-units:
  - 0
- Estimated single-agent duration:
  - `~20min`
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - YES
- Rationale:
  - wave22 split 이후 budget gate 안정화.

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
- [x] Structure changes (file/folder add/move/delete)
- [x] Semantic/rule changes

---

## Acceptance Criteria (Base Required)

- [x] AC-1: wave22 split key/존재 체크 반영.
- [x] AC-2: `BUDGET_WAVE=W-P6-SLICE-W22` + facade threshold tighten.
- [x] AC-3: `bash scripts/check_v10_large_file_budget.sh` PASS.
- [x] AC-4: AI_READ_ME + MAP 최신 상태.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `bash -n scripts/check_v10_large_file_budget.sh`
   - Expected result:
     - syntax OK
   - Covers: AC-1

2) Step:
   - Command / click path:
     - `bash scripts/check_v10_large_file_budget.sh`
   - Expected result:
     - PASS + wave22 metrics
   - Covers: AC-1, AC-2, AC-3

3) Step:
   - Command / click path:
     - `node scripts/gen_ai_read_me_map.mjs --check`
   - Expected result:
     - map up-to-date
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - key mismatch로 false FAIL 가능.
- Roll-back:
  - wave22 block만 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `scripts/check_v10_large_file_budget.sh`
- `codex_tasks/workflow/large_file_budget.env`
- `v10/AI_READ_ME.md`
- `v10/AI_READ_ME_MAP.md`
- `codex_tasks/task_573_large_file_budget_wave22_toolbar_plan_split.md`

Commands run:
- `bash -n scripts/check_v10_large_file_budget.sh`
- `bash scripts/check_v10_large_file_budget.sh`
- `node scripts/gen_ai_read_me_map.mjs`
- `node scripts/gen_ai_read_me_map.mjs --check`
- `bash scripts/check_layer_rules.sh`
- `bash scripts/check_mod_contract.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `bash scripts/run_repo_verifications.sh --stage end`

Manual verification notes:
- `BUDGET_WAVE` updated to `W-P6-SLICE-W22`.
- facade budgets tightened to 40 for `surfaceRules.ts` and `planResolution.ts`.
- wave22 subfile metrics (`surfaceRules/*`, `planResolution/*`) were added and verified PASS.
