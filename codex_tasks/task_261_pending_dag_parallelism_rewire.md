# Task 261: Pending DAG Parallelism Rewire (236~258)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Rewire dependency edges across pending task specs (`task_236~258`) to maximize safe parallel execution with the existing 6-slot sub-agent model.
  - Preserve safety-critical cutover ordering while removing unnecessary serialization.
- What must NOT change:
  - Do not implement runtime/product code.
  - Do not weaken safety/security gates in any task.
  - Do not add dependencies.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_261_pending_dag_parallelism_rewire.md`
- `codex_tasks/task_245_layout_hardcoding_freeze_guard_and_docs_sync.md`
- `codex_tasks/task_246_tablet_pointer_panel_regression_signoff_pack.md`
- `codex_tasks/task_250_dual_track_modding_program_governance.md`

Out of scope:
- Any `v10/src/**` implementation
- Non-pending tasks outside listed files
- Changes to acceptance criteria semantics unrelated to dependency edges

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO (default)
- Boundary rules:
  - Keep hard prerequisites for shell cutover path (`237 -> 238 -> 240 -> 241/242 -> 243 -> 244`) intact.
  - Only remove dependencies that are not required by each task's own compatibility notes.
- Compatibility:
  - `task_246` should depend on factual prerequisites (`task_236`, `task_244`) rather than docs/guard-only `task_245`.
  - `task_250` may begin after runtime foundation (`task_240`) and proceed in parallel with late-stage signoff/docs tasks.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - PLAN-OPT
- Depends on tasks:
  - []
- Enables tasks:
  - Faster execution schedule for pending chain (`task_236~258`)
- Parallel group:
  - G-planning
- Max parallel slots:
  - 6 (default)
- Verification stage for this task:
  - `mid`

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

- [ ] Applies: NO

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: Dependency edges are updated so the minimum execution depth for current pending tasks is reduced from 13 waves to 8 waves (or less) without breaking cutover-critical ordering.
- [ ] AC-2: `task_246` dependency metadata matches its compatibility text (depends on `task_236` + `task_244`).
- [ ] AC-3: `task_250` no longer waits for `task_246` and can start after `task_240`.
- [ ] AC-4: Updated pending graph remains acyclic and internally consistent.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: inspect DAG metadata in `task_245`, `task_246`, `task_250`.
   - Expected result: dependency rewires match this spec.
   - Covers: AC-2, AC-3

2) Step:
   - Command / click path: run pending DAG layer calculation script.
   - Expected result: minimum execution waves <= 8.
   - Covers: AC-1, AC-4

3) Step:
   - Command / click path: inspect computed wave list for cycle/breakage.
   - Expected result: no cycle, clear runnable wave groups.
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Over-aggressive dependency removal could permit premature execution of a spec lacking required input.
- Roll-back:
  - Revert this commit and restore previous dependency metadata.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - Approval reference: user message "응 진행해."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_261_pending_dag_parallelism_rewire.md`
- `codex_tasks/task_245_layout_hardcoding_freeze_guard_and_docs_sync.md`
- `codex_tasks/task_246_tablet_pointer_panel_regression_signoff_pack.md`
- `codex_tasks/task_250_dual_track_modding_program_governance.md`

Commands run (only if user asked or required by spec):
- Pending DAG inventory and layer calculation (node/awk helpers)
- `git status --short`

## Gate Results (Codex fills)

- Lint:
  - N/A
- Build:
  - N/A
- Script checks:
  - PASS (pending DAG layer calculation and cycle check)

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - N/A
- Newly introduced failures:
  - None
- Blocking:
  - NO
- Mitigation:
  - Not required

Manual verification notes:
- AC-1 PASS: minimum pending execution depth reduced to 8 waves.
- AC-2 PASS: `task_246` now depends on `task_236` + `task_244`.
- AC-3 PASS: `task_250` now depends on `task_240`.
- AC-4 PASS: DAG calculation shows no cycle and valid wave grouping.

Notes:
- This task changes scheduling metadata only; no runtime implementation files were modified.
