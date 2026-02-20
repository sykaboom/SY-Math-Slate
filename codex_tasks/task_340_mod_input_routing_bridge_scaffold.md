# Task 340: Mod Input Routing Bridge Scaffold

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-20

---

## Goal (Base Required)
- What to change:
  - Add normalized event bridge utility (`React/DOM event -> Mod contracts`) with no behavior takeover yet.
  - Provide safe APIs to invoke `ModManager.routePointer/routeKey/routeWheel`.
- What must NOT change:
  - Existing viewport pan/zoom and drawing behavior in this task.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/mod/host/manager.ts`
- `v10/src/core/mod/host/inputRoutingBridge.ts` (new)
- `v10/src/core/mod/host/index.ts`

Out of scope:
- canvas integration files.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - bridge utility remains core-only.
- Compatibility:
  - `ModManager` API backward compatible for current callers.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W340
- Depends on tasks:
  - [`task_337_mod_package_contracts_registry_core`]
- Enables tasks:
  - `task_341_pointer_wheel_routing_integration`
  - `task_342_keyboard_routing_focus_guard_integration`
  - `task_346_mod_package_boundary_enforcement_and_ci`
- Parallel group:
  - G2-input-core
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `mid`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 3
- Files shared with other PENDING tasks:
  - `v10/src/core/mod/host/manager.ts`
- Cross-module dependency:
  - YES
- Parallelizable sub-units:
  - 1
- Estimated single-agent duration:
  - ~25min
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - YES (after 337)
- Rationale:
  - shared core host file should avoid concurrent edits.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: YES / NO

---

## Optional Block B — Delegated Execution

- [ ] Applies: YES / NO

If NO:
- Execution mode: MANUAL

---

## Optional Block C — Hotfix Exception

- [ ] Applies: YES / NO

---

## Optional Block D — Speculative Defense Check

- [x] Applies: YES / NO
- If YES:
  - Evidence (real input, spec, or bug report):
    - routing functions exist but lack reusable normalized bridge.
  - Sunset criteria:
    - all canvas entrypoints consume bridge APIs.

---

## Optional Block E — Documentation Update Check

- [ ] Applies: YES / NO

---

## Acceptance Criteria (Base Required)

- [x] AC-1: normalized routing bridge exports pointer/key/wheel helpers.
- [x] AC-2: bridge calls `ModManager` route methods with strict contract types.
- [x] AC-3: no behavior difference until integration tasks land.

---

## Manual Verification Steps (Base Required)

1) type-level check
   - Command / click path:
     - `cd v10 && npm run lint`
   - Expected result:
     - no typing errors around event normalization
   - Covers: AC-1, AC-2

2) usage check
   - Command / click path:
     - `rg -n "inputRoutingBridge|routePointer|routeKey|routeWheel" v10/src/core/mod/host`
   - Expected result:
     - bridge API and manager references present
   - Covers: AC-2

3) behavior freeze
   - Command / click path:
     - smoke draw/pan baseline
   - Expected result:
     - unchanged
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - mistaken default handling could pre-empt host behavior later.
- Roll-back:
  - remove bridge file and revert host exports.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (chat directive: "You own Task 340 implementation only.")

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/mod/host/manager.ts`
- `v10/src/core/mod/host/inputRoutingBridge.ts`
- `v10/src/core/mod/host/index.ts`
- `codex_tasks/task_340_mod_input_routing_bridge_scaffold.md`

Commands run (only if user asked or required by spec):
- `cd v10 && npm run lint`
- `bash scripts/check_layer_rules.sh`
- `bash scripts/check_mod_contract.sh`
- `rg -n "inputRoutingBridge|routePointer|routeKey|routeWheel" v10/src/core/mod/host`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - N/A (not required in this task)
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
- Added scaffold bridge APIs in `core/mod/host/inputRoutingBridge.ts` for React/DOM-to-mod event normalization and safe manager route invocation (`handled/pass` fallback on unavailable manager/event/phase).
- Kept existing `ModManager.routePointer/routeKey/routeWheel` signatures unchanged; added non-breaking `ModManagerInputRouter` type alias for strict bridge typing.
- Exported bridge module from `core/mod/host/index.ts`.
- Runtime behavior unchanged by construction: no canvas/runtime integration path was modified in this task.
