# Task 540: mod package ui policy validators slicing (stage4)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `guards/uiPolicy/parseUIItemRules/validators.ts`를 facade + 세부 validator 모듈로 분리한다.
  - ui policy validation semantics는 유지한다.
- What must NOT change:
  - 에러 코드/path/message 및 normalize 동작 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/guards/uiPolicy/parseUIItemRules/validators.ts`
- `v10/src/core/runtime/modding/package/guards/uiPolicy/parseUIItemRules/validators/` (new)
- `codex_tasks/task_540_mod_package_ui_policy_validators_slicing_stage4.md`

Out of scope:
- `parse.ts`, baseFields parser, resourcePolicy parser 수정

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - uiPolicy parser 내부 분리만 허용
- Compatibility:
  - `validateUIItemRuleRecord`, `validateUIItemBaseFields`, `applyOptionalFields` 시그니처 유지

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W12
- Depends on tasks:
  - `task_539`
- Enables tasks:
  - `task_542`
- Parallel group:
  - G-P6-SLICE-W12-A
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
  - 단일 validator 파일 슬라이싱으로 회귀 범위 제한.

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

- [x] AC-1: `validators.ts`는 facade re-export only.
- [x] AC-2: ui policy validation semantics 회귀 없음.
- [x] AC-3: lint/build/check_mod_contract PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `rg -n "^export \* from" v10/src/core/runtime/modding/package/guards/uiPolicy/parseUIItemRules/validators.ts`
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
  - optional key/number/bool parsing 누락.
- Roll-back:
  - validators.ts 단일파일로 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/guards/uiPolicy/parseUIItemRules/validators.ts`
- `v10/src/core/runtime/modding/package/guards/uiPolicy/parseUIItemRules/validators/index.ts`
- `v10/src/core/runtime/modding/package/guards/uiPolicy/parseUIItemRules/validators/validateRecord.ts`
- `v10/src/core/runtime/modding/package/guards/uiPolicy/parseUIItemRules/validators/validateBaseFields.ts`
- `v10/src/core/runtime/modding/package/guards/uiPolicy/parseUIItemRules/validators/applyOptionalFields.ts`
- `codex_tasks/task_540_mod_package_ui_policy_validators_slicing_stage4.md`

Commands run:
- `bash scripts/check_v10_large_file_budget.sh`
- `bash scripts/check_mod_contract.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`

Manual verification notes:
- facade re-export only 확인 (`validators.ts`)
- ui item rule validation semantics 회귀 없음
- guard/lint/build PASS
