# Task 544: mod package resource shortcut merge slicing (stage2)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `selectors/resourceShortcutMerge/merge.ts`를 facade + merge 단계 모듈로 분리한다.
  - shortcut merge semantics/winner-loser diagnostics를 유지한다.
- What must NOT change:
  - merge key, operation(remove/upsert), diagnostics 규칙 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/selectors/resourceShortcutMerge/merge.ts`
- `v10/src/core/runtime/modding/package/selectors/resourceShortcutMerge/merge/` (new)
- `codex_tasks/task_544_mod_package_resource_shortcut_merge_slicing_stage2.md`

Out of scope:
- command merge, item merge, load-order 상수 수정

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - resourceShortcutMerge 레이어 내부 분리만 허용
- Compatibility:
  - `mergeShortcutsByResourceLayerLoadOrder` 시그니처 유지

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W13
- Depends on tasks:
  - `task_542`
- Enables tasks:
  - `task_545`
- Parallel group:
  - G-P6-SLICE-W13-B
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
  - merge 단계 분리로 로직 가독성 개선.

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

- [x] AC-1: `merge.ts`는 facade re-export only.
- [x] AC-2: shortcut merge diagnostics semantics 회귀 없음.
- [x] AC-3: lint/build/check_mod_contract PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `rg -n "^export \* from" v10/src/core/runtime/modding/package/selectors/resourceShortcutMerge/merge.ts`
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
  - remove/upsert 진단 이벤트 누락.
- Roll-back:
  - merge.ts 단일파일로 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/selectors/resourceShortcutMerge/merge.ts`
- `v10/src/core/runtime/modding/package/selectors/resourceShortcutMerge/merge/index.ts`
- `v10/src/core/runtime/modding/package/selectors/resourceShortcutMerge/merge/run.ts`
- `v10/src/core/runtime/modding/package/selectors/resourceShortcutMerge/merge/operations.ts`
- `codex_tasks/task_544_mod_package_resource_shortcut_merge_slicing_stage2.md`

Commands run:
- `bash scripts/check_v10_large_file_budget.sh`
- `bash scripts/check_mod_contract.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`

Manual verification notes:
- `merge.ts` facade-only re-export 확인
- remove/upsert merge semantics 및 diagnostics 유지
- guard/lint/build PASS
