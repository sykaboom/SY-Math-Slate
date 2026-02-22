# Task 627: mod-package surface-rules merge core slicing (stage3)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `toolbarPlan/surfaceRules/merge.ts`를 facade-only로 축소하고 core lane(`merge/core.ts`)으로 분리한다.
- What must NOT change:
  - toolbar surface merge 결과(map/diagnostics)와 레이어 머지 순서 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/selectors/toolbarPlan/surfaceRules/merge.ts`
- `v10/src/core/runtime/modding/package/selectors/toolbarPlan/surfaceRules/merge/core.ts`
- `codex_tasks/task_627_mod_package_surface_rules_merge_core_slicing_stage3.md`

Out of scope:
- merge/helpers.ts merge algorithm 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - toolbar surface merge lane 내부 분리만 수행
- Compatibility:
  - `mergeToolbarActionSurfaceRulesByResourceLayerLoadOrder` 타입/동작 유지

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W36
- Depends on tasks:
  - `task_624`
- Enables tasks:
  - `task_628`
- Parallel group:
  - G-P6-SLICE-W36-C
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 3
- Files shared with other PENDING tasks:
  - none
- Cross-module dependency:
  - NO
- Parallelizable sub-units:
  - 0
- Estimated single-agent duration:
  - `~15min`
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - YES
- Rationale:
  - merge orchestration core 분리 단일 작업.

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

- [ ] Applies: NO

---

## Acceptance Criteria (Base Required)

- [x] AC-1: `toolbarPlan/surfaceRules/merge.ts`가 facade-only(<=20 lines)로 축소된다.
- [x] AC-2: merge orchestration 로직이 `toolbarPlan/surfaceRules/merge/core.ts`로 이동된다.
- [x] AC-3: lint/build PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `wc -l v10/src/core/runtime/modding/package/selectors/toolbarPlan/surfaceRules/merge.ts`
   - Expected result:
     - <= 20
   - Covers: AC-1

2) Step:
   - Command / click path:
     - `cd v10 && npm run lint && npm run build`
   - Expected result:
     - PASS
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - merge core import path 오타 가능.
- Roll-back:
  - 기존 단일 `toolbarPlan/surfaceRules/merge.ts` 구조로 즉시 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/selectors/toolbarPlan/surfaceRules/merge.ts`
- `v10/src/core/runtime/modding/package/selectors/toolbarPlan/surfaceRules/merge/core.ts`
- `codex_tasks/task_627_mod_package_surface_rules_merge_core_slicing_stage3.md`

Commands run:
- `bash scripts/check_v10_large_file_budget.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `bash scripts/run_repo_verifications.sh --stage end`

Manual verification notes:
- `merge.ts`는 core type/function 재-export facade로 축소됨.
- runtime override 조회/merge item orchestration은 `merge/core.ts`로 이동.
- lint/build/repo verification PASS.
