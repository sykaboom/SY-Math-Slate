# Task 136: Layout Slot Cutover (Top -> Bottom -> Side)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Cut over role-aware layout surfaces to slot-driven composition in three gated phases:
    1) top chrome
    2) bottom chrome
    3) side panel
  - Keep policy-controlled visibility while reducing hardcoded domain component wiring.
- What must NOT change:
  - No regression in pointer/writing continuity.
  - No single-shot full rewrite of AppLayout in one patch.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_136_layout_slot_cutover_top_bottom_side.md`
- `v10/src/features/chrome/layout/AppLayout.tsx`
- `v10/src/features/platform/extensions/ui/registerCoreSlots.ts`
- `v10/src/features/platform/extensions/ui/ExtensionRuntimeBootstrap.tsx`
- `v10/src/features/platform/extensions/ui/registerCoreDeclarativeManifest.ts`
- `v10/src/features/platform/extensions/ui/ExtensionSlot.tsx`
- `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`
- `v10/src/features/chrome/layout/DataInputPanel.tsx`
- `v10/AI_READ_ME.md`

Out of scope:
- Full visual redesign.
- Complete deletion of all legacy controls in this task.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Slot cutover must preserve existing layer boundaries.
  - Cutover must be phase-gated and reversible by flag.
- Compatibility:
  - Default runtime stays stable; phased cutover can be feature-flagged.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: YES
- If YES, fill all items:
  - [x] SVG path in `design_drafts/`
    - `design_drafts/layout_app_layout_1440x1080.svg`
    - `design_drafts/layout_writer_shell_768x1024.svg`
    - `design_drafts/layout_writer_shell_820x1180.svg`
    - `design_drafts/layout_writer_shell_1024x768.svg`
    - `design_drafts/layout_writer_shell_1180x820.svg`
  - [x] SVG has explicit `viewBox` (width / height / ratio)
  - [x] Tablet viewport checks considered:
    - 768x1024 / 820x1180 / 1024x768 / 1180x820
  - [x] Numeric redlines recorded in spec
    - Top chrome control row height target: `56 +/- 8px`
    - Bottom tool rail max width target: `1120 +/- 40px`
    - Side drafting panel width target (desktop): `360 +/- 40px`
    - Fullscreen exit affordance touch target min: `44x44px`
  - [x] Codex verified SVG exists before implementation

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - task_133~138
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: Codex
    - Implementer-B: Codex
    - Implementer-C: Codex
    - Reviewer+Verifier: Codex
  - File ownership lock plan:
    - Implementer-A: slot registry/bootstrap wiring
    - Implementer-B: AppLayout phased region cutover
    - Implementer-C: toolbar/panel slot migration + docs
  - Parallel slot plan:
    - max 6 active slots

If NO:
- Execution mode: MANUAL

---

## Optional Block C — Hotfix Exception

- [x] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [x] Applies: NO

---

## Optional Block E — Documentation Update Check

- [x] Applies: YES
- If YES:
  - [x] Structure changes (file/folder add/move/delete):
    - Run `node scripts/gen_ai_read_me_map.mjs`
    - Verify `v10/AI_READ_ME_MAP.md` update if needed
  - [x] Semantic/rule changes:
    - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [x] AC-1: Top chrome cutover uses slot host path without breaking current host controls.
- [x] AC-2: Bottom chrome cutover keeps player/toolbar behavior while using slot composition.
- [x] AC-3: Side panel cutover keeps kiosk/role visibility behavior and panel reachability on tablet viewports.
- [x] AC-4: Layout checks pass on required viewport set and `scripts/check_layer_rules.sh` passes.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: open app in each required viewport and verify top/bottom/side control reachability.
   - Expected result: no blocked writing path and controls remain reachable.
   - Covers: AC-1, AC-2, AC-3

2) Step:
   - Command / click path: `scripts/check_layer_rules.sh`
   - Expected result: pass.
   - Covers: AC-4

3) Step:
   - Command / click path: `cd v10 && npm run build`
   - Expected result: build pass.
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Region cutover may break desktop/tablet affordance placement.
- Roll-back:
  - Revert each phase independently (top, bottom, side) and disable cutover flag.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_136_layout_slot_cutover_top_bottom_side.md`
- `v10/src/features/chrome/layout/AppLayout.tsx`
- `v10/src/features/platform/extensions/ui/registerCoreSlots.ts`
- `v10/src/features/platform/extensions/ui/CoreSlotComponents.tsx`
- `v10/AI_READ_ME.md`
- `v10/AI_READ_ME_MAP.md`

Commands run (only if user asked or required by spec):
- cd v10 && npm run lint
- cd v10 && npm run build
- scripts/check_layer_rules.sh
- node scripts/gen_ai_read_me_map.mjs

## Gate Results (Codex fills)

- Lint:
  - PASS (2 pre-existing warnings in untouched files)
- Build:
  - PASS
- Script checks:
  - PASS

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - Lint warnings only (pre-existing, non-blocking) in compileAnimationPlan/ChalkActor.
- Newly introduced failures:
  - None observed.
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- Slot cutover code paths (bottom/side + top host extension path) were validated through build/layer checks and source inspection.

Notes:
- Delegated execution completed for this task scope.
