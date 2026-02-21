# Task 305: Floating Toolbar Primary Controls + Non-blocking Feedback

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-19

---

## Goal
- Promote `Undo/Redo` and `Step prev/next` from `More` depth into primary toolbar interaction path (desktop + compact).
- Remove blocking `window.alert/confirm` usage in `FloatingToolbar` and replace with inline non-blocking feedback/confirm UX.
- Surface sound toggle in primary toolbar actions.
- Remove export stub alert path.
- Prevent silent clipping in desktop toolbar container.
- Add explicit fullscreen-exit hint while fullscreen-ink is active.

## Scope
Touched files:
- `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`
- `v10/src/features/chrome/toolbar/ThumbZoneDock.tsx`

Out of scope:
- Pen/Laser color affordance redesign (task_306)
- Eraser size data pipeline (task_307)
- Toolbar dock state/command integration (task_308)

## Acceptance Criteria
- [ ] AC-1: `Undo/Redo` buttons are reachable from the main toolbar UI without opening `More`.
- [ ] AC-2: `Step prev/next` controls are reachable from the main toolbar UI without opening `More`.
- [ ] AC-3: `window.alert`/`window.confirm` are removed from `FloatingToolbar.tsx`.
- [ ] AC-4: Primary toolbar has direct sound toggle control.
- [ ] AC-5: Export placeholder no longer triggers alert; hidden or disabled with non-blocking label.
- [ ] AC-6: Desktop toolbar no longer uses `overflow-hidden` clipping that hides injected modules.
- [ ] AC-7: Fullscreen active state shows visible exit hint.
- [ ] AC-8: `cd v10 && npm run lint && npm run build` pass.

## Manual Verification
1) Desktop toolbar: verify Undo/Redo + Step controls visible without More.
2) Compact toolbar: verify same controls accessible in first interaction layer.
3) Trigger file open/save/reset/sound fail paths and verify non-blocking messages (no browser alert/confirm modal).
4) Enable fullscreen ink and verify explicit exit hint is shown.

## Risks / Rollback
- Risk: UI density increase in compact mode.
- Mitigation: mode-based grouping and section spacing in compact panel.
- Rollback: `git revert <commit>`.

## Approval Gate
- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received

---

## Implementation Log (Codex fills)
Status: COMPLETED
Changed files:
- `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`
- `v10/src/features/chrome/toolbar/ThumbZoneDock.tsx`
Commands run:
- `scripts/check_layer_rules.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`

## Gate Results (Codex fills)
- Lint: PASS
- Build: PASS
- Script checks: PASS (`scripts/check_layer_rules.sh`)

Manual verification notes:
- Undo/Redo + Step controls are reachable in primary compact/desktop toolbar paths.
- `window.alert/confirm` removed from `FloatingToolbar`.
- Sound toggle surfaced as direct toolbar action.
- Export stub changed to disabled non-blocking label.
- Desktop toolbar clipping removed (`overflow-hidden` 제거).
