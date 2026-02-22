# Task 534: mod package resource merge core slicing (stage2)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `selectors/resourceCommandMerge/merge.ts`와 `selectors/resourceItemMerge/merge.ts`를 하위 연산 모듈로 분리한다.
  - conflict/winner/loser/blocked semantics는 그대로 유지한다.
- What must NOT change:
  - merge 결과 ordering 및 diagnostics semantics 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/selectors/resourceCommandMerge/merge.ts`
- `v10/src/core/runtime/modding/package/selectors/resourceCommandMerge/merge/` (new)
- `v10/src/core/runtime/modding/package/selectors/resourceItemMerge/merge.ts`
- `v10/src/core/runtime/modding/package/selectors/resourceItemMerge/merge/` (new)
- `codex_tasks/task_534_mod_package_resource_merge_core_slicing_stage2.md`

Out of scope:
- policy/shortcut/inputBehavior merge 파일 수정

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - selectors 하위 경계 유지
- Compatibility:
  - exported merge 함수 시그니처 동일

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W10
- Depends on tasks:
  - `task_532`
- Enables tasks:
  - `task_536`
- Parallel group:
  - G-P6-SLICE-W10-B
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 6~10
- Files shared with other PENDING tasks:
  - none
- Cross-module dependency:
  - NO
- Parallelizable sub-units:
  - 0
- Estimated single-agent duration:
  - `~25min`
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - YES
- Rationale:
  - merge core를 규칙별 모듈로 분리해 후속 충돌분석 개선.

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

- [x] AC-1: 두 merge 파일의 public export 시그니처가 유지된다.
- [x] AC-2: diagnostics/winner-loser semantics 회귀 없음.
- [x] AC-3: lint/build/check_mod_contract PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `rg -n "export const merge(Commands|UIItems)ByResourceLayerLoadOrder" v10/src/core/runtime/modding/package/selectors/resource*Merge/**/*.ts`
   - Expected result:
     - 함수 export 유지.
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
  - merge 규칙 분리 중 조건 누락.
- Roll-back:
  - 각 merge.ts 단일파일 구조로 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/selectors/resourceCommandMerge/merge.ts`
- `v10/src/core/runtime/modding/package/selectors/resourceCommandMerge/merge/index.ts`
- `v10/src/core/runtime/modding/package/selectors/resourceCommandMerge/merge/model.ts`
- `v10/src/core/runtime/modding/package/selectors/resourceCommandMerge/merge/operations.ts`
- `v10/src/core/runtime/modding/package/selectors/resourceCommandMerge/merge/run.ts`
- `v10/src/core/runtime/modding/package/selectors/resourceItemMerge/merge.ts`
- `v10/src/core/runtime/modding/package/selectors/resourceItemMerge/merge/index.ts`
- `v10/src/core/runtime/modding/package/selectors/resourceItemMerge/merge/operations.ts`
- `v10/src/core/runtime/modding/package/selectors/resourceItemMerge/merge/run.ts`

Commands run:
- `bash scripts/check_mod_contract.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
