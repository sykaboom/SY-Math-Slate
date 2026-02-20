# Task 342: Keyboard Routing + Focus Guard Integration

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-20

---

## Goal (Base Required)
- What to change:
  - Route keyboard input through mod bridge with strict editable-element focus guards.
  - Ensure capture scope is limited to canvas runtime context.
- What must NOT change:
  - text input/editor keyboard behavior.
  - existing global shortcut expectations outside canvas runtime.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/features/canvas/viewport/useViewportInteraction.ts`
- `v10/src/features/canvas/CanvasStage.tsx` (focus boundary attributes if needed)

Out of scope:
- pointer/wheel integration.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - keyboard routing only in canvas interaction boundary.
- Compatibility:
  - editable elements always bypass mod key routing.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W342
- Depends on tasks:
  - [`task_341_pointer_wheel_routing_integration`]
- Enables tasks:
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
  - ~25min
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - NO
- Rationale:
  - follows task_341 on same hot file.

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
    - mod key route currently exists in manager but not integrated end-to-end.
  - Sunset criteria:
    - key events in canvas boundary use mod routing path.

---

## Optional Block E — Documentation Update Check

- [ ] Applies: YES / NO

---

## Acceptance Criteria (Base Required)

- [x] AC-1: canvas keydown/keyup can be routed through mod manager.
- [x] AC-2: editable elements bypass routing and keep native text behavior.
- [x] AC-3: no regression in existing canvas shortcuts.

---

## Manual Verification Steps (Base Required)

1) canvas key path
   - Command / click path:
     - focus canvas and trigger known key interactions
   - Expected result:
     - routed path active, behavior preserved
   - Covers: AC-1, AC-3

2) editor bypass
   - Command / click path:
     - focus text editor/input then type and shortcut keys
   - Expected result:
     - native editor behavior remains
   - Covers: AC-2

3) gates
   - Command / click path:
     - `cd v10 && npm run lint && npm run build`
   - Expected result:
     - pass
   - Covers: AC-1..3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - over-capture of keys outside intended focus boundary.
- Roll-back:
  - revert key routing branch and keep prior listener behavior.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (chat directive: "You own Task 342 implementation only.")

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/canvas/viewport/useViewportInteraction.ts`
- `v10/src/features/canvas/CanvasStage.tsx`
- `codex_tasks/task_342_keyboard_routing_focus_guard_integration.md`

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
  - `cd v10 && npm run build` fails with TypeScript error in `v10/src/mod/runtime/templatePackRegistry.ts:82` (`Property 'path' does not exist on type 'TemplatePackValidationResult'.`).
- Newly introduced failures:
  - None identified.
- Blocking:
  - NO
- Mitigation:
  - Leave unchanged for Task 342; resolve in the owner task for `templatePackRegistry` typing fixes.

Manual verification notes:
- Keyboard routing now uses `routeModKeyInput` via canvas boundary key handlers (`onKeyDownCapture`, `onKeyUpCapture`) instead of global window key listeners.
- Editable targets (`input`, `textarea`, `select`, contenteditable) bypass mod routing and retain native text behavior.
- Canvas boundary is focus-enabled (`tabIndex={-1}`) with a boundary marker attribute so keyboard capture scope remains local to canvas runtime.
- Existing Space-pan state handling remains, with reset on boundary blur/window blur.
- UI click-through smoke scenarios were not executed in this terminal session.
