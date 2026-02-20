# Task 320: Core Engine vs Mod Boundary Contract

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-20

---

## Goal (Base Required)
- What to change:
  - Define an explicit runtime/file boundary so only base engine logic remains in core shell, and all non-engine feature composition is mod-managed.
- What must NOT change:
  - Existing user data contracts (`.slate`, session policy, command bus payloads) must remain backward-compatible.
  - No feature removal in this task.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/config/coreModBoundary.ts` (new)
- `v10/src/core/config/coreModBoundary.guards.ts` (new)
- `v10/src/features/extensions/ui/registerCoreSlots.ts`
- `v10/src/features/extensions/ui/coreTemplates.ts`
- `v10/AI_READ_ME.md`

Out of scope:
- Toolbar visual redesign.
- Mod Studio UX changes.
- New template pack creation.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO (default)
- Boundary rules:
  - Core shell may import only boundary contract, runtime registries, and base-safe UI shells.
  - Non-engine feature composition must be declared as mod-managed surfaces.
- Compatibility:
  - Existing env flags continue to work.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W1
- Depends on tasks:
  - []
- Enables tasks:
  - `task_321`, `task_323`, `task_326`
- Parallel group:
  - G1-architecture
- Max parallel slots:
  - 6 (default)
- Verification stage for this task:
  - `end` (full lint + full build + script checks)

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 5
- Files shared with other PENDING tasks:
  - `v10/src/features/extensions/ui/registerCoreSlots.ts`
  - `v10/src/features/extensions/ui/coreTemplates.ts`
- Cross-module dependency:
  - YES
- Parallelizable sub-units:
  - 1
- Estimated single-agent duration:
  - ~25min
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - NO
  - Must land before downstream catalog/template tasks.
- Rationale:
  - This is the boundary SSOT that later tasks depend on; parallel edits increase contract drift risk.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [ ] Applies: NO
- Execution mode: MANUAL

---

## Optional Block C — Hotfix Exception

- [ ] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [ ] Applies: NO

---

## Optional Block E — Documentation Update Check

- [x] Applies: YES
- [x] Semantic/rule changes:
  - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: A typed boundary contract exists that classifies `core-engine` vs `mod-managed` surfaces.
- [ ] AC-2: The boundary contract exports an explicit allowlist for fixed base engine surfaces:
  - toolbar mode selector shell
  - command dispatch shell
  - role/policy gate bridge
  - window host mount bridge
- [ ] AC-3: Core slot/template registration uses this contract instead of scattered ad-hoc conditions.
- [ ] AC-4: Architecture docs state the invariant: "Base engine fixed, feature composition mod-managed."

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `cd v10 && npm run lint`
   - Expected result:
     - No new lint/type errors.
   - Covers: AC-1, AC-2, AC-3

2) Step:
   - Command / click path:
     - `cd v10 && npm run build`
   - Expected result:
     - Production build succeeds.
   - Covers: AC-1, AC-2, AC-3

3) Step:
   - Command / click path:
     - Inspect exported allowlist in `v10/src/core/config/coreModBoundary.ts`
   - Expected result:
     - Fixed engine surfaces are explicitly listed (not inferred).
   - Covers: AC-2

4) Step:
   - Command / click path:
     - Review `v10/AI_READ_ME.md`
   - Expected result:
     - Boundary rule is explicitly documented.
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Over-restrictive contract can hide existing core controls.
- Roll-back:
  - Revert boundary contract files and restore prior direct registration paths.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (delegated chain: user approved continuation in chat)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/config/coreModBoundary.ts`
- `v10/src/core/config/coreModBoundary.guards.ts`
- `v10/src/features/extensions/ui/coreTemplates.ts`
- `v10/src/features/extensions/ui/registerCoreSlots.ts`

Commands run (only if user asked or required by spec):
- cd v10 && npm run lint
- cd v10 && npm run build
- bash scripts/check_core_mod_boundary.sh
- node scripts/check_toolbar_surface_uniqueness.mjs
- node scripts/check_template_pack_contract.mjs
- bash scripts/scan_guardrails.sh

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - PASS (guardrail scan contains WARN-only pre-existing items)

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - None blocking; guardrail WARN items pre-existed and remain tracked
- Newly introduced failures:
  - None
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- Verified toolbar modes (draw/playback/canvas) and More panel still render without runtime errors.
- Verified template-pack registry bootstraps base-education pack without startup crash.

Notes:
- Closeout reflects implemented scope only; no out-of-scope behavior changes were introduced.
