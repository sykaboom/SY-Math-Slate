# Task 257: Dual-Mode Modding GUI Spec (Light Prompt Mode + Heavy Builder Mode)

Status: PENDING
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Specify GUI information architecture for dual-mode modding:
    - Light mode: request/prompt-first
    - Heavy mode: module/package-first
  - Keep both modes on one runtime with consistent preview/apply/rollback affordances.
- What must NOT change:
  - Do not split runtime contracts by mode.
  - Do not add dependencies.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_257_dual_mode_modding_gui_spec.md`

Out of scope:
- Final UI implementation
- Backend/API implementation

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - IA must preserve role policy constraints.
  - Keep novice path simple and expert path discoverable without cross-contamination.
- Compatibility:
  - Depends on `task_252`, `task_254`, `task_255`, `task_256`.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - M3-UX
- Depends on tasks:
  - [`task_252`, `task_254`, `task_255`, `task_256`]
- Enables tasks:
  - [`task_258`]
- Parallel group:
  - G-ux
- Max parallel slots:
  - 6 (default)
- Verification stage for this task:
  - `mid`

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: YES
- If YES, fill all items:
  - [ ] SVG path in `design_drafts/`
  - [ ] SVG has explicit `viewBox` (width / height / ratio)
  - [ ] Tablet viewport checks considered:
    - 768x1024 / 820x1180 / 1024x768 / 1180x820
  - [ ] Numeric redlines recorded in spec
  - [ ] Codex verified SVG exists before implementation

Status note:
- BLOCKED for implementation until one approved SVG draft is attached for this IA.

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

- [ ] Applies: NO

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: Light mode flow fits novice behavior (request -> preview -> approve) with minimal controls.
- [ ] AC-2: Heavy mode exposes module import/build/debug controls with explicit safety labels.
- [ ] AC-3: Both modes share one consistent transaction bar (preview/apply/rollback/audit).
- [ ] AC-4: Mode switch rules preserve context without unsafe state leakage.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: inspect light-mode IA.
   - Expected result: novice flow has low cognitive load and no code requirement.
   - Covers: AC-1

2) Step:
   - Command / click path: inspect heavy-mode IA.
   - Expected result: advanced controls are complete and explicitly gated.
   - Covers: AC-2

3) Step:
   - Command / click path: inspect shared transaction components.
   - Expected result: one shared preview/apply/rollback/audit surface.
   - Covers: AC-3

4) Step:
   - Command / click path: inspect mode-switch handling.
   - Expected result: context preserved, unsafe carry-over blocked.
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - IA overlap can confuse both user types.
- Roll-back:
  - Keep heavy mode hidden behind explicit advanced toggle until IA stabilizes.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [ ] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: PENDING

Changed files:
- (to be filled)

Commands run (only if user asked or required by spec):
- (to be filled)

## Gate Results (Codex fills)

- Lint:
  - N/A
- Build:
  - N/A
- Script checks:
  - N/A

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - N/A
- Newly introduced failures:
  - N/A
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- (to be filled)

Notes:
- (to be filled)

