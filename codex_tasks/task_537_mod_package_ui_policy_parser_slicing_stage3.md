# Task 537: mod package ui policy parser slicing (stage3)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `guards/uiPolicy/parseUIItemRules.ts`를 facade + 하위 검증 모듈로 분리한다.
  - ui item rule validation semantics는 유지한다.
- What must NOT change:
  - 실패 코드/경로/메시지 및 normalize 규칙 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/guards/uiPolicy/parseUIItemRules.ts`
- `v10/src/core/runtime/modding/package/guards/uiPolicy/parseUIItemRules/` (new)
- `codex_tasks/task_537_mod_package_ui_policy_parser_slicing_stage3.md`

Out of scope:
- baseFields, inputBehaviorRule 수정

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - guards/uiPolicy 내부 분리만 허용
- Compatibility:
  - `parseUIItemRules` export 시그니처 유지

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W11
- Depends on tasks:
  - `task_536`
- Enables tasks:
  - `task_539`
- Parallel group:
  - G-P6-SLICE-W11-A
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
  - parser 단일 파일 슬라이싱으로 회귀 범위 제한.

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

- [x] AC-1: `parseUIItemRules.ts`는 facade re-export only.
- [x] AC-2: validation/normalize semantics 회귀 없음.
- [x] AC-3: lint/build/check_mod_contract PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `rg -n "^export \* from" v10/src/core/runtime/modding/package/guards/uiPolicy/parseUIItemRules.ts`
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
  - optional field 검증 누락.
- Roll-back:
  - parseUIItemRules.ts 단일파일로 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/guards/uiPolicy/parseUIItemRules.ts`
- `v10/src/core/runtime/modding/package/guards/uiPolicy/parseUIItemRules/index.ts`
- `v10/src/core/runtime/modding/package/guards/uiPolicy/parseUIItemRules/constants.ts`
- `v10/src/core/runtime/modding/package/guards/uiPolicy/parseUIItemRules/validators.ts`
- `v10/src/core/runtime/modding/package/guards/uiPolicy/parseUIItemRules/parse.ts`
- `codex_tasks/task_537_mod_package_ui_policy_parser_slicing_stage3.md`

Commands run:
- `bash scripts/check_v10_large_file_budget.sh`
- `bash scripts/check_mod_contract.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `bash scripts/run_repo_verifications.sh --stage end`

Manual verification notes:
- facade file re-export only 확인 (`parseUIItemRules.ts`)
- guard/lint/build/repo verification 전부 PASS
