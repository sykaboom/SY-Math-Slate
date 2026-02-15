# Task 161: 70-Spec Roadmap Spec Pack (Local AI Mesh Included)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Create an executable roadmap spec pack for the expanded option-2 plan (70 specs) that includes modularization, anti-spaghetti constraints, and future local-AI connectivity.
  - Define wave-based DAG sequencing and per-task metadata (id, scope axis, dependency wave, parallel group, verification stage).
- What must NOT change:
  - No runtime code changes under `v10/src`.
  - No dependency additions.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_161_roadmap_70spec_local_ai_mesh_specpack.md`
- `codex_tasks/workflow/roadmap_70spec_local_ai_mesh_master.md` (new)
- `codex_tasks/workflow/roadmap_70spec_local_ai_mesh_task_matrix.csv` (new)

Out of scope:
- Implementing any feature tasks from the roadmap.
- Modifying existing task specs status outside this task.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Planning/spec artifacts only.
  - Preserve AGENTS governance and SSOT order.
  - Must encode non-negotiable invariants:
    - modularization-first,
    - optimized coding,
    - anti-spaghetti,
    - mathematically elegant structure.
- Compatibility:
  - Roadmap should be consumable by delegated wave execution (max 6 parallel slots).

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-PLAN-70
- Depends on tasks:
  - []
- Enables tasks:
  - `task_162+` execution chains (future)
- Parallel group:
  - G-planning
- Max parallel slots:
  - 6
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

- [x] Applies: YES
- If YES:
  - [x] Structure changes (file/folder add/move/delete):
    - Add roadmap workflow docs.
  - [x] Semantic/rule changes:
    - Roadmap governance invariants explicitly documented.

---

## Acceptance Criteria (Base Required)

- [x] AC-1: Roadmap master document defines 70 specs (`task_161~task_230`) with 10+ wave DAG sequencing.
- [x] AC-2: Roadmap explicitly encodes modularization/anti-spaghetti/optimized-structure invariants.
- [x] AC-3: Task matrix CSV exists with machine-readable fields for delegated execution orchestration.
- [x] AC-4: Each task entry includes at least wave, objective axis, dependency wave, parallel group, verification stage.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: open roadmap master doc and verify ranges/count.
   - Expected result: exactly 70 tasks planned across waves.
   - Covers: AC-1

2) Step:
   - Command / click path: check non-negotiable invariants section.
   - Expected result: modularization/optimized coding/anti-spaghetti constraints present.
   - Covers: AC-2

3) Step:
   - Command / click path: open task matrix CSV.
   - Expected result: row entries for `161..230` with required metadata fields.
   - Covers: AC-3, AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Overly broad roadmap could create execution ambiguity if wave gates are not respected.
- Roll-back:
  - Revert newly added roadmap docs and regenerate a narrower plan.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User quote: "좋아. 작성하자. 2번으로."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_161_roadmap_70spec_local_ai_mesh_specpack.md`
- `codex_tasks/workflow/roadmap_70spec_local_ai_mesh_master.md`
- `codex_tasks/workflow/roadmap_70spec_local_ai_mesh_task_matrix.csv`

Commands run (only if user asked or required by spec):
- `wc -l codex_tasks/workflow/roadmap_70spec_local_ai_mesh_task_matrix.csv`
- `awk -F, 'NR>1 {print $1}' codex_tasks/workflow/roadmap_70spec_local_ai_mesh_task_matrix.csv | head -n 3`
- `awk -F, 'NR>1 {print $1}' codex_tasks/workflow/roadmap_70spec_local_ai_mesh_task_matrix.csv | tail -n 3`
- `awk -F, 'NR>1 {count++; if ($1<161 || $1>230) bad++} END {print \"rows=\"count, \"bad=\"bad+0}' codex_tasks/workflow/roadmap_70spec_local_ai_mesh_task_matrix.csv`

## Gate Results (Codex fills)

- Lint:
  - N/A
- Build:
  - N/A
- Script checks:
  - N/A

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
- Task matrix file has 71 lines total (header + 70 rows).
- Task id range verified: starts at 161, ends at 230, with no out-of-range row.
- Master roadmap includes 11-wave DAG and explicit non-negotiable architecture invariants.

Notes:
- This task produces planning artifacts only; no runtime source code changes were made.
