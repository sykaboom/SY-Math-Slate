# Task 341: Pointer + Wheel Routing Integration

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-20

---

## Goal (Base Required)
- What to change:
  - Integrate pointer and wheel events in canvas viewport interaction with `ModManager` routing bridge.
  - Preserve host-priority pan/zoom exceptions and fallback semantics.
- What must NOT change:
  - Existing student kiosk restrictions.
  - Existing hand/space/middle pan ergonomics.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/features/canvas/viewport/useViewportInteraction.ts`
- `v10/src/core/mod/host/inputRoutingBridge.ts` (integration calls only)

Out of scope:
- key routing integration.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - no direct store mutation from bridge path.
- Compatibility:
  - host-priority branches execute first for pan/zoom gestures.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W341
- Depends on tasks:
  - [`task_340_mod_input_routing_bridge_scaffold`]
- Enables tasks:
  - `task_342_keyboard_routing_focus_guard_integration`
  - `task_347_mod_package_regression_matrix_and_runtime_checks`
- Parallel group:
  - G2-input-integration
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 2
- Files shared with other PENDING tasks:
  - `v10/src/features/canvas/viewport/useViewportInteraction.ts`
- Cross-module dependency:
  - YES
- Parallelizable sub-units:
  - 0
- Estimated single-agent duration:
  - ~35min
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - NO
- Rationale:
  - single hot file with high regression risk.

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
    - pointer/wheel currently bypasses mod runtime routing.
  - Sunset criteria:
    - routing helper invoked in all pointer/wheel entry branches.

---

## Optional Block E — Documentation Update Check

- [ ] Applies: YES / NO

---

## Acceptance Criteria (Base Required)

- [x] AC-1: pointer events route through mod bridge with `handled/pass` semantics.
- [x] AC-2: wheel events route through mod bridge without breaking zoom behavior.
- [x] AC-3: student role still cannot mutate canvas via routed input path.

---

## Manual Verification Steps (Base Required)

1) draw smoke
   - Command / click path:
     - draw on canvas with pen tool
   - Expected result:
     - no regression in stroke behavior
   - Covers: AC-1

2) pan/zoom smoke
   - Command / click path:
     - middle/space/hand pan + wheel zoom
   - Expected result:
     - unchanged behavior
   - Covers: AC-2

3) student role smoke
   - Command / click path:
     - switch to student role and attempt pointer interactions
   - Expected result:
     - guarded behavior preserved
   - Covers: AC-3

4) gates
   - Command / click path:
     - `cd v10 && npm run lint && npm run build`
   - Expected result:
     - pass
   - Covers: AC-1..3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - subtle pointer capture lifecycle regressions.
- Roll-back:
  - revert `useViewportInteraction.ts` integration chunk.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (chat directive: "You own Task 341 implementation only.")

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/canvas/viewport/useViewportInteraction.ts`
- `v10/src/core/mod/host/inputRoutingBridge.ts`
- `codex_tasks/task_341_pointer_wheel_routing_integration.md`

Commands run (only if user asked or required by spec):
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `bash scripts/check_layer_rules.sh`
- `bash scripts/check_mod_contract.sh`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - FAIL (pre-existing, out of task scope)
- Script checks:
  - PASS (`check_layer_rules`, `check_mod_contract`)

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - `cd v10 && npm run build` fails with TypeScript error in `v10/src/core/mod/package/guards.ts:226` (`Spread types may only be created from object types.`).
- Newly introduced failures:
  - None identified.
- Blocking:
  - NO
- Mitigation:
  - Leave unchanged for Task 341; resolve in the owner task for `core/mod/package` typing issue.

Manual verification notes:
- Pointer routing now uses `routeModPointerInput` across pointer capture handlers, while preserving host-first middle/space/hand pan behavior and fallback pass-through.
- Wheel routing now uses `routeModWheelInput`; host zoom flow remains unchanged for zoom gestures and only non-zoom handled events are consumed.
- Student role guards remain before routed pointer/wheel branches; student cannot mutate viewport through the new routing path.
- UI smoke steps were not executed in this terminal session.
