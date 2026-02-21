# Task 242: Panel Module Adapters (DataInput/Toolbar) on WindowHost

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Move DataInput and toolbar-adjacent panel mounting to module adapters routed through `WindowHost`.
  - Ensure panel placement no longer permanently consumes Slate area width/height.
  - Keep each panel as an independently togglable module unit.
- What must NOT change:
  - Do not rewrite DataInput business logic.
  - Do not change command semantics.
  - No new dependencies.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_242_panel_module_adapters_datainput_toolbar_windowhost.md`
- `v10/src/features/chrome/layout/AppLayout.tsx` (host mount path only)
- `v10/src/features/chrome/layout/DataInputPanel.tsx` (adapter boundary only)
- `v10/src/features/chrome/toolbar/FloatingToolbar.tsx` (adapter boundary only)
- `v10/src/features/chrome/layout/windowing/WindowHost.tsx`
- `v10/src/features/platform/extensions/ui/registerCoreSlots.ts`
- `v10/src/features/chrome/layout/windowing/panelAdapters.tsx` (new)

Out of scope:
- Core controls manifest dogfooding (handled in `task_243`)
- Clean start shell defaults (handled in `task_244`)
- New panel feature development

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Preserve logic/view separation.
  - Adapter layer must not embed panel-specific business logic.
  - Follow panel policy/runtime contracts from `task_240` and `task_241`.
- Compatibility:
  - Existing host authoring controls remain reachable.
  - Student role visibility remains policy-driven.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-C2
- Depends on tasks:
  - [`task_240`]
- Enables tasks:
  - [`task_243`]
- Parallel group:
  - G-panel-adapters
- Max parallel slots:
  - 6 (default)
- Verification stage for this task:
  - `mid`

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: YES
- If YES, fill all items:
  - [x] SVG path in `design_drafts/`
  - [x] SVG has explicit `viewBox` (width / height / ratio)
  - [x] Tablet viewport checks considered:
    - 768x1024 / 820x1180 / 1024x768 / 1180x820
  - [x] Numeric redlines recorded in spec
  - [x] Codex verified SVG exists before implementation

Status note:
- UNBLOCKED: task consumes the canonical Task 238 layout pack.
- Canonical refs:
  - `design_drafts/layout_task238_window_shell_master.svg`
  - `design_drafts/layout_task238_768x1024.svg`
  - `design_drafts/layout_task238_820x1180.svg`
  - `design_drafts/layout_task238_1024x768.svg`
  - `design_drafts/layout_task238_1180x820.svg`
  - `design_drafts/layout_task238_redlines.json`
  - `design_drafts/layout_task238_redlines.md`

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

- [x] Applies: YES
- If YES:
  - [x] Structure changes (file/folder add/move/delete):
    - Run `node scripts/gen_ai_read_me_map.mjs`
    - Verify `v10/AI_READ_ME_MAP.md` update if needed
  - [x] Semantic/rule changes:
    - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [x] AC-1: DataInput and toolbar-adjacent surfaces mount through adapter modules into `WindowHost`.
- [x] AC-2: Slate canvas area is not permanently reduced by fixed side/bottom occupancy.
- [x] AC-3: Panels can open/close and move according to runtime policy.
- [x] AC-4: Student role continues to hide edit-capable panel modules per policy.
- [x] AC-5: `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh` passes.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: inspect AppLayout mount tree.
   - Expected result: DataInput/toolbar adjunct mounts go through module adapter + WindowHost path.
   - Covers: AC-1

2) Step:
   - Command / click path: open host mode and toggle panel modules.
   - Expected result: overlay/window behavior preserves writing area.
   - Covers: AC-2, AC-3

3) Step:
   - Command / click path: switch to student role.
   - Expected result: edit panel modules hidden by policy resolution path.
   - Covers: AC-4

4) Step:
   - Command / click path: `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh`
   - Expected result: PASS.
   - Covers: AC-5

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Adapter wiring could break panel lifecycle assumptions.
  - Overlay pointer handling could interfere with drawing input if capture is wrong.
- Roll-back:
  - Revert adapter layer and mount path changes.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - Approval reference: user instruction assigning Codex to Task 242 only (Wave 4 branch C2) with scope lock and implementation requirements.

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_242_panel_module_adapters_datainput_toolbar_windowhost.md`
- `v10/src/features/chrome/layout/AppLayout.tsx`
- `v10/src/features/chrome/layout/DataInputPanel.tsx`
- `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`
- `v10/src/features/chrome/layout/windowing/WindowHost.tsx`
- `v10/src/features/platform/extensions/ui/registerCoreSlots.ts`
- `v10/src/features/chrome/layout/windowing/panelAdapters.tsx`

Commands run (only if user asked or required by spec):
- `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh`
- `node scripts/gen_ai_read_me_map.mjs --check`

## Gate Results (Codex fills)

- Lint:
  - PASS (`scripts/check_v10_changed_lint.sh` via `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh`)
- Build:
  - N/A
- Script checks:
  - PASS (`VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh`)

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - None in required verification gates.
- Newly introduced failures:
  - `node scripts/gen_ai_read_me_map.mjs --check` reports `v10/AI_READ_ME_MAP.md` out of date after structural file addition (`panelAdapters.tsx`).
- Blocking:
  - NO
- Mitigation:
  - Run `node scripts/gen_ai_read_me_map.mjs` in a follow-up docs-sync task when scope permits touching `v10/AI_READ_ME_MAP.md`.

Manual verification notes:
- AC-1 PASS: `AppLayout` now builds adapter modules through `buildCoreWindowHostPanelAdapters` and mounts them in `WindowHost`; DataInput/FloatingToolbar mount boundaries are routed via `panelAdapters.tsx`.
- AC-2 PASS: legacy fixed left panel + host footer occupancy path is bypassed in cutover mode; canvas stays full-area while panels render as overlay windows/docked host surfaces.
- AC-3 PASS: panel open/close honors runtime policy + UI state (`isDataInputOpen`), movement uses `WindowHost` runtime drag with explicit drag-handle boundary.
- AC-4 PASS: role-resolved adapter contracts apply panel policy role overrides; student role hides edit-capable panel modules.
- AC-5 PASS: `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh` completed successfully.

Notes:
- UI caveat: movable window panels now require dragging from explicit header drag handles (`data-window-host-drag-handle`) to prevent accidental drags during content interaction.
