# Task 621: mod-package toolbar modes helpers slicing (stage3)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `sections/modes.ts`를 facade-only로 축소하고 modes helper lane을 분리한다.
- What must NOT change:
  - toolbar plan section 계산 결과/시그니처 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/selectors/toolbarPlan/planResolution/sections/modes.ts`
- `v10/src/core/runtime/modding/package/selectors/toolbarPlan/planResolution/sections/modes/helpers.ts`
- `codex_tasks/task_621_mod_package_toolbar_modes_helpers_slicing_stage3.md`

Out of scope:
- plan resolution 상위 facade/export 구조 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - toolbar plan sections lane 내부 분해만 허용
- Compatibility:
  - exported builders(`buildDrawSection`, `buildPlaybackSection`, `buildCanvasSection`, `buildMorePanelSection`) 유지

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W35
- Depends on tasks:
  - `task_620`
- Enables tasks:
  - `task_624`
- Parallel group:
  - G-P6-SLICE-W35-A
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
  - sections lane helper 분리 + facade 축소 단일 작업.

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

- [x] AC-1: `sections/modes.ts`가 facade-only(<=40 lines)로 축소된다.
- [x] AC-2: modes helper 로직이 `sections/modes/helpers.ts`로 이동된다.
- [x] AC-3: lint/build PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `wc -l v10/src/core/runtime/modding/package/selectors/toolbarPlan/planResolution/sections/modes.ts`
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
  - relative import 오타로 compile fail 가능.
- Roll-back:
  - 기존 단일 `sections/modes.ts` 구현으로 즉시 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/selectors/toolbarPlan/planResolution/sections/modes.ts`
- `v10/src/core/runtime/modding/package/selectors/toolbarPlan/planResolution/sections/modes/helpers.ts`
- `codex_tasks/task_621_mod_package_toolbar_modes_helpers_slicing_stage3.md`

Commands run:
- `bash scripts/check_v10_large_file_budget.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `bash scripts/run_repo_verifications.sh --stage end`

Manual verification notes:
- `sections/modes.ts`는 facade export만 남도록 축소됨.
- modes section 계산 로직은 `sections/modes/helpers.ts`로 분리 완료.
- lint/build/repo verification PASS.
