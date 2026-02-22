# Task 579: mod-package validate dependencies/finalize slicing (stage2)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `guards/validateDefinition/dependenciesAndFinalize.ts`를 facade + 하위 parser/finalize 모듈로 분해한다.
- What must NOT change:
  - dependency/conflict/defaultEnabled parse semantics와 final definition shape 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/guards/validateDefinition/dependenciesAndFinalize.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/dependenciesAndFinalize/`
- `codex_tasks/task_579_mod_package_validate_dependencies_finalize_slicing_stage2.md`

Out of scope:
- validateDefinition root orchestration 변경
- mod package type 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - guards lane 내부 분해 only
- Compatibility:
  - exported function names/signatures unchanged

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W24
- Depends on tasks:
  - `task_576`
- Enables tasks:
  - `task_580`
- Parallel group:
  - G-P6-SLICE-W24-C
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
  - dependency/finalize parser 블록 분해.

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

- [x] AC-1: `dependenciesAndFinalize.ts`가 facade 수준으로 축소된다(<=40 lines 목표).
- [x] AC-2: dependencies/conflicts/defaultEnabled/finalize가 하위 모듈로 분리된다.
- [x] AC-3: lint/build PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `wc -l v10/src/core/runtime/modding/package/guards/validateDefinition/dependenciesAndFinalize.ts`
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
  - definition assemble shape drift 가능.
- Roll-back:
  - 기존 단일 `dependenciesAndFinalize.ts`로 즉시 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/guards/validateDefinition/dependenciesAndFinalize.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/dependenciesAndFinalize/parseDependencies.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/dependenciesAndFinalize/parseConflicts.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/dependenciesAndFinalize/parseDefaultEnabled.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/dependenciesAndFinalize/buildDefinition.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/dependenciesAndFinalize/types.ts`
- `codex_tasks/task_579_mod_package_validate_dependencies_finalize_slicing_stage2.md`

Commands run:
- `wc -l v10/src/core/runtime/modding/package/guards/validateDefinition/dependenciesAndFinalize.ts`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `bash scripts/run_repo_verifications.sh --stage end`

Manual verification notes:
- facade file line count is `18`; parser/finalize internals moved under `dependenciesAndFinalize/*`.
