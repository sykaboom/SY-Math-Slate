# Task 625: mod-package index validate core slicing (stage3)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `validateDefinition/index/validate.ts`를 facade-only로 축소하고 core lane(`validate/core.ts`)으로 분리한다.
- What must NOT change:
  - definition validation 결과/에러 경로/시그니처 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/guards/validateDefinition/index/validate.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/index/validate/core.ts`
- `codex_tasks/task_625_mod_package_index_validate_core_slicing_stage3.md`

Out of scope:
- policies/relations/finalize 내부 로직 수정

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - validate index lane 내부 분리만 수행
- Compatibility:
  - `validateModPackageDefinition` 공개 시그니처 유지

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W36
- Depends on tasks:
  - `task_624`
- Enables tasks:
  - `task_628`
- Parallel group:
  - G-P6-SLICE-W36-A
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
  - validate orchestration core 분리 단일 작업.

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

- [x] AC-1: `index/validate.ts`가 facade-only(<=20 lines)로 축소된다.
- [x] AC-2: orchestration 로직이 `index/validate/core.ts`로 이동된다.
- [x] AC-3: lint/build PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `wc -l v10/src/core/runtime/modding/package/guards/validateDefinition/index/validate.ts`
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
  - core import 경로 오타 가능.
- Roll-back:
  - 기존 단일 `index/validate.ts`로 즉시 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/guards/validateDefinition/index/validate.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/index/validate/core.ts`
- `codex_tasks/task_625_mod_package_index_validate_core_slicing_stage3.md`

Commands run:
- `bash scripts/check_v10_large_file_budget.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `bash scripts/run_repo_verifications.sh --stage end`

Manual verification notes:
- `validate.ts`는 base parse 후 core 호출만 담당하는 facade로 축소됨.
- parseActivationToolbarModeMap/policies/relations/finalize orchestration은 `validate/core.ts`로 이동.
- lint/build/repo verification PASS.
