# Task 141: Layout-as-Data Full Slot Cutover

Status: PENDING
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Complete cutover of top/bottom/side app shell regions to slot-driven layout composition.
  - Keep role/policy visibility while removing hardcoded region wiring.
- What must NOT change:
  - No pointer-path blocking regression on tablet viewports.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/features/layout/AppLayout.tsx`
- `v10/src/features/extensions/ui/ExtensionSlot.tsx`
- `v10/src/features/extensions/ui/registerCoreSlots.ts`
- `v10/src/features/extensions/ui/CoreSlotComponents.tsx`
- `v10/src/features/extensions/ui/ExtensionRuntimeBootstrap.tsx`

Out of scope:
- Visual redesign.
- Mod Studio GUI editor.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Use existing slot registry/runtime abstractions.
  - Keep policy checks separate from slot render mechanics.
- Compatibility:
  - Feature-flag or phased path required for safe cutover.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: YES
- If YES, fill all items:
  - [ ] SVG path in `design_drafts/`
  - [ ] SVG has explicit `viewBox` (width / height / ratio)
  - [ ] Tablet viewport checks considered:
    - 768x1024 / 820x1180 / 1024x768 / 1180x820
  - [ ] Numeric redlines recorded in spec
  - [ ] Codex verified SVG exists before implementation

---

## Optional Block B — Delegated Execution

- [ ] Applies: YES
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - task_139~157
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: Codex
    - Implementer-B: Codex
    - Implementer-C: Codex
    - Reviewer+Verifier: Codex
  - File ownership lock plan:
    - A: slot registry/bootstrap
    - B: app layout region cutover
    - C: core slot components
  - Parallel slot plan:
    - max 6 active slots

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

- [ ] Applies: YES
- If YES:
  - [ ] Structure changes (file/folder add/move/delete):
    - Run `node scripts/gen_ai_read_me_map.mjs`
    - Verify `v10/AI_READ_ME_MAP.md` update if needed
  - [ ] Semantic/rule changes:
    - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: Top/bottom/side regions render via slot hosts.
- [ ] AC-2: Role visibility behavior remains policy-correct.
- [ ] AC-3: Tablet viewport interaction remains reachable and uninterrupted.
- [ ] AC-4: Layer/lint/build checks pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: open app at 768x1024 / 820x1180 / 1024x768 / 1180x820.
   - Expected result: controls reachable, writing continuity maintained.
   - Covers: AC-2, AC-3

2) Step:
   - Command / click path: `scripts/check_layer_rules.sh`
   - Expected result: PASS.
   - Covers: AC-4

3) Step:
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: PASS.
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Slot ordering mistakes may hide key controls.
- Roll-back:
  - Revert phased region commits and disable cutover flag.

---

## Approval Gate (Base Required)

- [ ] Spec self-reviewed by Codex
- [ ] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- ...

Commands run (only if user asked or required by spec):
- ...

## Gate Results (Codex fills)

- Lint:
  - PASS | FAIL | N/A
- Build:
  - PASS | FAIL | N/A
- Script checks:
  - PASS | FAIL | N/A

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - ...
- Newly introduced failures:
  - ...
- Blocking:
  - YES / NO
- Mitigation:
  - ...

Manual verification notes:
- ...

Notes:
- ...
