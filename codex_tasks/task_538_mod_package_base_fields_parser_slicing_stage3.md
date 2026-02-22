# Task 538: mod package base fields parser slicing (stage3)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `guards/validateDefinition/baseFields/parse.ts`를 단계별 파서 모듈로 분리한다.
  - `parseValidationBase` 결과 타입과 에러 contract는 유지한다.
- What must NOT change:
  - manifest base validation semantics 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/guards/validateDefinition/baseFields/parse.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/baseFields/parse/` (new)
- `codex_tasks/task_538_mod_package_base_fields_parser_slicing_stage3.md`

Out of scope:
- uiPolicy/inputBehaviorRule 수정

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - baseFields parser 내부 분리만 허용
- Compatibility:
  - `parseValidationBase` 시그니처 유지

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W11
- Depends on tasks:
  - `task_536`
- Enables tasks:
  - `task_539`
- Parallel group:
  - G-P6-SLICE-W11-B
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
  - 단일 parser 단계 분할이라 회귀 범위 제한.

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

- [x] AC-1: `baseFields/parse.ts`는 facade re-export only.
- [x] AC-2: `parseValidationBase` semantics 회귀 없음.
- [x] AC-3: lint/build/check_mod_contract PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `rg -n "^export \* from" v10/src/core/runtime/modding/package/guards/validateDefinition/baseFields/parse.ts`
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
  - modIds/defaultModId 검증 누락.
- Roll-back:
  - parse.ts 단일파일로 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/guards/validateDefinition/baseFields/parse.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/baseFields/parse/index.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/baseFields/parse/rootFields.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/baseFields/parse/modIds.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/baseFields/parse/activation.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/baseFields/parse/parse.ts`
- `codex_tasks/task_538_mod_package_base_fields_parser_slicing_stage3.md`

Commands run:
- `bash scripts/check_v10_large_file_budget.sh`
- `bash scripts/check_mod_contract.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `bash scripts/run_repo_verifications.sh --stage end`

Manual verification notes:
- facade file re-export only 확인 (`baseFields/parse.ts`)
- base fields parser semantic regression 없음 (modIds/defaultModId/activation parse path 유지)
- guard/lint/build/repo verification 전부 PASS
