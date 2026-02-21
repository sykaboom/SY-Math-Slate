# Task 371: Toolbar Category Convergence

Status: PENDING
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-21

---

## Goal (Base Required)
- What to change:
  - Converge toolbar information architecture so each category owns non-overlapping control sets.
- What must NOT change:
  - Do not add net-new domain features in this task.

---

## Scope (Base Required)

Touched files/directories:
- v10/src/features/chrome/toolbar, v10/src/features/chrome/ui-host/toolbar

Out of scope:
- Layout docking mechanics are excluded.

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
  - P4
- Depends on tasks:
  - ['task_370']
- Enables tasks:
  - ['task_372','task_374']
- Parallel group:
  - G4-uihost
- Max parallel slots:
  - 6 (default)
- Verification stage for this task:
  - end

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 3 to 8
- Files shared with other PENDING tasks:
  - FloatingToolbar category components shared
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

- [ ] AC-1: Draw playback canvas categories have explicit responsibility matrix without duplicated actions.
- [ ] AC-2: Primary controls stay discoverable in compact and non-compact layouts.
- [ ] AC-3: Legacy mode-toggle confusion points are removed.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command or click path:
     - Run category checklist and compare action catalog before and after.
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
  - Over-pruning may hide rarely used but needed controls.
- Roll-back:
  - Restore prior category map and selectively reintroduce removed controls.

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
