# Task 572: mod-package toolbar-plan plan-resolution slicing (stage4)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `selectors/toolbarPlan/planResolution.ts`를 facade로 축소하고 mode section resolver를 분리한다.
- What must NOT change:
  - resolved toolbar plan 결과 semantics 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/selectors/toolbarPlan/planResolution.ts`
- `v10/src/core/runtime/modding/package/selectors/toolbarPlan/planResolution/`
- `codex_tasks/task_572_mod_package_toolbar_plan_resolution_slicing_stage4.md`

Out of scope:
- surface rule merge behavior 변경
- toolbar mode policy/renderer 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - selector layer 내부 분해 only
- Compatibility:
  - `resolveToolbarPlanFromActionSurfaceRules` signature 유지

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W22
- Depends on tasks:
  - `task_570`
- Enables tasks:
  - `task_573`
- Parallel group:
  - G-P6-SLICE-W22-B
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 3~5
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
  - boolean plan flag builder 분해로 가독성/재사용성 강화.

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

- [x] AC-1: `planResolution.ts`가 facade 수준(<=40 lines)으로 축소된다.
- [x] AC-2: mode section plan builder가 하위 모듈로 분해된다.
- [x] AC-3: lint/build PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `wc -l v10/src/core/runtime/modding/package/selectors/toolbarPlan/planResolution.ts`
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
  - draw/playback/canvas/more flag mapping 누락 가능.
- Roll-back:
  - planResolution 단일 파일로 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/selectors/toolbarPlan/planResolution.ts`
- `v10/src/core/runtime/modding/package/selectors/toolbarPlan/planResolution/surfacePredicates.ts`
- `v10/src/core/runtime/modding/package/selectors/toolbarPlan/planResolution/sections.ts`
- `codex_tasks/task_572_mod_package_toolbar_plan_resolution_slicing_stage4.md`

Commands run:
- `wc -l v10/src/core/runtime/modding/package/selectors/toolbarPlan/planResolution.ts`
- `bash scripts/check_layer_rules.sh`
- `bash scripts/check_mod_contract.sh`
- `bash scripts/check_v10_large_file_budget.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `bash scripts/run_repo_verifications.sh --stage end`

Manual verification notes:
- `planResolution.ts` line count is `33`; mode section/condition builder internals moved under `planResolution/*`.
