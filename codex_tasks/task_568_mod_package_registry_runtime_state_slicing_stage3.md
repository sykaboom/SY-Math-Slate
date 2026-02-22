# Task 568: mod-package registry runtime-state slicing (stage3)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `registry/runtimeRegistryState.ts`를 facade로 축소하고 registry/provider state를 분리한다.
- What must NOT change:
  - runtime registry public API surface 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/registry/runtimeRegistryState.ts`
- `v10/src/core/runtime/modding/package/registry/runtimeRegistryState/`
- `codex_tasks/task_568_mod_package_registry_runtime_state_slicing_stage3.md`

Out of scope:
- classRegistry behavior 변경
- runtime boot sequence 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - existing package registry contract 유지
- Compatibility:
  - exported function signatures must remain identical

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W21
- Depends on tasks:
  - `task_566`
- Enables tasks:
  - `task_570`
- Parallel group:
  - G-P6-SLICE-W21-B
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 4~6
- Files shared with other PENDING tasks:
  - none
- Cross-module dependency:
  - NO
- Parallelizable sub-units:
  - 0
- Estimated single-agent duration:
  - `~25min`
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - YES
- Rationale:
  - registry state singleton 분해 + facade 유지.

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

- [x] AC-1: `runtimeRegistryState.ts`가 facade 수준(<=40 lines)으로 축소된다.
- [x] AC-2: registry/provider state helper 모듈로 분해된다.
- [x] AC-3: lint/build PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `wc -l v10/src/core/runtime/modding/package/registry/runtimeRegistryState.ts`
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
  - singleton reset ordering regression 가능.
- Roll-back:
  - state helper split revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/registry/runtimeRegistryState.ts`
- `v10/src/core/runtime/modding/package/registry/runtimeRegistryState/registrySingleton.ts`
- `v10/src/core/runtime/modding/package/registry/runtimeRegistryState/toolbarProvider.ts`
- `codex_tasks/task_568_mod_package_registry_runtime_state_slicing_stage3.md`

Commands run:
- `wc -l v10/src/core/runtime/modding/package/registry/runtimeRegistryState.ts`
- `bash scripts/check_layer_rules.sh`
- `bash scripts/check_mod_contract.sh`
- `bash scripts/check_v10_large_file_budget.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `bash scripts/run_repo_verifications.sh --stage end`

Manual verification notes:
- `runtimeRegistryState.ts` line count is `25`; singleton state was split into `runtimeRegistryState/*`.
- reset ordering remained intact via `resetRuntimeModPackageRegistry()` facade.
