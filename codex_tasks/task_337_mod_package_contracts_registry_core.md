# Task 337: Mod Package Contracts + Registry Core

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-20

---

## Goal (Base Required)
- What to change:
  - Introduce canonical `ModPackage` contract and runtime registry under `core/mod/package`.
  - Provide package selectors required by runtime host and UI host layers.
- What must NOT change:
  - Existing template pack public API and current runtime behavior.
  - Existing toolbar/windowing rendering behavior.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/mod/package/` (new)
- `v10/src/core/mod/index.ts`
- `v10/src/core/mod/host/index.ts` (exports only)

Out of scope:
- TemplatePack adapter migration.
- Input routing runtime integration.
- Toolbar policy cutover.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - `core/mod/package/*` must not import `@features/*`.
  - public API export via `index.ts` only.
- Compatibility:
  - No breaking change to existing `core/mod/*` imports.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W337
- Depends on tasks:
  - [`task_336_mod_package_contract_and_input_routing_foundation`]
- Enables tasks:
  - `task_338_template_pack_adapter_to_mod_package_registry`
  - `task_339_active_mod_package_store_and_runtime_bridge`
  - `task_340_mod_input_routing_bridge_scaffold`
  - `task_346_mod_package_boundary_enforcement_and_ci`
- Parallel group:
  - G1-core-foundation
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `mid`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 4
- Files shared with other PENDING tasks:
  - none
- Cross-module dependency:
  - NO
- Parallelizable sub-units:
  - 2
- Estimated single-agent duration:
  - ~20min
- Recommended mode:
  - DELEGATED
- Batch-eligible:
  - YES
- Rationale:
  - Pure core-contract foundation with no UI file conflict.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: YES / NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES / NO
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - contract + registry scaffold only
  - Assigned roles:
    - Implementer-A: contracts/types
    - Implementer-B: registry/selectors
    - Reviewer+Verifier: Codex
  - File ownership lock plan:
    - one file = one implementer
  - Parallel slot plan:
    - 2 slots
  - Scheduler plan (required in delegated mode):
    - Slot allocation mode:
      - DYNAMIC
    - Slot priority rule (DYNAMIC only):
      - contract-first
    - Requested orchestration mode:
      - max orchestration mode on

---

## Optional Block C — Hotfix Exception

- [ ] Applies: YES / NO

---

## Optional Block D — Speculative Defense Check

- [x] Applies: YES / NO
- If YES:
  - Evidence (real input, spec, or bug report):
    - current dual-axis runtime ownership (`core/mod` + `mod/templates`) causes SSOT drift risk.
  - Sunset criteria:
    - once package registry is sole runtime package source.

---

## Optional Block E — Documentation Update Check

- [x] Applies: YES / NO
- If YES:
  - [x] Structure changes (file/folder add/move/delete):
    - Run `node scripts/gen_ai_read_me_map.mjs`
  - [x] Semantic/rule changes:
    - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [x] AC-1: `core/mod/package` contract and registry compile with strict runtime validation.
- [x] AC-2: package public API re-exported from `core/mod/index.ts`.
- [x] AC-3: no `@features/*` import in package layer.

---

## Manual Verification Steps (Base Required)

1) Contract compile
   - Command / click path:
     - `cd v10 && npm run lint`
   - Expected result:
     - no type/lint error in new package files
   - Covers: AC-1

2) API export check
   - Command / click path:
     - `rg -n "from \"@core/mod/package\"|export \* from \"./package\"" v10/src/core/mod`
   - Expected result:
     - package APIs exposed from core mod barrel
   - Covers: AC-2

3) Boundary check
   - Command / click path:
     - `rg -n "@features/" v10/src/core/mod/package`
   - Expected result:
     - no matches
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - naming collision between package ids and existing template pack ids.
- Roll-back:
  - remove `core/mod/package/*` and barrel exports in one revert commit.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (chat directive: "You own Task 337 implementation only.")

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/mod/package/types.ts`
- `v10/src/core/mod/package/guards.ts`
- `v10/src/core/mod/package/selectors.ts`
- `v10/src/core/mod/package/registry.ts`
- `v10/src/core/mod/package/index.ts`
- `v10/src/core/mod/index.ts`
- `v10/src/core/mod/host/index.ts`
- `codex_tasks/task_337_mod_package_contracts_registry_core.md`

Commands run (only if user asked or required by spec):
- `cd v10 && npm run lint`
- `bash scripts/check_layer_rules.sh`
- `bash scripts/check_mod_contract.sh`
- `rg -n "from \"@core/mod/package\"|export \* from \"./package\"" v10/src/core/mod`
- `rg -n "@features/" v10/src/core/mod/package`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - N/A (not required for this task)
- Script checks:
  - PASS (`check_layer_rules`, `check_mod_contract`)

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - None
- Newly introduced failures:
  - None
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- Added canonical package contract/guards/registry/selectors under `core/mod/package` with deterministic duplicate-id rejection and runtime validation.
- Verified package API barrel export from `v10/src/core/mod/index.ts`.
- Verified no `@features/*` imports exist in `v10/src/core/mod/package`.
