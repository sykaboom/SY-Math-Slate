# Task 308: Toolbar Docking + Mode Split + Label Clarification

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-19

---

## Goal
- Allow user-selectable toolbar dock position (`left | center | right`) to avoid canvas occlusion.
- Add explicit toolbar interaction modes (`draw | playback | canvas`) for context-focused controls.
- Clarify mixed navigation terminology (Step/Page/Outline) labels.
- Reduce scattered cutover branching by centralizing toolbar render guards.

## Scope
Touched files:
- `v10/src/features/store/useChromeStore.ts`
- `v10/src/features/store/useUIStoreBridge.ts`
- `v10/src/features/extensions/commands/commands.tool.ts`
- `v10/src/features/extensions/commands/registerCoreCommands.ts`
- `v10/src/features/layout/AppLayout.tsx`
- `v10/src/features/toolbar/FloatingToolbar.tsx`
- `v10/src/features/toolbar/PageNavigator.tsx`
- `v10/src/features/toolbar/PlaybackControls.tsx`

Out of scope:
- New network/session policy features

## Acceptance Criteria
- [ ] AC-1: Dock position command/state exists and AppLayout applies it.
- [ ] AC-2: Toolbar UI exposes dock position selection.
- [ ] AC-3: Toolbar mode chips/toggles exist and reduce cross-context clutter.
- [ ] AC-4: Navigation labels are disambiguated in UI copy.
- [ ] AC-5: Cutover guards are consolidated into named booleans/helpers (reduced repeated env checks).
- [ ] AC-6: `cd v10 && npm run lint && npm run build` pass.

## Manual Verification
1) Switch dock left/center/right and verify toolbar avoids covering the same canvas zone.
2) Switch mode draw/playback/canvas and verify control groups change predictably.
3) Check Page/Step/Outline labels for clearer distinction.

## Risks / Rollback
- Risk: mode switching hides critical actions unexpectedly.
- Mitigation: keep More panel as fallback with minimal core actions retained.
- Rollback: `git revert <commit>`.

## Approval Gate
- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received

---

## Implementation Log (Codex fills)
Status: COMPLETED
Changed files:
- `v10/src/features/store/useChromeStore.ts`
- `v10/src/features/store/useUIStoreBridge.ts`
- `v10/src/features/extensions/commands/commands.tool.ts`
- `v10/src/features/extensions/commands/registerCoreCommands.ts`
- `v10/src/features/layout/AppLayout.tsx`
- `v10/src/features/toolbar/FloatingToolbar.tsx`
- `v10/src/features/toolbar/PageNavigator.tsx`
- `v10/src/features/toolbar/PlaybackControls.tsx`
Commands run:
- `scripts/check_layer_rules.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `bash scripts/scan_guardrails.sh`

## Gate Results (Codex fills)
- Lint: PASS
- Build: PASS
- Script checks: PASS (`scripts/check_layer_rules.sh`), WARN-only (`scripts/scan_guardrails.sh`)

Manual verification notes:
- Dock position state/command path wired (`left|center|right`) and AppLayout alignment follows runtime state.
- Toolbar mode split (`draw|playback|canvas`) added for context-focused controls.
- Step/Page/Outline copy clarified in playback/page navigator surfaces.
- Cutover branching reduced via centralized booleans in toolbar render path.
