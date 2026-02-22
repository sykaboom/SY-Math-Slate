# Task 529: mod package ui/resource policy merge slicing (stage2)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `selectors/resourcePolicyMerge.ts`, `selectors/resourceShortcutMerge.ts`, `selectors/resourceInputBehaviorMerge.ts`를 하위 모듈로 분리한다.
  - merge semantics(override/add/remove) 로직은 변경 없이 위치만 정리한다.
- What must NOT change:
  - resolver 결과/정책 해석/동작 변화 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/selectors/resourcePolicyMerge.ts`
- `v10/src/core/runtime/modding/package/selectors/resourceShortcutMerge.ts`
- `v10/src/core/runtime/modding/package/selectors/resourceInputBehaviorMerge.ts`
- `v10/src/core/runtime/modding/package/selectors/resourcePolicyMerge/` (new)
- `v10/src/core/runtime/modding/package/selectors/resourceShortcutMerge/` (new)
- `v10/src/core/runtime/modding/package/selectors/resourceInputBehaviorMerge/` (new)
- `codex_tasks/task_529_mod_package_ui_resource_policy_merge_slicing_stage2.md`

Out of scope:
- toolbar plan/package selection 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - selectors 계층 내부 분리만 허용
- Compatibility:
  - facade 경로 유지

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W9
- Depends on tasks:
  - `task_527`
- Enables tasks:
  - `task_532`
- Parallel group:
  - G-P6-SLICE-W9-B
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 8~12
- Files shared with other PENDING tasks:
  - none
- Cross-module dependency:
  - NO
- Parallelizable sub-units:
  - 0
- Estimated single-agent duration:
  - `~30min`
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - YES
- Rationale:
  - 동일 계층 split이며 외부 contract 유지가 핵심.

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

- [x] AC-1: 3개 facade 파일은 재-export only.
- [x] AC-2: 하위 모듈 분리 후 lint/build/check_mod_contract PASS.
- [x] AC-3: merge 결과 회귀 없음(기존 테스트/가드 통과).

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `rg -n "^export \* from" v10/src/core/runtime/modding/package/selectors/resource*Merge.ts`
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
  - merge helper 이동 중 import 누락.
- Roll-back:
  - 3개 selector 파일 단일파일로 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/selectors/resourcePolicyMerge.ts`
- `v10/src/core/runtime/modding/package/selectors/resourcePolicyMerge/index.ts`
- `v10/src/core/runtime/modding/package/selectors/resourcePolicyMerge/types.ts`
- `v10/src/core/runtime/modding/package/selectors/resourcePolicyMerge/helpers.ts`
- `v10/src/core/runtime/modding/package/selectors/resourcePolicyMerge/merge.ts`
- `v10/src/core/runtime/modding/package/selectors/resourceShortcutMerge.ts`
- `v10/src/core/runtime/modding/package/selectors/resourceShortcutMerge/index.ts`
- `v10/src/core/runtime/modding/package/selectors/resourceShortcutMerge/types.ts`
- `v10/src/core/runtime/modding/package/selectors/resourceShortcutMerge/helpers.ts`
- `v10/src/core/runtime/modding/package/selectors/resourceShortcutMerge/merge.ts`
- `v10/src/core/runtime/modding/package/selectors/resourceInputBehaviorMerge.ts`
- `v10/src/core/runtime/modding/package/selectors/resourceInputBehaviorMerge/index.ts`
- `v10/src/core/runtime/modding/package/selectors/resourceInputBehaviorMerge/types.ts`
- `v10/src/core/runtime/modding/package/selectors/resourceInputBehaviorMerge/helpers.ts`
- `v10/src/core/runtime/modding/package/selectors/resourceInputBehaviorMerge/merge.ts`

Commands run:
- `bash scripts/check_mod_contract.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
