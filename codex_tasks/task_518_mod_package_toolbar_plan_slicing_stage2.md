# Task 518: Mod Package toolbarPlan Slicing Stage 2 (facade + domain split)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `core/runtime/modding/package/selectors/toolbarPlan.ts` 단일 대형 파일(248 lines)을 facade + 도메인 모듈로 분해한다.
  - selector API surface(export 이름/동작)는 유지한다.
- What must NOT change:
  - toolbar plan 계산 결과/merge precedence/compat fallback 동작 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/selectors/toolbarPlan.ts`
- `v10/src/core/runtime/modding/package/selectors/toolbarPlan/index.ts` (new)
- `v10/src/core/runtime/modding/package/selectors/toolbarPlan/provider.ts` (new)
- `v10/src/core/runtime/modding/package/selectors/toolbarPlan/surfaceRules.ts` (new)
- `v10/src/core/runtime/modding/package/selectors/toolbarPlan/planResolution.ts` (new)
- `codex_tasks/task_518_mod_package_toolbar_plan_slicing_stage2.md`

Out of scope:
- `types.ts`, `registry.ts` 계약 변경
- toolbar renderer/host logic 변경
- env flag semantics 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - `core/runtime/modding/package/selectors/toolbarPlan/*`는 feature import 금지.
  - `selectors/toolbarPlan.ts`는 facade export-only 형태(<40 lines)로 축소.
- Compatibility:
  - 기존 import 경로(`@core/runtime/modding/package/selectors`) compile/runtime 유지.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W6
- Depends on tasks:
  - `task_517`
- Enables tasks:
  - `task_520`
- Parallel group:
  - G-P6-SLICE-W6
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 6
- Files shared with other PENDING tasks:
  - none
- Cross-module dependency:
  - NO (core-internal split)
- Parallelizable sub-units:
  - 0
- Estimated single-agent duration:
  - `~40min`
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - YES
- Rationale:
  - export compatibility + merge 동작 보존이 핵심.

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

If YES:
- Docs to update:
  - `v10/AI_READ_ME.md`

---

## Acceptance Criteria (Base Required)

- [x] AC-1: `selectors/toolbarPlan.ts`가 facade 수준(<=40 lines)으로 축소된다.
- [x] AC-2: `selectResolvedToolbarPlanInputFromRuntimeResolver` 결과가 변경되지 않는다.
- [x] AC-3: `bash scripts/check_mod_contract.sh` PASS.
- [x] AC-4: `cd v10 && npm run lint && npm run build` PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `wc -l v10/src/core/runtime/modding/package/selectors/toolbarPlan.ts`
   - Expected result:
     - 40 lines 이하.
   - Covers: AC-1

2) Step:
   - Command / click path:
     - `bash scripts/check_mod_contract.sh`
   - Expected result:
     - PASS.
   - Covers: AC-3

3) Step:
   - Command / click path:
     - `cd v10 && npm run lint && npm run build`
   - Expected result:
     - PASS.
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - helper 분리 중 fallback 동작 누락 가능.
- Roll-back:
  - `selectors/toolbarPlan.ts` + 신규 `selectors/toolbarPlan/*` 동시 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/selectors/toolbarPlan.ts`
- `v10/src/core/runtime/modding/package/selectors/toolbarPlan/index.ts`
- `v10/src/core/runtime/modding/package/selectors/toolbarPlan/provider.ts`
- `v10/src/core/runtime/modding/package/selectors/toolbarPlan/surfaceRules.ts`
- `v10/src/core/runtime/modding/package/selectors/toolbarPlan/planResolution.ts`
- `v10/AI_READ_ME.md`
- `codex_tasks/task_518_mod_package_toolbar_plan_slicing_stage2.md`

Commands run (only if user asked or required by spec):
- `wc -l v10/src/core/runtime/modding/package/selectors/toolbarPlan.ts`
- `bash scripts/check_mod_contract.sh`
- `cd v10 && npm run lint && npm run build`
- `bash scripts/check_v10_large_file_budget.sh`
- `bash scripts/run_repo_verifications.sh --stage end`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - PASS

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - none
- Newly introduced failures:
  - none
- Blocking:
  - NO
- Mitigation:
  - n/a
