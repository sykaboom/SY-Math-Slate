# Task 313: Pen/Laser/Eraser Affordance Consistency

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-19

---

## Goal (Base Required)
- What to change:
  - Complete tool affordance consistency across draw modes: pen color visibility, settings discoverability, eraser/laser parity.
  - Remove mode/flag-dependent visibility surprises for core draw affordances.
- What must NOT change:
  - Do not alter stroke rendering math or persistence schema.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/features/toolbar/FloatingToolbar.tsx`
- `v10/src/features/toolbar/PenControls.tsx`
- `v10/src/features/toolbar/LaserControls.tsx`
- `v10/src/features/toolbar/EraserControls.tsx`
- `v10/src/features/toolbar/atoms/ToolButton.tsx`

Out of scope:
- New drawing tools
- Playback UX changes

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Keep command ids unchanged (`setPenColor`, `setLaserColor`, `setEraserWidth`, etc.).
- Compatibility:
  - Existing color presets remain loadable (preset expansion is additive).

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-TBAR-PH2-D
- Depends on tasks:
  - [`task_311`]
- Enables tasks:
  - `task_314`
- Parallel group:
  - G4-draw-affordance
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `mid`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 5
- Files shared with other PENDING tasks:
  - `v10/src/features/toolbar/FloatingToolbar.tsx`
- Cross-module dependency:
  - NO
- Parallelizable sub-units:
  - 2
- Estimated single-agent duration:
  - ~35min
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - NO
- Rationale:
  - Toolbar main file conflict risk high; one-owner pass is safer.

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

- [x] Applies: YES
- Evidence (real input, spec, or bug report):
  - UX report item #3, #10, #13 + partial patch gaps.
- Sunset criteria:
  - Remove temporary fallback affordance once declarative toolbar parity is complete.

---

## Optional Block E — Documentation Update Check

- [x] Applies: NO

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: Pen color indicator and settings trigger are always reachable in draw mode (not hidden by ambiguous fallback branching).
- [ ] AC-2: Eraser/Laser controls expose predictable settings access parity.
- [ ] AC-3: Desktop/mobile/tablet에서 draw affordance 위치/동작이 동일한 의미를 가진다.
- [ ] AC-4: `cd v10 && npm run lint && npm run build` pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: draw mode에서 pen/eraser/laser 각각 설정 열기
   - Expected result: 단일 클릭 경로로 설정 접근 가능
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path: desktop/tablet/mobile에서 동일 시나리오 반복
   - Expected result: affordance 의미 일관
   - Covers: AC-3

3) Step:
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: 통과
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - draw toolbar 밀도 증가로 오조작 가능성.
- Roll-back:
  - `git revert <commit>` 후 기존 affordance 세트 복구.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/toolbar/FloatingToolbar.tsx`
- `v10/src/features/toolbar/PenControls.tsx`
- `v10/src/features/toolbar/LaserControls.tsx`
- `v10/src/features/toolbar/EraserControls.tsx`

Commands run (only if user asked or required by spec):
- `scripts/check_layer_rules.sh`
- `scripts/check_toolbar_contract.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - PASS

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - ...
- Newly introduced failures:
  - ...
- Blocking:
  - YES | NO
- Mitigation:
  - ...

Manual verification notes:
- Draw mode core tool affordances (hand/pen/eraser/laser) are no longer hidden behind legacy-only branch toggles.
- Pen/Laser/Eraser controls use consistent non-blocking command dispatch feedback path.

Notes:
- ...
