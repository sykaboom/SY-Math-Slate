# Task 374: Session Policy Schema and Viewer Modes

Status: PENDING
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-21

---

## Goal (Base Required)
- What to change:
  - Define session policy contract selecting snapshot live and one-way two-way behavior without hardcoded template branches.
- What must NOT change:
  - Do not introduce CRDT in this phase.

---

## Scope (Base Required)

Touched files/directories:
- v10/src/core/session-policy, v10/src/features/chrome/viewer, v10/src/core/mod/package

Out of scope:
- CRDT distributed conflict engine is excluded.

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
  - P6
- Depends on tasks:
  - ['task_371','task_373']
- Enables tasks:
  - ['task_375','task_376']
- Parallel group:
  - G6-viewer
- Max parallel slots:
  - 6 (default)
- Verification stage for this task:
  - end

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 3 to 8
- Files shared with other PENDING tasks:
  - session policy viewer layout overlap
- Cross-module dependency:
  - YES
- Parallelizable sub-units:
  - 2
- Estimated single-agent duration:
  - about 35min
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

- [ ] AC-1: Policy schema supports snapshot live and directionality flags with defaults.
- [ ] AC-2: Template package selects session behavior via data not code branch sprawl.
- [ ] AC-3: Viewer mode selection is deterministic from policy payload.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command or click path:
     - Run schema validation and mode-selection smoke scenarios.
   - Expected result:
     - Matches AC-1 and AC-2.
   - Covers: AC-1, AC-2

2) Step:
   - Command or click path:
     - Run cd v10 and npm run lint and npm run build.
   - Expected result:
     - Matches AC-3 and no unintended regressions.
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Policy ambiguity can create mismatched viewer runtime behavior.
- Roll-back:
  - Pin to snapshot-only fallback policy if rollback needed.

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
