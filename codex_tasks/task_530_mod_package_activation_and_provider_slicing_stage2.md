# Task 530: mod package activation/provider slicing (stage2)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `selectors/packageSelection/activationMapping.ts`와 `selectors/toolbarPlan/provider.ts`를 하위 모듈로 분리한다.
  - activation map/provider resolution 계산을 파일 단위로 분해해 유지보수성을 높인다.
- What must NOT change:
  - toolbar resolved plan 결과/활성 패키지 선택 semantics 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/selectors/packageSelection/activationMapping.ts`
- `v10/src/core/runtime/modding/package/selectors/toolbarPlan/provider.ts`
- `v10/src/core/runtime/modding/package/selectors/packageSelection/activationMapping/` (new)
- `v10/src/core/runtime/modding/package/selectors/toolbarPlan/provider/` (new)
- `codex_tasks/task_530_mod_package_activation_and_provider_slicing_stage2.md`

Out of scope:
- package registry/guard 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - selectors 내부 경계 유지
- Compatibility:
  - 기존 import path/facade 유지

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W9
- Depends on tasks:
  - `task_527`
- Enables tasks:
  - `task_532`
- Parallel group:
  - G-P6-SLICE-W9-C
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
  - 높은 수정빈도 selector를 세분화하는 보수작업.

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

- [x] AC-1: activation/provider facade는 re-export only.
- [x] AC-2: 하위 모듈 분리 후 `check_mod_contract`, lint, build PASS.
- [x] AC-3: runtime regression matrix 경고/실패 없음.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `rg -n "^export \* from" v10/src/core/runtime/modding/package/selectors/packageSelection/activationMapping.ts v10/src/core/runtime/modding/package/selectors/toolbarPlan/provider.ts`
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
  - provider chain import cycle 가능성.
- Roll-back:
  - facade 이전 단일파일로 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/selectors/packageSelection/activationMapping.ts`
- `v10/src/core/runtime/modding/package/selectors/packageSelection/activationMapping/index.ts`
- `v10/src/core/runtime/modding/package/selectors/packageSelection/activationMapping/base.ts`
- `v10/src/core/runtime/modding/package/selectors/packageSelection/activationMapping/active.ts`
- `v10/src/core/runtime/modding/package/selectors/packageSelection/activationMapping/reverse.ts`
- `v10/src/core/runtime/modding/package/selectors/toolbarPlan/provider.ts`
- `v10/src/core/runtime/modding/package/selectors/toolbarPlan/provider/index.ts`
- `v10/src/core/runtime/modding/package/selectors/toolbarPlan/provider/constants.ts`
- `v10/src/core/runtime/modding/package/selectors/toolbarPlan/provider/baseProvider.ts`
- `v10/src/core/runtime/modding/package/selectors/toolbarPlan/provider/plan.ts`

Commands run:
- `bash scripts/check_mod_contract.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
