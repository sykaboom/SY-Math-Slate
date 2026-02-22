# Task 533: mod package registry class slicing (stage2)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `registry/classRegistry.ts`를 facade + 하위 모듈(class/comparators/types)로 분리한다.
  - public API(`ModPackageRegistry`, register result types)는 유지한다.
- What must NOT change:
  - registry 정렬/우선순위/등록 검증 semantics 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/registry/classRegistry.ts`
- `v10/src/core/runtime/modding/package/registry/classRegistry/` (new)
- `codex_tasks/task_533_mod_package_registry_class_slicing_stage2.md`

Out of scope:
- selectors/guards 수정

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - registry 경계 유지, 외부 import contract 유지
- Compatibility:
  - `../registry` 경로 호출자 영향 0

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W10
- Depends on tasks:
  - `task_532`
- Enables tasks:
  - `task_536`
- Parallel group:
  - G-P6-SLICE-W10-A
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 4~7
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
  - class 분리 중심으로 회귀 범위가 작다.

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

- [x] AC-1: `classRegistry.ts`는 facade re-export only.
- [x] AC-2: registry API 타입/동작 호환 유지.
- [x] AC-3: lint/build/check_mod_contract PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `rg -n "^export \* from" v10/src/core/runtime/modding/package/registry/classRegistry.ts`
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
  - class method export 누락 시 registry 호출 경로 break.
- Roll-back:
  - classRegistry.ts 단일파일로 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/registry/classRegistry.ts`
- `v10/src/core/runtime/modding/package/registry/classRegistry/index.ts`
- `v10/src/core/runtime/modding/package/registry/classRegistry/types.ts`
- `v10/src/core/runtime/modding/package/registry/classRegistry/comparators.ts`
- `v10/src/core/runtime/modding/package/registry/classRegistry/registryClass.ts`

Commands run:
- `bash scripts/check_mod_contract.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
