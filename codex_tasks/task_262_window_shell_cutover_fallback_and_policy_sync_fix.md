# Task 262: Window Shell Cutover Fallback and Policy Sync Fix

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Fix cutover-off regression where host authoring panels became unreachable.
  - Ensure panel policy state is synchronized at layout runtime.
  - Align panel-policy `defaultOpen` with clean-start shell intent (closed by default).
  - Refresh Task 246 signoff artifacts with latest `end` verification PASS.
- What must NOT change:
  - No dependency additions.
  - No command contract/protocol changes.
  - No scope expansion into unrelated features.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_262_window_shell_cutover_fallback_and_policy_sync_fix.md`
- `v10/src/features/platform/extensions/ui/registerCoreSlots.ts`
- `v10/src/features/chrome/layout/AppLayout.tsx`
- `v10/src/core/config/panel-policy.ts`
- `codex_tasks/task_246_tablet_pointer_panel_regression_signoff_pack.md`
- `codex_tasks/workflow/tablet_pointer_panel_signoff.csv`
- `codex_tasks/workflow/tablet_pointer_panel_signoff.md`

Out of scope:
- New UX feature work
- New backend/API changes
- Refactors outside shell/policy/signoff sync

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Keep shell hardcoding-free for functional mounts.
  - Preserve policy-driven role visibility behavior.
  - Keep signoff evidence factual.
- Compatibility:
  - Must remain compatible with Tasks `244`, `245`, `246`, `258`.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W8-HOTFIX
- Depends on tasks:
  - [`task_244`, `task_245`, `task_246`]
- Enables tasks:
  - []
- Parallel group:
  - G-shell-stability
- Max parallel slots:
  - 6 (default)
- Verification stage for this task:
  - `end`

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - Task 244/245/246/258 execution and review, then Codex merge/hotfix
  - Assigned roles:
    - Implementer-A: task_244
    - Implementer-B: task_245
    - Implementer-C: task_246
    - Implementer-D: task_258
    - Reviewer+Verifier: dedicated reviewer pass + Codex final gates
  - File ownership lock plan:
    - Per-task scoped ownership; Codex merge/hotfix only after agent closeout
  - Parallel slot plan:
    - Max 6 slots, executor pool first, reviewer pool second

---

## Optional Block C — Hotfix Exception

- [x] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [x] Applies: YES
- If YES:
  - Evidence (real input, spec, or bug report):
    - Reviewer finding: cutover-off host panel access regression in shell/runtime integration.
  - Sunset criteria:
    - Keep until task chain fully removes cutover bifurcation.

---

## Optional Block E — Documentation Update Check

- [x] Applies: YES
- If YES:
  - [x] Structure changes (file/folder add/move/delete):
    - No map-impacting structure change for `v10/`; map regen not required.
  - [x] Semantic/rule changes:
    - Signoff docs updated to match latest verification state.

---

## Acceptance Criteria (Base Required)

- [x] AC-1: With `NEXT_PUBLIC_LAYOUT_SLOT_CUTOVER=0`, host can still access core panels via slot fallback (no authoring-surface loss).
- [x] AC-2: Panel policy state is synchronized from runtime at layout mount.
- [x] AC-3: Core panel `defaultOpen` in policy aligns with clean-start closed defaults.
- [x] AC-4: `VERIFY_STAGE=end bash scripts/run_repo_verifications.sh` passes.
- [x] AC-5: Task 246 signoff artifacts reflect latest global verification PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - Inspect shell/runtime files and slot registration logic.
   - Expected result:
     - Cutover-off registration path exists and left-panel overlay fallback is present.
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path:
     - Inspect `panel-policy.ts` defaults for data input/prompter/floating toolbar.
   - Expected result:
     - `defaultOpen=false` and host override defaultOpen is false for clean start.
   - Covers: AC-3

3) Step:
   - Command / click path:
     - `VERIFY_STAGE=end bash scripts/run_repo_verifications.sh`
   - Expected result:
     - PASS.
   - Covers: AC-4

4) Step:
   - Command / click path:
     - Inspect Task 246 spec + signoff CSV/MD.
   - Expected result:
     - Global verification row is PASS and narrative matches latest state.
   - Covers: AC-5

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Cutover path split can drift again if launcher/slot registration logic diverges.
- Roll-back:
  - Revert this task commit if fallback path introduces UX regressions.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - Approval reference: delegated execution chain + user instruction to maximize efficient sub-agent orchestration.

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_262_window_shell_cutover_fallback_and_policy_sync_fix.md`
- `v10/src/features/platform/extensions/ui/registerCoreSlots.ts`
- `v10/src/features/chrome/layout/AppLayout.tsx`
- `v10/src/core/config/panel-policy.ts`
- `codex_tasks/task_246_tablet_pointer_panel_regression_signoff_pack.md`
- `codex_tasks/workflow/tablet_pointer_panel_signoff.csv`
- `codex_tasks/workflow/tablet_pointer_panel_signoff.md`

Commands run (only if user asked or required by spec):
- `VERIFY_STAGE=end bash scripts/run_repo_verifications.sh`
- `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - PASS

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - None (latest reruns)
- Newly introduced failures:
  - None
- Blocking:
  - NO
- Mitigation:
  - Not required.

Manual verification notes:
- AC-1 PASS: slot-runtime fallback path restored for cutover-off via registration + left-panel overlay slot.
- AC-2 PASS: `useResolvedPanelPolicy()` is now mounted in `AppLayout`.
- AC-3 PASS: panel-policy defaults now match clean-start closed shell.
- AC-4 PASS: `end` verification full pass.
- AC-5 PASS: Task 246 signoff docs updated to latest verification truth.

Notes:
- This task closes the regression loop discovered by review after delegated wave execution.
