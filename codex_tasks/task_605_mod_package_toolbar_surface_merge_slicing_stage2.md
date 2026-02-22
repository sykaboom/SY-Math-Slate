# Task 605: mod-package toolbar surface merge slicing (stage2)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `toolbarPlan/surfaceRules/merge.ts`를 facade + helper로 분해한다.
- What must NOT change:
  - toolbar surface merge order/base-package-mod-user semantics 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/selectors/toolbarPlan/surfaceRules/merge.ts`
- `v10/src/core/runtime/modding/package/selectors/toolbarPlan/surfaceRules/merge/helpers.ts`
- `codex_tasks/task_605_mod_package_toolbar_surface_merge_slicing_stage2.md`

Out of scope:
- surface rule keying contract 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - surfaceRules lane 내부 분해 only
- Compatibility:
  - exported merge function signature 유지

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W31
- Depends on tasks:
  - `task_604`
- Enables tasks:
  - `task_608`
- Parallel group:
  - G-P6-SLICE-W31-A
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
  - merge mapping helper 추출.

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

- [x] AC-1: `merge.ts`가 facade 수준(<=40 lines)으로 축소된다.
- [x] AC-2: merge helper가 분리된다.
- [x] AC-3: lint/build PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `wc -l v10/src/core/runtime/modding/package/selectors/toolbarPlan/surfaceRules/merge.ts`
   - Expected result:
     - <= 40
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
  - rule surface map composition drift 가능.
- Roll-back:
  - 기존 단일 `merge.ts`로 즉시 revert.

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
- `v10/src/core/runtime/modding/package/selectors/toolbarPlan/surfaceRules/merge/helpers.ts`
- `codex_tasks/task_605_mod_package_toolbar_surface_merge_slicing_stage2.md`

Commands run:
- `wc -l v10/src/core/runtime/modding/package/selectors/toolbarPlan/surfaceRules/merge.ts`
- `bash scripts/check_v10_large_file_budget.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `bash scripts/run_repo_verifications.sh --stage end`

Manual verification notes:
- `merge.ts` line count is `37` (<= 40).
- Surface merge semantics unchanged (base/package/mod/user lane merge via existing `mergeUIItemsByResourceLayerLoadOrder` preserved).
