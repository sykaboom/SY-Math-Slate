# Task 541: mod package command merge operations slicing (stage4)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `selectors/resourceCommandMerge/merge/operations.ts`를 facade + 세부 merge 단계 모듈로 분리한다.
  - command merge diagnostics semantics는 유지한다.
- What must NOT change:
  - winner/loser/blocked 진단 contract 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/selectors/resourceCommandMerge/merge/operations.ts`
- `v10/src/core/runtime/modding/package/selectors/resourceCommandMerge/merge/operations/` (new)
- `codex_tasks/task_541_mod_package_command_merge_operations_slicing_stage4.md`

Out of scope:
- `run.ts` 알고리즘 변경, item merge 수정

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - resourceCommandMerge 내부 분리만 허용
- Compatibility:
  - `applyRemoveCommandRule`, `applyUpsertCommandRule`, `toCommandMergeResult` 시그니처 유지

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W12
- Depends on tasks:
  - `task_539`
- Enables tasks:
  - `task_542`
- Parallel group:
  - G-P6-SLICE-W12-B
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 4~8
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
  - command merge ops 단일파일 슬라이싱으로 회귀 범위 제한.

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

- [x] AC-1: `operations.ts`는 facade re-export only.
- [x] AC-2: command merge diagnostics semantics 회귀 없음.
- [x] AC-3: lint/build/check_mod_contract PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `rg -n "^export \* from" v10/src/core/runtime/modding/package/selectors/resourceCommandMerge/merge/operations.ts`
   - Expected result:
     - facade re-export only.
   - Covers: AC-1

2) Step:
   - Command / click path:
     - `bash scripts/check_mod_contract.sh && cd v10 && npm run lint && npm run build`
   - Expected result:
     - PASS.
   - Covers: AC-2, AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - remove/upsert 진단 분기 누락.
- Roll-back:
  - operations.ts 단일파일로 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/selectors/resourceCommandMerge/merge/operations.ts`
- `v10/src/core/runtime/modding/package/selectors/resourceCommandMerge/merge/operations/index.ts`
- `v10/src/core/runtime/modding/package/selectors/resourceCommandMerge/merge/operations/removeRule.ts`
- `v10/src/core/runtime/modding/package/selectors/resourceCommandMerge/merge/operations/upsertRule.ts`
- `v10/src/core/runtime/modding/package/selectors/resourceCommandMerge/merge/operations/result.ts`
- `codex_tasks/task_541_mod_package_command_merge_operations_slicing_stage4.md`

Commands run:
- `bash scripts/check_v10_large_file_budget.sh`
- `bash scripts/check_mod_contract.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`

Manual verification notes:
- facade re-export only 확인 (`operations.ts`)
- winner/loser/blocked diagnostics contract 회귀 없음
- guard/lint/build PASS
