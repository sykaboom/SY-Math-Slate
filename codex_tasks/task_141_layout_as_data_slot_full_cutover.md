# Task 141: Layout-as-Data Full Slot Cutover

Status: COMPLETED
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
- `v10/src/features/chrome/layout/AppLayout.tsx`
- `v10/src/features/platform/extensions/ui/ExtensionSlot.tsx`
- `v10/src/features/platform/extensions/ui/registerCoreSlots.ts`
- `v10/src/features/platform/extensions/ui/CoreSlotComponents.tsx`
- `v10/src/features/platform/extensions/ui/ExtensionRuntimeBootstrap.tsx`

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

- [x] Applies: YES
- If YES, fill all items:
  - [x] SVG path in `design_drafts/`
    - `design_drafts/layout_writer_shell_768x1024.svg`
    - `design_drafts/layout_writer_shell_820x1180.svg`
    - `design_drafts/layout_writer_shell_1024x768.svg`
    - `design_drafts/layout_writer_shell_1180x820.svg`
  - [x] SVG has explicit `viewBox` (width / height / ratio)
  - [x] Tablet viewport checks considered:
    - 768x1024 / 820x1180 / 1024x768 / 1180x820
  - [x] Numeric redlines recorded in spec
  - [x] Codex verified SVG exists before implementation

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

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/chrome/layout/AppLayout.tsx`
- `v10/src/features/platform/extensions/ui/registerCoreSlots.ts`

Commands run (only if user asked or required by spec):
- `find design_drafts -maxdepth 2 -type f | sort`
- `scripts/check_layer_rules.sh`
- `cd v10 && npm run lint && npm run build`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - PASS

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - None
- Newly introduced failures:
  - None
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- Slot cutover는 기본 활성(`NEXT_PUBLIC_LAYOUT_SLOT_CUTOVER !== "0"`)으로 전환하고, `0` 설정 시 fallback 경로 유지.
- Top/left/bottom slot host 구조(`chrome-top-toolbar`, `left-panel`, `toolbar-bottom`)가 layout 트리에 유지됨을 확인.
- Tablet redline 기준: 상단/하단 고정 chrome의 터치 목표 영역을 유지하고 canvas 중심 영역을 침범하지 않음(기존 SVG shell 대비 구조 불변).

Notes:
- Phase-safe cutover를 위해 환경변수 기반 rollback 스위치(`=0`) 유지.
