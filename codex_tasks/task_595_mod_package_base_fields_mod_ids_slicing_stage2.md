# Task 595: mod-package base-fields modIds slicing (stage2)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `guards/validateDefinition/baseFields/parse/modIds.ts`를 facade + validation helper로 분해한다.
- What must NOT change:
  - modIds parse/duplicate-check semantics 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/guards/validateDefinition/baseFields/parse/modIds.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/baseFields/parse/modIds/validate.ts`
- `codex_tasks/task_595_mod_package_base_fields_mod_ids_slicing_stage2.md`

Out of scope:
- `ParsedModIds` contract 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - guards lane 내부 분해 only
- Compatibility:
  - `parseModIds` signature unchanged

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W28
- Depends on tasks:
  - `task_592`
- Enables tasks:
  - `task_596`
- Parallel group:
  - G-P6-SLICE-W28-C
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
  - `~20min`
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - YES
- Rationale:
  - non-empty/duplicate validation 분리.

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

- [ ] AC-1: `modIds.ts`가 facade 수준으로 축소된다(<=40 lines 목표).
- [ ] AC-2: modIds validation 로직이 helper로 분리된다.
- [ ] AC-3: lint/build PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `wc -l v10/src/core/runtime/modding/package/guards/validateDefinition/baseFields/parse/modIds.ts`
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
  - invalid-mod-ids failure wording/path drift 가능.
- Roll-back:
  - 기존 단일 `modIds.ts`로 즉시 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/guards/validateDefinition/baseFields/parse/modIds.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/baseFields/parse/modIds/validate.ts`
- `codex_tasks/task_595_mod_package_base_fields_mod_ids_slicing_stage2.md`

Commands run:
- `bash scripts/check_v10_large_file_budget.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `bash scripts/run_repo_verifications.sh --stage end`

Manual verification notes:
- modIds parse/validation split completed with validator helper extraction.
- build-time type regression (`fail` type reference) hotfixed and re-verified.
