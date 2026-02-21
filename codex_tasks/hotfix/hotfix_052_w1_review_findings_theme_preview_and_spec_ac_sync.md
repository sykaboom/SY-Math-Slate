# Hotfix 052: W1 Review Findings (Theme Preview + Spec AC Sync)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Fix W1 review finding where theme preview variables can remain stale after token/preset changes.
  - Sync W1 completed spec files (`task_167~174`) so acceptance checkboxes reflect completed state.
- What must NOT change:
  - No new feature scope beyond stale-variable cleanup and spec AC sync.
  - No dependency additions.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/hotfix/hotfix_052_w1_review_findings_theme_preview_and_spec_ac_sync.md`
- `v10/src/features/platform/mod-studio/theme/themeIsolation.ts`
- `v10/src/features/platform/store/useModStudioStore.ts`
- `v10/tests/theme_visual_gate.mjs`
- `codex_tasks/task_167_theme_token_schema_v2.md`
- `codex_tasks/task_168_global_theme_variable_mapping_completion.md`
- `codex_tasks/task_169_module_scoped_theme_boundaries.md`
- `codex_tasks/task_170_parchment_notebook_theme_preset_pack.md`
- `codex_tasks/task_171_theme_preset_switcher_and_preview.md`
- `codex_tasks/task_172_hardcoded_style_elimination_pass_a.md`
- `codex_tasks/task_173_hardcoded_style_elimination_pass_b.md`
- `codex_tasks/task_174_visual_regression_theme_gate.md`

Out of scope:
- New presets, layout edits, command bus changes, and non-W1 documentation rewrites.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Keep theme runtime changes inside existing mod-studio theme/store layer.
  - No layer rule violations.
- Compatibility:
  - Existing W1 preset/preview workflow remains intact.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W1-HOTFIX
- Depends on tasks:
  - [`task_167`, `task_168`, `task_169`, `task_170`, `task_171`, `task_172`, `task_173`, `task_174`]
- Enables tasks:
  - [`task_176+`]
- Parallel group:
  - G1-hotfix
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - `task_175`
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: Codex
    - Implementer-B: Codex
    - Implementer-C: Codex
    - Reviewer+Verifier: Codex
  - File ownership lock plan:
    - single-codex ownership for hotfix scope files
  - Parallel slot plan:
    - no sub-agent spawn for this hotfix

If NO:
- Execution mode: MANUAL

---

## Optional Block C — Hotfix Exception

- [x] Applies: YES
- If YES:
  - Explicit user hotfix approval quote:
    - User quote: "검토결과 해결부터해."
  - Exact hotfix scope/files:
    - theme preview stale variable cleanup + spec AC sync for task_167~174
  - Hotfix log path:
    - `codex_tasks/hotfix/hotfix_052_w1_review_findings_theme_preview_and_spec_ac_sync.md`

---

## Optional Block D — Speculative Defense Check

- [x] Applies: YES
- If YES:
  - Evidence (real input, spec, or bug report):
    - Review finding: stale theme preview variable risk + AC checkbox desync.
  - Sunset criteria:
    - Preview apply path removes stale vars and spec AC checkboxes match completion state.

---

## Optional Block E — Documentation Update Check

- [ ] Applies: NO

---

## Acceptance Criteria (Base Required)

- [x] AC-1: Theme preview apply path removes stale previously-applied `--theme-*` / `--mod-*` variables.
- [x] AC-2: Clearing token values in mod-studio store removes overrides instead of leaving stale entries.
- [x] AC-3: `task_167~174` acceptance checkboxes are synced to completed state and all gates pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: PASS.
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path: `scripts/check_v10_theme_visual_gate.sh && VERIFY_STAGE=end bash scripts/run_repo_verifications.sh`
   - Expected result: PASS.
   - Covers: AC-1, AC-2, AC-3

3) Step:
   - Command / click path: open `codex_tasks/task_167~174_*.md` and confirm AC checkboxes are checked.
   - Expected result: synced with completed status.
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Incorrect stale-variable cleanup could remove active variables.
- Roll-back:
  - Revert `themeIsolation.ts` and `useModStudioStore.ts` to pre-hotfix state.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User quote: "검토결과 해결부터해."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/hotfix/hotfix_052_w1_review_findings_theme_preview_and_spec_ac_sync.md`
- `v10/src/features/platform/mod-studio/theme/themeIsolation.ts`
- `v10/src/features/platform/store/useModStudioStore.ts`
- `v10/tests/theme_visual_gate.mjs`
- `codex_tasks/task_167_theme_token_schema_v2.md`
- `codex_tasks/task_168_global_theme_variable_mapping_completion.md`
- `codex_tasks/task_169_module_scoped_theme_boundaries.md`
- `codex_tasks/task_170_parchment_notebook_theme_preset_pack.md`
- `codex_tasks/task_171_theme_preset_switcher_and_preview.md`
- `codex_tasks/task_172_hardcoded_style_elimination_pass_a.md`
- `codex_tasks/task_173_hardcoded_style_elimination_pass_b.md`
- `codex_tasks/task_174_visual_regression_theme_gate.md`

Commands run (only if user asked or required by spec):
- `cd v10 && npm run lint && npm run build`
- `scripts/check_v10_theme_visual_gate.sh`
- `VERIFY_STAGE=end bash scripts/run_repo_verifications.sh`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - PASS

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
- `themeIsolation.ts` now tracks previous applied variables and removes stale `--theme-*` / `--mod-*` entries via `root.style.removeProperty(...)`.
- `useModStudioStore.ts` now deletes override keys when token value is cleared, including module map cleanup when empty.
- `theme_visual_gate.mjs` now asserts stale cleanup and override-delete paths.
- `task_167~174` AC checkboxes are synced to checked state.

Notes:
- Verification passed with no new dependency and no layer violations.
