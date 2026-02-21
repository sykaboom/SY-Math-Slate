# Task 377: UI Host Single Render Path (Minimal Hardening)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-21

---

## Goal (Base Required)
- What to change:
  - Reduce duplicate toolbar mount paths by hardening core slot/window-host gating for floating toolbar.
- What must NOT change:
  - Legacy fallback semantics when slot cutover is off must remain intact.
  - No AppLayout edits.

---

## Scope (Base Required)

Touched files/directories:
- v10/src/features/layout/windowing/panelAdapters.tsx
- v10/src/features/extensions/ui/registerCoreSlots.ts

Out of scope:
- v10/src/features/layout/AppLayout.tsx
- Toolbar IA/content changes
- New dependencies

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO (default)
- Boundary rules:
  - Respect layer rules and existing extension registry boundaries.
  - Keep logic/view separation and avoid runtime-global side effects.
- Compatibility:
  - When `NEXT_PUBLIC_LAYOUT_SLOT_CUTOVER === "0"`, legacy slot-runtime fallback behavior must be preserved.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - P4
- Depends on tasks:
  - ['task_376']
- Enables tasks:
  - ['task_378','task_379']
- Parallel group:
  - G-P4-UI
- Max parallel slots:
  - 6 (default)
- Verification stage for this task:
  - mid

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 2
- Files shared with other PENDING tasks:
  - panelAdapters.tsx
- Cross-module dependency:
  - YES
- Parallelizable sub-units:
  - 0
- Estimated single-agent duration:
  - ~20min
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - NO
- Rationale:
  - Single minimal hardening slice with two files and strict ownership lock.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: NO
- Execution mode: MANUAL

---

## Optional Block C — Hotfix Exception

- [x] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [x] Applies: NO

---

## Optional Block E — Documentation Update Check

- [x] Applies: NO

---

## Acceptance Criteria (Base Required)

- [x] AC-1: Floating toolbar window-host mount is blocked when slot-runtime path for that panel is active, preventing duplicate toolbar mount paths.
- [x] AC-2: Slot cutover off (`NEXT_PUBLIC_LAYOUT_SLOT_CUTOVER === "0"`) keeps legacy slot-runtime fallback semantics unchanged.
- [x] AC-3: No AppLayout changes and lint passes.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - Trace panel registration + window-host adapter gating for floating toolbar.
   - Expected result:
     - Only one toolbar mount path active per cutover mode.
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path:
     - cd v10 && npm run lint
   - Expected result:
     - Lint passes without new errors.
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Over-gating could hide toolbar in unexpected mixed states.
- Roll-back:
  - Revert the two touched source files to restore previous mount behavior.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (chat: "Implement minimal task377 hardening ...")

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- v10/src/features/extensions/ui/registerCoreSlots.ts
- v10/src/features/layout/windowing/panelAdapters.tsx

Commands run (only if user asked or required by spec):
- cd v10 && npm run lint
- scripts/check_layer_rules.sh

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - N/A
- Script checks:
  - PASS

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - none
- Newly introduced failures:
  - none
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- Confirmed floating toolbar adapter now explicitly skips window-host mount when slot-runtime registration is active for the panel.
- Confirmed cutover-off fallback semantics remain preserved by explicit `legacy-fallback` slot-runtime registration mode.

Notes:
- Scope lock requested by user: only `panelAdapters.tsx` and `registerCoreSlots.ts`.
