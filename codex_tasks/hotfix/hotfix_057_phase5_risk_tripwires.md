# Hotfix 057: Phase5 Risk Tripwires (Rollback + Flag Cutover + Preflight Smoke)

Status: COMPLETED
Date: 2026-02-18

## Context
- User approved pre-implementation hardening before large Phase5 implementation wave.
- Goal: add additive safeguards without changing pending task numbering (`task_284~291`) or rewriting those specs.

## Scope
- `scripts/run_beta_quality_gate.sh`
- `codex_tasks/workflow/feature_flag_registry.env`
- `codex_tasks/workflow/release_candidate_signoff_checklist.md`
- `codex_tasks/workflow/release_rollback_runbook.md` (new)
- `scripts/check_v10_release_rollback_guard.sh` (new)
- `scripts/check_v10_phase5_flag_cutover.sh` (new)
- `v10/tests/phase5_preflight_smoke.mjs` (new)

## Root Cause
- Rollback procedure existed as checklist text only; no executable guard for runbook completeness.
- Phase5 cutover flags were not reserved in registry.
- No preflight smoke to block invalid Phase5 flag combinations before implementation/cutover.

## Fix
1. Rollback guard
   - Added `codex_tasks/workflow/release_rollback_runbook.md` with trigger/rollback/verification steps.
   - Added `scripts/check_v10_release_rollback_guard.sh` to enforce runbook headings + required commands + checklist linkage.

2. Feature-flag cutover guard
   - Added Phase5 flags to `codex_tasks/workflow/feature_flag_registry.env`:
     - `NEXT_PUBLIC_PHASE5_SNAPSHOT_ENABLED`
     - `NEXT_PUBLIC_PHASE5_LIVE_ONEWAY_ENABLED`
     - `NEXT_PUBLIC_PHASE5_LIVE_TWOWAY_ENABLED`
     - `NEXT_PUBLIC_PHASE5_PARTIAL_SHARING_ENABLED`
     - `NEXT_PUBLIC_PHASE5_AI_APPROVAL_ENABLED`
   - Added `scripts/check_v10_phase5_flag_cutover.sh`:
     - registry presence checks
     - boolean env normalization checks
     - dependency rule (`two-way` requires `one-way`)

3. Preflight smoke gate
   - Added `v10/tests/phase5_preflight_smoke.mjs` to fail fast on unsafe flag/runtime combinations.
   - Wired new guards into `scripts/run_beta_quality_gate.sh` before lint/build and smoke phase.

## Validation
- `scripts/check_v10_release_rollback_guard.sh` PASS
- `scripts/check_v10_feature_flag_registry.sh` PASS (unused new flags are WARN-only by design)
- `scripts/check_v10_phase5_flag_cutover.sh` PASS
- `bash scripts/run_beta_quality_gate.sh`
  - New guards PASS
  - New `phase5_preflight_smoke` PASS
  - Existing `v10/tests/beta_gate_perf_a11y.mjs` FAIL (`critical app layout controls must keep aria labels.`)

## Failure Classification
- `beta_gate_perf_a11y.mjs` failure is treated as **pre-existing / out-of-scope** for this hotfix.
- This hotfix did not modify the asserted AppLayout aria-label paths.

## Result
- Phase5 large-wave entry now has deterministic rollback/flag/preflight tripwires.
- Pending spec numbering and dependency chain (`task_284~291`) remain unchanged.
