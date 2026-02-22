# Task 574: mod-package validate-definition index/validate slicing (stage2)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `guards/validateDefinition/index/validate.ts`를 facade로 축소하고 policy/relations parser를 분리한다.
- What must NOT change:
  - validation result semantics 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/guards/validateDefinition/index/validate.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/index/validate/`
- `codex_tasks/task_574_mod_package_validate_definition_index_validate_slicing_stage2.md`

Out of scope:
- validation predicate/entry APIs 변경
- pack contract 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - validate lane 내부 분해 only
- Compatibility:
  - `validateModPackageDefinition` signature unchanged

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W23
- Depends on tasks:
  - `task_573`
- Enables tasks:
  - `task_576`
- Parallel group:
  - G-P6-SLICE-W23-A
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
  - validation parsing blocks 분해 리팩터링.

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

- [x] AC-1: `validate.ts`가 facade 수준(<=40 lines)으로 축소된다.
- [x] AC-2: policy/relations parser 로직이 하위 모듈로 분리된다.
- [x] AC-3: lint/build PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `wc -l v10/src/core/runtime/modding/package/guards/validateDefinition/index/validate.ts`
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
  - parse 순서 변경 시 error path 회귀 가능.
- Roll-back:
  - validate.ts 단일 파일로 revert.

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
- `v10/src/core/runtime/modding/package/guards/validateDefinition/index/validate/policies.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/index/validate/relations.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/index/validate/finalize.ts`
- `codex_tasks/task_574_mod_package_validate_definition_index_validate_slicing_stage2.md`

Commands run:
- `wc -l v10/src/core/runtime/modding/package/guards/validateDefinition/index/validate.ts`
- `bash scripts/check_v10_large_file_budget.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `bash scripts/run_repo_verifications.sh --stage end`

Manual verification notes:
- `validate.ts` line count is `40`; policy/relations/finalization internals moved under `validate/*`.
