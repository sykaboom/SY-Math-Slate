# Task 170: Parchment Notebook Theme Preset Pack

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Add first-class theme presets (`chalk`, `parchment`, `notebook`) using semantic token maps.
- What must NOT change:
  - No layout structure changes.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_170_parchment_notebook_theme_preset_pack.md`
- `v10/src/core/themes/presets.ts` (new)
- `v10/src/features/mod-studio/core/types.ts`
- `v10/src/features/mod-studio/publish/publishStudioDraft.ts`
- `v10/AI_READ_ME.md`

Out of scope:
- UI controls for selecting presets (task 171).

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Compatibility:
  - existing draft workflow remains valid.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W1
- Depends on tasks:
  - [`task_167`, `task_168`, `task_169`]
- Enables tasks:
  - [`task_171`, `task_174`]
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
    - preset files single ownership
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

- [x] AC-1: three named presets exist with semantic token values.
- [x] AC-2: publish/export path can apply preset tokens without schema break.
- [x] AC-3: lint/build pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: PASS.
   - Covers: AC-2, AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - preset values may reduce contrast if poorly tuned.
- Roll-back:
  - revert to chalk-only preset.

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
- `codex_tasks/task_170_parchment_notebook_theme_preset_pack.md`
- `v10/src/core/themes/presets.ts`
- `v10/src/features/mod-studio/core/types.ts`
- `v10/src/features/mod-studio/publish/publishStudioDraft.ts`
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
- Presets `chalk`, `parchment`, `notebook` added with semantic token maps.
- publish/export path merges `preset + overrides` through `resolveThemeDraftTokens`.
- ThemeDraft typing updated to include `presetId`.

Notes:
- Preset pack added without changing non-theme layout structure.
