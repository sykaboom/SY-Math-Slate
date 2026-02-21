# Task 109: Design Tokenization for Toolbar/UI (Phase 1)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-14

---

## Goal (Base Required)
- What to change:
  - Introduce semantic toolbar/UI design tokens and replace hardcoded toolbar visual classes/colors with token-based classes.
  - Remove inline color styles from pen/laser color controls by switching to token-backed color swatches.
  - Align typography defaults and chalk theme color constants with CSS variable/token references where safe.
- What must NOT change:
  - No behavior changes to drawing, playback, persistence, or extension runtime.
  - No store/API contract changes.
  - No layout structure changes (no new panel geometry/routing changes).

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/app/globals.css`
- `v10/tailwind.config.ts`
- `v10/src/core/themes/chalkTheme.ts`
- `v10/src/core/config/typography.ts`
- `v10/src/features/chrome/toolbar/atoms/ToolButton.tsx`
- `v10/src/features/chrome/toolbar/atoms/ToolbarPanel.tsx`
- `v10/src/features/chrome/toolbar/atoms/ToolbarSeparator.tsx`
- `v10/src/features/chrome/toolbar/PenControls.tsx`
- `v10/src/features/chrome/toolbar/LaserControls.tsx`
- `v10/src/features/chrome/toolbar/PageNavigator.tsx`
- `v10/src/features/chrome/toolbar/PlaybackControls.tsx`
- `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`

Out of scope:
- `v10/src/features/chrome/layout/*` and kiosk/role routing
- `v10/src/features/platform/store/*` state slicing
- `v10/src/core/extensions/*` middleware/queue changes
- Full shadcn `ui/components/*` token migration (handled in later slice)

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - No cross-layer violations; keep existing import boundaries.
  - No new globals, no unsafe HTML changes.
- Compatibility:
  - Existing toolbar interactions and command handlers must remain backward compatible.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - Task 109 only (this phase)
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: Sub-agent (tokens/config)
    - Implementer-B: Sub-agent (toolbar atoms + pen/laser)
    - Implementer-C: Sub-agent (toolbar containers + typography/chalk)
    - Reviewer+Verifier: Codex
  - File ownership lock plan:
    - Implementer-A: `globals.css`, `tailwind.config.ts`
    - Implementer-B: `ToolButton.tsx`, `ToolbarPanel.tsx`, `ToolbarSeparator.tsx`, `PenControls.tsx`, `LaserControls.tsx`
    - Implementer-C: `PageNavigator.tsx`, `PlaybackControls.tsx`, `FloatingToolbar.tsx`, `typography.ts`, `chalkTheme.ts`
  - Parallel slot plan:
    - Max 6 active slots; use 3 implementers + 1 verifier wave.

If NO:
- Execution mode: MANUAL

---

## Optional Block C — Hotfix Exception

- [x] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [x] Applies: NO

---

## Optional Block E — Documentation Update Check

- [x] Applies: NO

---

## Acceptance Criteria (Base Required)

- [x] AC-1: `globals.css` and `tailwind.config.ts` expose semantic token aliases used by toolbar styles (no direct `bg-slate-*` / `text-white/*` dependence in modified toolbar files).
- [x] AC-2: `PenControls.tsx` and `LaserControls.tsx` no longer use inline `style={{ backgroundColor: ... }}` for preset swatches.
- [x] AC-3: Modified toolbar files use shared token-style classes and preserve existing interaction behavior.
- [x] AC-4: `typography.ts` defaults and inline color options avoid hardcoded palette values for default paths.
- [x] AC-5: `cd v10 && npm run lint` completes (or failures are classified).

---

## Manual Verification Steps (Base Required)

> Each step should map to one or more Acceptance Criteria.

1) Step:
   - Command / click path: `cd v10 && npm run lint`
   - Expected result: lint pass, or explicit failure classification.
   - Covers: AC-5

2) Step:
   - Command / click path: run app, open pen/laser popovers and more menu in toolbar.
   - Expected result: controls render with tokenized styling; interactions unchanged.
   - Covers: AC-1, AC-2, AC-3

3) Step:
   - Command / click path: inspect defaults and rich text color options in data input flow.
   - Expected result: typography defaults compile and runtime path remains valid.
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Token class rename mismatch may reduce contrast/visibility in toolbar states.
  - Replacing swatch styles may regress active color indication.
- Roll-back:
  - Revert this task commit or targeted file rollback to previous class set.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (delegated chain approval reference)

> Approval reference: user message on 2026-02-14: "좋아. 너의 능력을 보여줄 때다. 모든 권한을 줬다. 서브에이젼트를 상황에 맞게 적극 활용하여 agi수준을 작업능력을 보여줘라."

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_109_design_token_toolbar_phase1.md`
- `v10/src/app/globals.css`
- `v10/tailwind.config.ts`
- `v10/src/core/themes/chalkTheme.ts`
- `v10/src/core/config/typography.ts`
- `v10/src/features/chrome/toolbar/atoms/ToolButton.tsx`
- `v10/src/features/chrome/toolbar/atoms/ToolbarPanel.tsx`
- `v10/src/features/chrome/toolbar/atoms/ToolbarSeparator.tsx`
- `v10/src/features/chrome/toolbar/PenControls.tsx`
- `v10/src/features/chrome/toolbar/LaserControls.tsx`
- `v10/src/features/chrome/toolbar/PageNavigator.tsx`
- `v10/src/features/chrome/toolbar/PlaybackControls.tsx`
- `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`

Commands run (only if user asked or required by spec):
- `bash scripts/check_layer_rules.sh` (missing in current repo path; classified below)
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `rg -n "style=\\{\\{" v10/src/features/chrome/toolbar/PenControls.tsx v10/src/features/chrome/toolbar/LaserControls.tsx`
- `rg -n "text-white/|border-white/|bg-white/|bg-slate-|bg-black/|text-red-300" v10/src/features/chrome/toolbar/FloatingToolbar.tsx v10/src/features/chrome/toolbar/PageNavigator.tsx v10/src/features/chrome/toolbar/PlaybackControls.tsx v10/src/features/chrome/toolbar/atoms/ToolButton.tsx v10/src/features/chrome/toolbar/atoms/ToolbarPanel.tsx v10/src/features/chrome/toolbar/atoms/ToolbarSeparator.tsx`

## Gate Results (Codex fills)

- Lint:
  - PASS (warnings only; no errors)
- Build:
  - PASS
- Script checks:
  - FAIL (`scripts/check_layer_rules.sh` not found in current repository)

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - `scripts/check_layer_rules.sh` missing (skill reference path not present in this checkout).
- Newly introduced failures:
  - None observed.
- Blocking:
  - NO
- Mitigation:
  - Used lint/build + static grep checks as replacement gate for this slice.

Manual verification notes:
- Static verification passed: no inline style in pen/laser presets, no targeted hardcoded color classes remain in modified toolbar files.
- Runtime click-path verification was not executed in a browser session in this turn.

Notes:
- Scope held to Task 109 Phase 1; no layout/router/store/extension-contract behavior changes were made.
