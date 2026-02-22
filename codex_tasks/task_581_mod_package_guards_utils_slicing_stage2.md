# Task 581: mod-package guards utils slicing (stage2)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `guards/utils.ts`를 facade + 하위 util 모듈로 분해한다.
- What must NOT change:
  - validation helper semantics 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/guards/utils.ts`
- `v10/src/core/runtime/modding/package/guards/utils/`
- `codex_tasks/task_581_mod_package_guards_utils_slicing_stage2.md`

Out of scope:
- guard call-site behavior 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - guards lane 내부 분해 only
- Compatibility:
  - exported util symbol names unchanged

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W25
- Depends on tasks:
  - `task_580`
- Enables tasks:
  - `task_584`
- Parallel group:
  - G-P6-SLICE-W25-A
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
  - 공통 util 분해로 재사용 경로를 명시화.

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

- [x] AC-1: `guards/utils.ts`가 facade 수준으로 축소된다(<=40 lines 목표).
- [x] AC-2: constants/json/array helpers가 하위 모듈로 분리된다.
- [x] AC-3: lint/build PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `wc -l v10/src/core/runtime/modding/package/guards/utils.ts`
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
  - util re-export 누락 시 다수 guard import break 가능.
- Roll-back:
  - 기존 단일 `utils.ts`로 즉시 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/guards/utils.ts`
- `v10/src/core/runtime/modding/package/guards/utils/constants.ts`
- `v10/src/core/runtime/modding/package/guards/utils/failure.ts`
- `v10/src/core/runtime/modding/package/guards/utils/arrays.ts`
- `v10/src/core/runtime/modding/package/guards/utils/json.ts`
- `v10/src/core/runtime/modding/package/guards/utils/predicates.ts`
- `codex_tasks/task_581_mod_package_guards_utils_slicing_stage2.md`

Commands run:
- `wc -l v10/src/core/runtime/modding/package/guards/utils.ts`
- `bash scripts/check_v10_large_file_budget.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `bash scripts/run_repo_verifications.sh --stage end`

Manual verification notes:
- `guards/utils.ts` line count is `11`; util primitives were split into `guards/utils/*`.
