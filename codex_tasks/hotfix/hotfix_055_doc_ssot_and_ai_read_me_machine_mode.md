# Hotfix 055: Doc SSOT Clarification + AI_READ_ME Machine Mode

Status: COMPLETED
Date: 2026-02-18

## Context
- Planning agents referenced stale roadmap snippets from context docs.
- User requested stronger archive/superseded labeling and machine-oriented AI doc shape.

## Scope
- `PROJECT_CONTEXT.md`
- `PROJECT_ROADMAP.md`
- `FEATURE_ALIGNMENT_MATRIX.md`
- `codex_tasks/batch_dispatch_plan_2026_02_17.md`
- `codex_tasks/batch_dispatch_plan_2026_02_18.md`
- `codex_tasks/task_267_design_system_audit_and_plan.md`
- `codex_tasks/task_273_error_boundary_safety_net.md`
- `v10/AI_READ_ME.md`

## Root Cause
- `PROJECT_CONTEXT.md` had an old short-term roadmap section (Task 010/DSL/token registry) that could be misread as active priority.
- Historical specs/plans existed without strong top-level archive markers.
- `v10/AI_READ_ME.md` had grown into mixed narrative + implementation history, increasing agent scan cost.

## Fix
- Marked `PROJECT_CONTEXT.md` short roadmap as **Historical** and redirected execution planning to `PROJECT_ROADMAP.md` + approved tasks.
- Reinforced `PROJECT_ROADMAP.md` as active roadmap SSOT.
- Added archive/superseded warnings to:
  - feature alignment matrix (reference-only)
  - old batch plans (02-17 superseded, 02-18 historical snapshot)
  - superseded tasks 267 and 273
- Rewrote `v10/AI_READ_ME.md` into machine-oriented operational guidance:
  - strict read order
  - invariants/layer rules
  - store/theme/error-boundary/command policies
  - verification gates and map generation guidance
  - roadmap/archive hygiene section

## Validation
- `rg -n "Historical|SSOT|ARCHIVE|SUPERSEDED|DO NOT EXECUTE" PROJECT_CONTEXT.md PROJECT_ROADMAP.md FEATURE_ALIGNMENT_MATRIX.md codex_tasks/batch_dispatch_plan_2026_02_17.md codex_tasks/batch_dispatch_plan_2026_02_18.md codex_tasks/task_267_design_system_audit_and_plan.md codex_tasks/task_273_error_boundary_safety_net.md` PASS
- `rg -n "Machine Mode|Read Order|Layer Boundaries|Theme and Style Invariants|Verification Gates" v10/AI_READ_ME.md` PASS

## Result
- Planning hierarchy is clearer for agents.
- Stale plan/task artifacts are visibly non-executable.
- `v10/AI_READ_ME.md` is optimized for agent operations rather than human narrative consumption.
