# Task 346: Mod Package Boundary Enforcement + CI Checks

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-20

---

## Goal (Base Required)
- What to change:
  - Extend import boundary enforcement for `core/mod/package` and new input routing bridge paths.
  - Extend `check_mod_contract.sh` to assert package-layer invariants.
- What must NOT change:
  - unrelated lint rules and non-mod layers.

---

## Scope (Base Required)

Touched files/directories:
- `v10/eslint.config.mjs`
- `scripts/check_mod_contract.sh`
- `scripts/scan_guardrails.sh`

Out of scope:
- runtime behavior changes.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - no broad wildcard restrictions that break unrelated modules.
- Compatibility:
  - checks should fail only on targeted mod/package violations.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W346
- Depends on tasks:
  - [`task_337_mod_package_contracts_registry_core`, `task_340_mod_input_routing_bridge_scaffold`]
- Enables tasks:
  - `task_347_mod_package_regression_matrix_and_runtime_checks`
- Parallel group:
  - G5-guardrails
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
  - 2
- Estimated single-agent duration:
  - ~20min
- Recommended mode:
  - DELEGATED
- Batch-eligible:
  - YES
- Rationale:
  - guardrail updates are isolated and benefit from quick reviewer pass.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: YES / NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES / NO
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - lint rules + shell checks
  - Assigned roles:
    - Implementer-A: eslint
    - Implementer-B: shell check scripts
    - Reviewer+Verifier: Codex
  - File ownership lock plan:
    - one script/config per implementer
  - Parallel slot plan:
    - 2 slots
  - Scheduler plan (required in delegated mode):
    - Slot allocation mode:
      - DYNAMIC
    - Slot priority rule (DYNAMIC only):
      - fail-fast checks first
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
    - without package boundary rules, regressions reintroduce dual-axis coupling.
  - Sunset criteria:
    - package boundary checks integrated into default guardrail pipeline.

---

## Optional Block E — Documentation Update Check

- [ ] Applies: YES / NO

---

## Acceptance Criteria (Base Required)

- [x] AC-1: eslint rejects forbidden imports for `core/mod/package` ruleset.
- [x] AC-2: `check_mod_contract.sh` validates package boundaries and required symbols.
- [x] AC-3: guardrail scan includes package-contract stage.

---

## Manual Verification Steps (Base Required)

1) eslint policy check
   - Command / click path:
     - `cd v10 && npm run lint`
   - Expected result:
     - pass with new rules and target violations caught in fixtures
   - Covers: AC-1

2) shell check
   - Command / click path:
     - `bash scripts/check_mod_contract.sh`
   - Expected result:
     - pass with package checks
   - Covers: AC-2

3) guardrail stage
   - Command / click path:
     - `bash scripts/scan_guardrails.sh`
   - Expected result:
     - package check stage visible
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - over-broad restriction causing unrelated lint failures.
- Roll-back:
  - revert specific new rules/check blocks only.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (chat directive: "You own Task 346 implementation only.")

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/eslint.config.mjs`
- `scripts/check_mod_contract.sh`
- `scripts/scan_guardrails.sh`
- `codex_tasks/task_346_mod_package_boundary_enforcement_and_ci.md`

Commands run (only if user asked or required by spec):
- `cd v10 && npm run lint`
- `bash scripts/check_mod_contract.sh`
- `bash scripts/scan_guardrails.sh`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - N/A (not required in this task)
- Script checks:
  - PASS (`check_mod_contract.sh`, `scan_guardrails.sh`)

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
- Added ESLint `no-restricted-imports` policy limited to `src/core/mod/package/**/*` to enforce package-layer isolation from `@features/*` and `@core/mod/host*`.
- Extended `check_mod_contract.sh` with package boundary checks (`no @features/*`, `no @core/mod/host*` from package files), deep-import guards for features (`@core/mod/package/*`, `@core/mod/host/inputRoutingBridge`), and required symbol checks for package/host public exports.
- Updated `scan_guardrails.sh` stage label/output to explicitly surface the `mod/package contract + boundary` check stage in scan logs.
