# Task 210: Stylus Palm-Rejection Heuristics

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Upgrade stylus/touch palm-rejection heuristics for canvas and overview ink layers.
  - Add deterministic suppression criteria based on pen activity window and touch contact characteristics.
- What must NOT change:
  - Pen stroke output shape/pressure behavior for valid pen input must remain stable.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_210_stylus_palm_rejection_heuristics.md`
- `v10/src/features/platform/hooks/useCanvas.ts`
- `v10/src/features/platform/hooks/useOverlayCanvas.ts`

Out of scope:
- Viewport pan/zoom lock protocol (task_209).

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Heuristics stay inside input hooks; no new cross-layer coupling.
- Compatibility:
  - Mouse and pen input should remain unaffected.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W6
- Depends on tasks:
  - [`task_209`]
- Enables tasks:
  - [`task_211`]
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
    - `design_drafts/layout_tablet_ink_fullscreen_768x1024.svg`
    - `design_drafts/layout_tablet_ink_fullscreen_1024x768.svg`
  - [x] SVG has explicit `viewBox` (width / height / ratio)
  - [x] Tablet viewport checks considered:
    - 768x1024 / 820x1180 / 1024x768 / 1180x820
  - [x] Numeric redlines recorded in spec
    - palm suppression cooldown: 400~700ms window
    - coarse contact threshold: >=24px (width or height)
    - false suppression on pen-only stream: 0 occurrences
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

- [x] AC-1: Touch palm events are suppressed more reliably during active stylus usage.
- [x] AC-2: Pen and mouse drawing behavior remain stable.
- [x] AC-3: lint/build checks pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: simulate pen draw + palm touch interference sequences.
   - Expected result: palm touches are ignored while pen remains active.
   - Covers: AC-1

2) Step:
   - Command / click path: pen-only and mouse-only draw regression check.
   - Expected result: stroke continuity and width behavior unchanged.
   - Covers: AC-2

3) Step:
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: PASS
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Heuristic thresholds could suppress legitimate finger input.
- Roll-back:
  - keep thresholds as constants with conservative defaults and narrow suppression predicates.

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
- `v10/src/features/platform/hooks/useCanvas.ts`
- `v10/src/features/platform/hooks/useOverlayCanvas.ts`

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
- Palm suppression now uses pen-activity window + contact-size thresholds + per-pointer suppression tracking; pen/mouse paths remain unchanged.

Notes:
- Suppressed touch pointers are released on pointer end/cancel and hook cleanup to avoid sticky suppression.
