# Task 364: Toolbar Placement State and Resolver SSOT

Status: PENDING
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-21

---

## Goal (Base Required)
- What to change:
  - Replace legacy placement semantics with dock or floating state and edge-based resolver contract.
- What must NOT change:
  - Do not introduce new visual style changes unrelated to placement behavior.

---

## Scope (Base Required)

Touched files/directories:
- v10/src/features/store, v10/src/features/layout, v10/src/features/toolbar, v10/src/core/config

Out of scope:
- Theme token studio logic changes are excluded.

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
  - P1
- Depends on tasks:
  - ['task_361','task_363']
- Enables tasks:
  - ['task_365']
- Parallel group:
  - G1-layout-core
- Max parallel slots:
  - 6 (default)
- Verification stage for this task:
  - end

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 4 to 9
- Files shared with other PENDING tasks:
  - AppLayout panelAdapters FloatingToolbar shared
- Cross-module dependency:
  - YES
- Parallelizable sub-units:
  - 3
- Estimated single-agent duration:
  - about 45min
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - YES
  - If YES, respect file ownership lock when sharing AppLayout, FloatingToolbar, panelAdapters.
- Rationale:
  - Keep critical-path files serialized and parallelize independent policy, command, store, docs units.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: YES
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

- [ ] AC-1: Legacy left center right semantics are fully removed from runtime placement logic.
- [ ] AC-2: Placement SSOT is split into state SSOT store and decision SSOT resolver.
- [ ] AC-3: Existing toolbar actions remain functional after migration.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command or click path:
     - Run placement interactions on desktop and tablet emulation.
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
  - Shared file contention can cause regressions in AppLayout and Toolbar flows.
- Roll-back:
  - Revert placement state resolver changes and restore prior adapter mapping.

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
