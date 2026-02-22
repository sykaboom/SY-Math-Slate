# Task 528: mod package types slicing (stage1)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `core/runtime/modding/package/types.ts`의 대형 타입 집합을 기능별 하위 모듈로 분리한다.
  - 기존 import 경로는 facade 재-export로 호환 유지한다.
- What must NOT change:
  - 타입 시그니처/런타임 동작/외부 API 이름 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/types.ts`
- `v10/src/core/runtime/modding/package/types/` (new)
- `codex_tasks/task_528_mod_package_types_slicing_stage1.md`

Out of scope:
- selectors/guards/registry 로직 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - runtime/modding/package 경계 유지
  - facade(`types.ts`)는 re-export only
- Compatibility:
  - `from ".../package/types"` 호출자 영향 0

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W9
- Depends on tasks:
  - `task_527`
- Enables tasks:
  - `task_532`
- Parallel group:
  - G-P6-SLICE-W9-A
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 3~6
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
  - 타입 전용 분리라 충돌 리스크가 낮다.

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

- [x] AC-1: `types.ts`는 re-export facade만 수행한다.
- [x] AC-2: 신규 `types/` 하위 모듈로 분리되어 타입 가독성이 개선된다.
- [x] AC-3: lint/build/check_mod_contract PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `rg -n "^export \* from" v10/src/core/runtime/modding/package/types.ts`
   - Expected result:
     - facade re-export only.
   - Covers: AC-1

2) Step:
   - Command / click path:
     - `bash scripts/check_mod_contract.sh && cd v10 && npm run lint && npm run build`
   - Expected result:
     - PASS.
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - export 누락 시 타입 import break.
- Roll-back:
  - `types.ts` 단일파일 구조로 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/types.ts`
- `v10/src/core/runtime/modding/package/types/index.ts`
- `v10/src/core/runtime/modding/package/types/modes.ts`
- `v10/src/core/runtime/modding/package/types/loadOrder.ts`
- `v10/src/core/runtime/modding/package/types/json.ts`
- `v10/src/core/runtime/modding/package/types/uiPolicy.ts`
- `v10/src/core/runtime/modding/package/types/resourcePolicy.ts`
- `v10/src/core/runtime/modding/package/types/definition.ts`
- `v10/src/core/runtime/modding/package/types/diagnostics.ts`
- `v10/src/core/runtime/modding/package/types/toolbarPlan.ts`

Commands run:
- `bash scripts/check_mod_contract.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
