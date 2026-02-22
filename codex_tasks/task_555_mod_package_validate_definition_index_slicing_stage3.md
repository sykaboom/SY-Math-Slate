# Task 555: mod package validate-definition index slicing (stage3)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `guards/validateDefinition/index.ts`를 facade + validation entry 모듈로 분리한다.
  - validate/predicate semantics를 유지한다.
- What must NOT change:
  - validation pipeline order 및 error propagation 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/guards/validateDefinition/index.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/index/` (new)
- `codex_tasks/task_555_mod_package_validate_definition_index_slicing_stage3.md`

Out of scope:
- baseFields/activation/uiAndResourcePolicy parser semantics 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - validateDefinition/index 내부 분리만 허용
- Compatibility:
  - exported validator signatures 유지

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W17
- Depends on tasks:
  - `task_554`
- Enables tasks:
  - `task_557`
- Parallel group:
  - G-P6-SLICE-W17-A
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
  - guard entry split으로 회귀 위험 낮음.

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

- [x] AC-1: `validateDefinition/index.ts`는 facade re-export only.
- [x] AC-2: validation pipeline semantics 회귀 없음.
- [x] AC-3: lint/build/check_mod_contract PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `rg -n "^export" v10/src/core/runtime/modding/package/guards/validateDefinition/index.ts`
   - Expected result:
     - facade export only.
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
  - optional dependencies/conflicts parse 분기 누락.
- Roll-back:
  - index.ts 단일파일로 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/guards/validateDefinition/index.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/index/validate.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/index/predicate.ts`
- `codex_tasks/task_555_mod_package_validate_definition_index_slicing_stage3.md`

Commands run:
- `rg -n "^export" v10/src/core/runtime/modding/package/guards/validateDefinition/index.ts`
- `bash scripts/check_mod_contract.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`

Manual verification notes:
- facade는 export-only로 축소되었고, validate/predicate 로직은 `validateDefinition/index/*` 내부로 분리됨.
- lint/build/mod-contract 모두 PASS.
