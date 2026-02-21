# Task 307: Eraser Width Pipeline (Store -> Command -> Canvas -> UI)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-19

---

## Goal
- Introduce eraser width as first-class state and command.
- Replace fixed `ERASER_WIDTH` behavior with runtime-configurable width.
- Provide eraser controls panel and integrate into toolbar interaction.

## Scope
Touched files:
- `v10/src/features/platform/store/useToolStore.ts`
- `v10/src/features/platform/store/useUIStoreBridge.ts`
- `v10/src/features/platform/store/useChromeStore.ts`
- `v10/src/features/platform/extensions/commands/commands.tool.ts`
- `v10/src/features/platform/extensions/commands/registerCoreCommands.ts`
- `v10/src/features/platform/hooks/useCanvas.ts`
- `v10/src/features/chrome/toolbar/EraserControls.tsx` (new)
- `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`

Out of scope:
- Dock position system (task_308)

## Acceptance Criteria
- [ ] AC-1: `setEraserWidth` command exists with payload validation.
- [ ] AC-2: Eraser hit radius in `useCanvas` follows store value (not fixed constant).
- [ ] AC-3: Toolbar exposes eraser settings popover with width slider.
- [ ] AC-4: Existing pen/laser behaviors are unchanged.
- [ ] AC-5: `cd v10 && npm run lint && npm run build` pass.

## Manual Verification
1) Set eraser width low/high and verify erase footprint changes.
2) Reload app and verify defaults remain sane.
3) Run command dispatch for `setEraserWidth` and verify state update.

## Risks / Rollback
- Risk: command registry coverage assertion failure.
- Mitigation: update `COMMAND_MIGRATION_MAP` atomically.
- Rollback: `git revert <commit>`.

## Approval Gate
- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received

---

## Implementation Log (Codex fills)
Status: COMPLETED
Changed files:
- `v10/src/features/platform/store/useToolStore.ts`
- `v10/src/features/platform/store/useUIStoreBridge.ts`
- `v10/src/features/platform/store/useChromeStore.ts`
- `v10/src/features/platform/extensions/commands/commands.tool.ts`
- `v10/src/features/platform/extensions/commands/registerCoreCommands.ts`
- `v10/src/features/platform/hooks/useCanvas.ts`
- `v10/src/features/chrome/toolbar/EraserControls.tsx`
- `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`
Commands run:
- `scripts/check_layer_rules.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`

## Gate Results (Codex fills)
- Lint: PASS
- Build: PASS
- Script checks: PASS (`scripts/check_layer_rules.sh`)

Manual verification notes:
- `setEraserWidth` command/validation/schema registered.
- Canvas erase radius now uses runtime `eraserWidth`.
- Eraser controls panel integrated via toolbar popover and slider.
