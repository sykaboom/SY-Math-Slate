# Task 546: mod package selection sorting-and-active slicing (stage3)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `selectors/packageSelection/sortingAndActive.ts`를 facade + 단계별 selector 모듈로 분리한다.
  - package selection semantics를 유지한다.
- What must NOT change:
  - active package fallback 규칙 및 resolution payload 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/selectors/packageSelection/sortingAndActive.ts`
- `v10/src/core/runtime/modding/package/selectors/packageSelection/sortingAndActive/` (new)
- `codex_tasks/task_546_mod_package_selection_sorting_active_slicing_stage3.md`

Out of scope:
- activationMapping selectors, registry 로직 수정

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - packageSelection 내부 분리만 허용
- Compatibility:
  - exported selector names/signatures 유지

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W14
- Depends on tasks:
  - `task_545`
- Enables tasks:
  - `task_548`
- Parallel group:
  - G-P6-SLICE-W14-A
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
  - selector-only slicing으로 회귀 위험 낮음.

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

- [x] AC-1: `sortingAndActive.ts`는 facade re-export only.
- [x] AC-2: active package selection/resolution semantics 회귀 없음.
- [x] AC-3: lint/build/check_mod_contract PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `rg -n "^export \* from" v10/src/core/runtime/modding/package/selectors/packageSelection/sortingAndActive.ts`
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
  - fallbackToPrimary 계산 경로 누락.
- Roll-back:
  - sortingAndActive.ts 단일파일로 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/selectors/packageSelection/sortingAndActive.ts`
- `v10/src/core/runtime/modding/package/selectors/packageSelection/sortingAndActive/index.ts`
- `v10/src/core/runtime/modding/package/selectors/packageSelection/sortingAndActive/comparators.ts`
- `v10/src/core/runtime/modding/package/selectors/packageSelection/sortingAndActive/selection.ts`
- `v10/src/core/runtime/modding/package/selectors/packageSelection/sortingAndActive/resolution.ts`
- `codex_tasks/task_546_mod_package_selection_sorting_active_slicing_stage3.md`

Commands run:
- `rg -n "^export \\* from" v10/src/core/runtime/modding/package/selectors/packageSelection/sortingAndActive.ts`
- `bash scripts/check_mod_contract.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`

Manual verification notes:
- facade는 단일 export only로 축소되었고, 정렬/active resolution 로직은 `sortingAndActive/*` 내부로 분리됨.
- lint/build/mod-contract 모두 PASS.
