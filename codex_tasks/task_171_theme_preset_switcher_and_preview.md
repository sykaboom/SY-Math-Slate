# Task 171: Theme Preset Switcher and Preview

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Add GUI controls in Mod Studio theme section to select/apply preset and preview immediately.
- What must NOT change:
  - No non-theme feature behavior changes.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_171_theme_preset_switcher_and_preview.md`
- `v10/src/features/platform/store/useModStudioStore.ts`
- `v10/src/features/platform/mod-studio/theme/ThemeStudioSection.tsx`
- `v10/src/features/platform/mod-studio/theme/themeIsolation.ts`
- `v10/AI_READ_ME.md`

Out of scope:
- broad UI redesign beyond theme controls.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Compatibility:
  - existing manual token editing remains available.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W1
- Depends on tasks:
  - [`task_170`]
- Enables tasks:
  - [`task_172`, `task_173`, `task_174`]
- Parallel group:
  - G1-theme
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `mid`

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - W1 (`task_167~174`)
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: Codex
    - Implementer-B: Codex
    - Implementer-C: Codex
    - Reviewer+Verifier: Codex
  - File ownership lock plan:
    - Mod studio theme files single ownership
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

- [x] Applies: YES

---

## Acceptance Criteria (Base Required)

- [x] AC-1: preset selector UI is available in Theme Studio.
- [x] AC-2: selecting a preset updates draft and preview state.
- [x] AC-3: lint/build pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: PASS.
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - incorrect preset application could override custom draft unexpectedly.
- Roll-back:
  - revert preset UI, keep manual token editing.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User quote: "바로 w1 넘어가자."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_171_theme_preset_switcher_and_preview.md`
- `v10/src/features/platform/store/useModStudioStore.ts`
- `v10/src/features/platform/mod-studio/theme/ThemeStudioSection.tsx`
- `v10/src/features/platform/mod-studio/theme/themeIsolation.ts`
- `v10/AI_READ_ME.md`

Commands run (only if user asked or required by spec):
- `cd v10 && npm run lint`
- `cd v10 && npm run build`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - PASS (`scripts/check_v10_theme_visual_gate.sh`)

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
- Theme Studio now exposes preset selector + apply flow.
- selecting a preset updates draft (`setThemePreset`) and applies immediate preview.
- manual global/module token editing remains available and previews correctly.

Notes:
- Implemented without non-theme feature behavior changes.
