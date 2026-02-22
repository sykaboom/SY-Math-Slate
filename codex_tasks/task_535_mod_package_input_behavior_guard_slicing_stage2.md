# Task 535: mod package input behavior guard slicing (stage2)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `guards/resourcePolicy/inputBehaviorRule.ts`를 parser/validator/normalize 모듈로 분리한다.
  - guard fail 코드/메시지 contract는 동일 유지한다.
- What must NOT change:
  - inputBehavior 검증 semantics 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/guards/resourcePolicy/inputBehaviorRule.ts`
- `v10/src/core/runtime/modding/package/guards/resourcePolicy/inputBehaviorRule/` (new)
- `codex_tasks/task_535_mod_package_input_behavior_guard_slicing_stage2.md`

Out of scope:
- shortcut/command guard 파일 수정

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - guards/resourcePolicy 내부 경계 유지
- Compatibility:
  - parseInputBehaviorRule export 시그니처 동일

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W10
- Depends on tasks:
  - `task_532`
- Enables tasks:
  - `task_536`
- Parallel group:
  - G-P6-SLICE-W10-C
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
  - guard parser 분리 작업으로 영향 범위 제한적.

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

- [x] AC-1: `inputBehaviorRule.ts`는 facade re-export only.
- [x] AC-2: parseInputBehaviorRule 시그니처/에러 코드 유지.
- [x] AC-3: lint/build/check_mod_contract PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `rg -n "^export \* from" v10/src/core/runtime/modding/package/guards/resourcePolicy/inputBehaviorRule.ts`
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
  - chain/modId 검증 분기 누락.
- Roll-back:
  - inputBehaviorRule.ts 단일파일로 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/guards/resourcePolicy/inputBehaviorRule.ts`
- `v10/src/core/runtime/modding/package/guards/resourcePolicy/inputBehaviorRule/index.ts`
- `v10/src/core/runtime/modding/package/guards/resourcePolicy/inputBehaviorRule/normalize.ts`
- `v10/src/core/runtime/modding/package/guards/resourcePolicy/inputBehaviorRule/parse.ts`

Commands run:
- `bash scripts/check_mod_contract.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
