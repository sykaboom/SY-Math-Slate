# Task 363: Modular Boundary Gate Pack

Status: PENDING
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-21

---

## Goal (Base Required)
- What to change:
  - Strengthen automated boundary enforcement for mod package runtime ui-host dependency rules.
- What must NOT change:
  - Do not alter core feature behavior; only enforce constraints and diagnostics.

---

## Scope (Base Required)

Touched files/directories:
- v10/eslint.config.mjs, scripts/check_layer_rules.sh, scripts/check_mod_contract.sh, task_363 spec

Out of scope:
- No visual UI feature changes.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO (default)
- Boundary rules:
  - Follow scripts/check_layer_rules.sh and scripts/check_mod_contract.sh.
  - No direct mod or package import from layout internals except designated bridge.
- Compatibility:
  - Existing runtime behaviors remain backward-compatible unless explicitly approved in this task.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - P0
- Depends on tasks:
  - ['task_361','task_362']
- Enables tasks:
  - ['task_366','task_368']
- Parallel group:
  - G0-guards
- Max parallel slots:
  - 6 (default)
- Verification stage for this task:
  - end

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 2 to 6
- Files shared with other PENDING tasks:
  - eslint config shared
- Cross-module dependency:
  - YES
- Parallelizable sub-units:
  - 3
- Estimated single-agent duration:
  - about 30min
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - YES
  - If YES, respect file ownership lock when sharing AppLayout, FloatingToolbar, panelAdapters.
- Rationale:
  - Keep critical-path files serialized and parallelize independent policy, command, store, docs units.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO
- If YES, fill all items:
  - [ ] SVG path in design_drafts/
  - [ ] SVG has explicit viewBox with width, height, ratio
  - [ ] Tablet viewport checks considered:
    - 768x1024 / 820x1180 / 1024x768 / 1180x820
  - [ ] Numeric redlines recorded in spec
  - [ ] Codex verified SVG exists before implementation

---

## Optional Block B — Delegated Execution

- [ ] Applies: NO

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

- [ ] Applies: YES
- If YES:
  - [ ] Structure changes file folder add move delete:
    - Run node scripts/gen_ai_read_me_map.mjs
    - Verify v10/AI_READ_ME_MAP.md update if needed
  - [ ] Semantic or rule changes:
    - Verify v10/AI_READ_ME.md update if needed

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: Rules reject direct forbidden imports between mod runtime and layout store internals.
- [ ] AC-2: Script checks provide actionable violations with non-zero exit on rule break.
- [ ] AC-3: Existing passing paths remain passing.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command or click path:
     - Run scripts/check_layer_rules.sh and scripts/check_mod_contract.sh.
   - Expected result:
     - Matches AC-1 and AC-2.
   - Covers: AC-1, AC-2

2) Step:
   - Command or click path:
     - Run cd v10 and npm run lint.
   - Expected result:
     - Matches AC-3 and no unintended regressions.
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Over-strict rules can block legitimate bridge paths.
- Roll-back:
  - Revert lint and script rule delta to previous baseline.

---

## Approval Gate (Base Required)

- [ ] Spec self-reviewed by Codex
- [ ] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- ...

Commands run (only if user asked or required by spec):
- ...

## Gate Results (Codex fills)

- Lint:
  - PASS | FAIL | N/A
- Build:
  - PASS | FAIL | N/A
- Script checks:
  - PASS | FAIL | N/A

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - (file / command / reason)
- Newly introduced failures:
  - (file / command / reason)
- Blocking or non-blocking:
  - BLOCKING | NON-BLOCKING
