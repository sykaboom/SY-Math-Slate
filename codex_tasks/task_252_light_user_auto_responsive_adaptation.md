# Task 252: Light User Auto-Responsive Adaptation (Web/Mobile/Tablet)

Status: PENDING
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Specify automatic adaptation rules so light users can request features without manually tuning web/mobile/tablet layout constraints.
  - Define adaptation conflict resolver and fallback policy.
- What must NOT change:
  - Do not require manual per-device design by end users.
  - Do not add dependencies.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_252_light_user_auto_responsive_adaptation.md`

Out of scope:
- Heavy-user advanced module controls
- Runtime implementation

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Adaptation output must remain policy/manifest data.
  - Touch target and reachability constraints are hard requirements.
- Compatibility:
  - Uses intent output from `task_251`.
  - Uses SVG/redline constraints from task238 canonical pack.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - M2-LIGHT
- Depends on tasks:
  - [`task_251`]
- Enables tasks:
  - [`task_258`]
- Parallel group:
  - G-light
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

- [ ] AC-1: Adaptation rules define deterministic behavior for all required viewports.
- [ ] AC-2: Conflict resolver policy specifies which module gets priority when space/touch constraints collide.
- [ ] AC-3: Fallback behavior guarantees recoverability (launcher/close actions reachable).

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: review viewport adaptation matrix.
   - Expected result: explicit outputs for web/mobile/tablet breakpoints.
   - Covers: AC-1

2) Step:
   - Command / click path: review conflict resolver section.
   - Expected result: deterministic priority order and no ambiguous ties.
   - Covers: AC-2

3) Step:
   - Command / click path: review fallback/recoverability section.
   - Expected result: launcher + close/reopen path always preserved.
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Over-constrained rules may reduce useful customization.
- Roll-back:
  - Switch to warning mode and request manual confirmation for unresolved conflicts.

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

