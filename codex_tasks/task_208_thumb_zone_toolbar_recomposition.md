# Task 208: Thumb-Zone Toolbar Recomposition

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Recompose toolbar UI for tablet/mobile thumb-zone access while preserving existing command dispatch behavior.
  - Add compact mobile strip and deterministic expanded controls layout.
- What must NOT change:
  - Existing command IDs and command dispatch payload contracts must remain unchanged.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_208_thumb_zone_toolbar_recomposition.md`
- `v10/src/features/toolbar/FloatingToolbar.tsx`
- `v10/src/features/toolbar/ThumbZoneDock.tsx` (new)

Out of scope:
- Role policy rules or layout shell breakpoints (task_207).

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - UI composition only; command behavior must be delegated through existing dispatch layer.
- Compatibility:
  - Desktop toolbar behavior must remain available at current breakpoints.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W6
- Depends on tasks:
  - [`task_207`]
- Enables tasks:
  - [`task_209`, `task_211`]
- Parallel group:
  - G6-mobile
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `mid`

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: YES
- If YES, fill all items:
  - [x] SVG path in `design_drafts/`
    - `design_drafts/layout_tablet_landscape_controls_1180x820.svg`
    - `design_drafts/layout_tablet_ink_fullscreen_768x1024.svg`
    - `design_drafts/layout_tablet_ink_fullscreen_1024x768.svg`
  - [x] SVG has explicit `viewBox` (width / height / ratio)
  - [x] Tablet viewport checks considered:
    - 768x1024 / 820x1180 / 1024x768 / 1180x820
  - [x] Numeric redlines recorded in spec
    - primary thumb-zone action cluster bottom offset: >=12px
    - compact action button min size: >=44x44
    - expanded panel max height on portrait: <=40vh
    - inline button group gap: 6~10px
  - [x] Codex verified SVG exists before implementation

---

## Optional Block B — Delegated Execution

- [x] Applies: YES

---

## Optional Block C — Hotfix Exception

- [ ] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [ ] Applies: NO

---

## Optional Block E — Documentation Update Check

- [x] Applies: YES

---

## Acceptance Criteria (Base Required)

- [x] AC-1: Mobile/tablet toolbar presents thumb-zone optimized compact layout.
- [x] AC-2: Existing toolbar command dispatch behavior remains unchanged.
- [x] AC-3: lint/build checks pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: test toolbar actions in 768x1024 and 1180x820.
   - Expected result: compact+expanded toolbar pattern follows thumb-zone composition.
   - Covers: AC-1

2) Step:
   - Command / click path: verify pen/eraser/laser/export/viewmode commands.
   - Expected result: command IDs/payload semantics unchanged.
   - Covers: AC-2

3) Step:
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: PASS
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Compact mode can hide critical controls accidentally.
- Roll-back:
  - Keep desktop toolbar branch and gate compact branch by profile predicate.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User quote: "다음 웨이브 진행바람."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/toolbar/FloatingToolbar.tsx`
- `v10/src/features/toolbar/ThumbZoneDock.tsx`

Commands run (only if user asked or required by spec):
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `VERIFY_STAGE=end bash scripts/run_repo_verifications.sh`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - PASS (`run_repo_verifications`)

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - N/A
- Newly introduced failures:
  - N/A
- Blocking:
  - N/A
- Mitigation:
  - N/A

Manual verification notes:
- Compact toolbar branch activates under `max-width: 1279px`, keeps pen/laser/popover actions and routes existing command IDs through `dispatchCommand`.

Notes:
- Desktop toolbar branch is retained; compact/mobile uses `ThumbZoneDock` with expanded panel and slot host passthrough.
