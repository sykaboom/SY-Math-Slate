# Task 229: Experimentation A/B Flag Layer

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Add deterministic A/B experiment evaluation layer for growth features.
  - Register experiment salt flag and guard registry consistency.
- What must NOT change:
  - No behavior regression in existing host/student policy paths.
  - No dependency additions.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_229_experimentation_ab_flag_layer.md`
- `v10/src/core/config/experiments.ts` (new)
- `v10/src/features/platform/experiments/abFlags.ts` (new)
- `v10/src/features/platform/experiments/index.ts` (new)
- `codex_tasks/workflow/experiment_registry.env` (new)
- `codex_tasks/workflow/feature_flag_registry.env`
- `scripts/check_v10_experiment_registry.sh` (new)
- `v10/tests/experiment_registry_guard.mjs` (new)

Out of scope:
- Marketplace API integration
- Modding SDK CLI commands
- UI treatment rollout

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Runtime must stay deterministic (same subject key => same variant).
- Compatibility:
  - If experiment is unknown/disabled, default variant must be `control`.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W10
- Depends on tasks:
  - [`task_228`]
- Enables tasks:
  - [`task_230`]
- Parallel group:
  - G10-growth
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
    - task_228~230
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: Codex
    - Implementer-B: Codex
    - Implementer-C: Codex
    - Reviewer+Verifier: Codex
  - File ownership lock plan:
    - experiment config/runtime and registry guard files owned by this task.
  - Parallel slot plan:
    - sequential

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
- If YES:
  - [x] Structure changes (file/folder add/move/delete):
    - Run `node scripts/gen_ai_read_me_map.mjs`
    - Verify `v10/AI_READ_ME_MAP.md` update if needed
  - [x] Semantic/rule changes:
    - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [x] AC-1: Experiment registry exists with deterministic config and rollout constraints.
- [x] AC-2: A/B evaluator returns stable variant for same subject/experiment input.
- [x] AC-3: Guard script ensures experiment registry + feature flag registry invariants.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: `node v10/tests/experiment_registry_guard.mjs`
   - Expected result: PASS.
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path: `scripts/check_v10_experiment_registry.sh`
   - Expected result: PASS.
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Misconfigured rollout percentages can skew experiments.
- Roll-back:
  - Disable experiment at registry and keep control fallback.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User quote: "실행해."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_229_experimentation_ab_flag_layer.md`
- `v10/src/core/config/experiments.ts`
- `v10/src/features/platform/experiments/abFlags.ts`
- `v10/src/features/platform/experiments/index.ts`
- `codex_tasks/workflow/experiment_registry.env`
- `codex_tasks/workflow/feature_flag_registry.env`
- `scripts/check_v10_experiment_registry.sh`
- `v10/tests/experiment_registry_guard.mjs`

Commands run (only if user asked or required by spec):
- `node v10/tests/experiment_registry_guard.mjs`
- `scripts/check_v10_experiment_registry.sh`

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
- experiment registry guard passes and verifies env registry alignment.
- feature flag registry includes `NEXT_PUBLIC_EXPERIMENT_SALT` consumed by runtime bucketing path.

Notes:
- unknown or ineligible experiments deterministically fall back to `control`.
