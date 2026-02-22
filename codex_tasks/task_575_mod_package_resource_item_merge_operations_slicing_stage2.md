# Task 575: mod-package resource-item-merge operations slicing (stage2)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `selectors/resourceItemMerge/merge/operations.ts`를 facade로 축소하고 remove/upsert/result blocks를 분리한다.
- What must NOT change:
  - ui-item merge diagnostics semantics 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/selectors/resourceItemMerge/merge/operations.ts`
- `v10/src/core/runtime/modding/package/selectors/resourceItemMerge/merge/operations/`
- `codex_tasks/task_575_mod_package_resource_item_merge_operations_slicing_stage2.md`

Out of scope:
- merge/run path 변경
- diagnostics schema 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - resourceItemMerge lane 내부 분해 only
- Compatibility:
  - exported functions/signatures unchanged

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W23
- Depends on tasks:
  - `task_573`
- Enables tasks:
  - `task_576`
- Parallel group:
  - G-P6-SLICE-W23-B
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 3~5
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
  - operations 함수군 분리로 file budget 절감.

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

- [x] AC-1: `operations.ts`가 facade 수준(<=40 lines)으로 축소된다.
- [x] AC-2: remove/upsert/result 로직이 하위 모듈로 분리된다.
- [x] AC-3: lint/build PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `wc -l v10/src/core/runtime/modding/package/selectors/resourceItemMerge/merge/operations.ts`
   - Expected result:
     - <= 40
   - Covers: AC-1

2) Step:
   - Command / click path:
     - `cd v10 && npm run lint && npm run build`
   - Expected result:
     - PASS
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - diagnostics winner/loser ordering 회귀 가능.
- Roll-back:
  - operations.ts 단일 파일로 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/selectors/resourceItemMerge/merge/operations.ts`
- `v10/src/core/runtime/modding/package/selectors/resourceItemMerge/merge/operations/remove.ts`
- `v10/src/core/runtime/modding/package/selectors/resourceItemMerge/merge/operations/upsert.ts`
- `v10/src/core/runtime/modding/package/selectors/resourceItemMerge/merge/operations/result.ts`
- `codex_tasks/task_575_mod_package_resource_item_merge_operations_slicing_stage2.md`

Commands run:
- `wc -l v10/src/core/runtime/modding/package/selectors/resourceItemMerge/merge/operations.ts`
- `bash scripts/check_v10_large_file_budget.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `bash scripts/run_repo_verifications.sh --stage end`

Manual verification notes:
- `operations.ts` line count is `3`; remove/upsert/result logic moved under `merge/operations/*`.
