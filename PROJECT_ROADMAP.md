# Project Roadmap (Execution SSOT)

Status: ACTIVE SSOT

This document is the only roadmap-level execution source.
- Historical plans are non-authoritative unless marked ACTIVE here.
- Detailed implementation contracts are tracked in approved codex_tasks/task files.

---

## Active Program — Progressive Refactor to Mod-first Steady State
Canonical batch plan:
- codex_tasks/batch_dispatch_plan_2026_02_21_phase0_9.md
- codex_tasks/batch_dispatch_plan_2026_02_21_relayout_466_471.md

Canonical architecture docs:
- v10/docs/architecture/ModEngine.md
- v10/docs/architecture/ModularizationDependencyFlow.md

### Phase Map (Current Active)
- Phase 0: task_361~364 authority and guardrails baseline
- Phase 1: task_365~368 toolbar placement SSOT and edge snap
- Phase 2: task_369~372 input gateway and command path SSOT
- Phase 3: task_373~376 mod/package contract and dual-axis retirement
- Phase 4: task_377~380 UI host dedup and toolbar IA convergence
- Phase 5: task_381~384 theme runtime UX and JSON IO hardening
- Phase 6: task_385~388 session policy live sharing and access modes
- Phase 7: task_389~392 teacher-in-loop AI pipeline v2
- Phase 8: task_393~396 mod package manager and authoring workflows
- Phase 9: task_397~400 ops hardening and final closeout
- Phase 10: task_466~471 topology-v2 convergence (COMPLETED)
  - core modding namespace convergence (`core/mod` -> `core/runtime/modding`)
  - features taxonomy relayout (`chrome/editor/collaboration/governance/platform`)
  - compat purge + guardrail finalize

### Program Exit Condition
After task_471 closeout:
1) common extension path is limited to UI, feature, mod package layers,
2) no direct mod mutation into layout/store internals,
3) production operations and rollback playbooks are verified.

---

## Historical Section (Archived)
Previous track bundles are historical references only.
- superseded fullchain drafts moved under:
  - codex_tasks/cleanup/superseded_2026_02_21_low_quality_fullchain_v1/
  - codex_tasks/cleanup/superseded_2026_02_21_fullchain/
