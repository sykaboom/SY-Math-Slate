# Task 543: mod package toolbar plan types slicing (stage2)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `types/toolbarPlan.ts`를 facade + domain type 모듈로 분리한다.
  - toolbar plan type contract를 유지한다.
- What must NOT change:
  - export symbol 이름/타입 의미 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/types/toolbarPlan.ts`
- `v10/src/core/runtime/modding/package/types/toolbarPlan/` (new)
- `codex_tasks/task_543_mod_package_toolbar_plan_types_slicing_stage2.md`

Out of scope:
- selector/guards/runtime behavior 수정

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - `types` 레이어 내부 분리만 허용
- Compatibility:
  - 기존 export name 100% 유지

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W13
- Depends on tasks:
  - `task_542`
- Enables tasks:
  - `task_545`
- Parallel group:
  - G-P6-SLICE-W13-A
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 5~9
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
  - type-only slicing으로 회귀 리스크 낮음.

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

- [x] AC-1: `toolbarPlan.ts`는 facade re-export only.
- [x] AC-2: `types/index.ts` 및 기존 import 경로 타입오류 없이 유지.
- [x] AC-3: lint/build/check_mod_contract PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `rg -n "^export \* from" v10/src/core/runtime/modding/package/types/toolbarPlan.ts`
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
  - re-export 누락으로 타입 import 깨짐.
- Roll-back:
  - toolbarPlan.ts 단일파일로 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/types/toolbarPlan.ts`
- `v10/src/core/runtime/modding/package/types/toolbarPlan/index.ts`
- `v10/src/core/runtime/modding/package/types/toolbarPlan/modeAndViewport.ts`
- `v10/src/core/runtime/modding/package/types/toolbarPlan/actionGroups.ts`
- `v10/src/core/runtime/modding/package/types/toolbarPlan/resolvedPlan.ts`
- `v10/src/core/runtime/modding/package/types/toolbarPlan/baseCatalog.ts`
- `v10/src/core/runtime/modding/package/types/toolbarPlan/resourceOverrides.ts`
- `codex_tasks/task_543_mod_package_toolbar_plan_types_slicing_stage2.md`

Commands run:
- `bash scripts/check_v10_large_file_budget.sh`
- `bash scripts/check_mod_contract.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`

Manual verification notes:
- `toolbarPlan.ts` facade-only re-export 확인
- 기존 toolbar plan type export path 및 타입체크 유지
- guard/lint/build PASS
