# Task 585: mod-package registry class/registryClass slicing (stage2)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `registry/classRegistry/registryClass.ts`를 facade + registration/query internals로 분해한다.
- What must NOT change:
  - registry register/list/getPrimary semantics 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/registry/classRegistry/registryClass.ts`
- `v10/src/core/runtime/modding/package/registry/classRegistry/registryClass/`
- `codex_tasks/task_585_mod_package_registry_class_registry_slicing_stage2.md`

Out of scope:
- registry public class API 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - registry lane 내부 분해 only
- Compatibility:
  - `ModPackageRegistry` external methods/signatures unchanged

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W26
- Depends on tasks:
  - `task_584`
- Enables tasks:
  - `task_588`
- Parallel group:
  - G-P6-SLICE-W26-A
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
  - registry class 내부 책임 분리.

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

- [ ] AC-1: `registryClass.ts`가 facade 수준으로 축소된다(<=40 lines 목표).
- [ ] AC-2: register/list-primary 로직이 하위 모듈로 분리된다.
- [ ] AC-3: lint/build PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `wc -l v10/src/core/runtime/modding/package/registry/classRegistry/registryClass.ts`
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
  - duplicate-pack-id error path drift 가능.
- Roll-back:
  - 기존 단일 `registryClass.ts`로 즉시 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/registry/classRegistry/registryClass.ts`
- `v10/src/core/runtime/modding/package/registry/classRegistry/registryClass/register.ts`
- `v10/src/core/runtime/modding/package/registry/classRegistry/registryClass/queries.ts`
- `codex_tasks/task_585_mod_package_registry_class_registry_slicing_stage2.md`

Commands run:
- `wc -l v10/src/core/runtime/modding/package/registry/classRegistry/registryClass.ts v10/src/core/runtime/modding/package/registry/classRegistry/registryClass/register.ts v10/src/core/runtime/modding/package/registry/classRegistry/registryClass/queries.ts`
- `bash scripts/check_v10_large_file_budget.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `bash scripts/run_repo_verifications.sh --stage end`

Manual verification notes:
- PASS: `registryClass.ts` is now 21 lines (<=40 target).
- PASS: registration/query responsibilities moved to split internals without API changes.
