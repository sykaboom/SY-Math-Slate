# Task 531: mod package guard/types slicing (stage1)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `guards/uiPolicy.ts`와 `guards/validateDefinition/baseFields.ts`를 책임 단위로 세분화한다.
  - guard 로직을 validate/normalize/helper 계열로 나눠 파일 크기를 낮춘다.
- What must NOT change:
  - validation 결과/에러 문구 호환성/guard semantics 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/guards/uiPolicy.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/baseFields.ts`
- `v10/src/core/runtime/modding/package/guards/uiPolicy/` (new)
- `v10/src/core/runtime/modding/package/guards/validateDefinition/baseFields/` (new)
- `codex_tasks/task_531_mod_package_guard_types_slicing_stage1.md`

Out of scope:
- selector/toolbar plan 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - guards 계층 내부 분리만 허용
- Compatibility:
  - validateDefinition 공개 API 동일 유지

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W9
- Depends on tasks:
  - `task_527`
- Enables tasks:
  - `task_532`
- Parallel group:
  - G-P6-SLICE-W9-D
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
  - guard 로직은 회귀 위험이 있어 점진 분리가 적합.

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

- [x] AC-1: uiPolicy/baseFields facade는 re-export only.
- [x] AC-2: lint/build/check_mod_contract PASS.
- [x] AC-3: validation semantics 회귀 없음.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `rg -n "^export \* from" v10/src/core/runtime/modding/package/guards/uiPolicy.ts v10/src/core/runtime/modding/package/guards/validateDefinition/baseFields.ts`
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
  - guard 조건 분리 시 edge case 누락.
- Roll-back:
  - 2개 guard 파일 단일구조로 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/guards/uiPolicy.ts`
- `v10/src/core/runtime/modding/package/guards/uiPolicy/index.ts`
- `v10/src/core/runtime/modding/package/guards/uiPolicy/parseUIItemRules.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/baseFields.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/baseFields/index.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/baseFields/types.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/baseFields/parse.ts`

Commands run:
- `bash scripts/check_mod_contract.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
