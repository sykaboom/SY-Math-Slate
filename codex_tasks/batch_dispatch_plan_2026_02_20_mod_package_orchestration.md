# Batch Dispatch Plan — Mod Package + Input Routing Orchestration

Date: 2026-02-20
Planner: Codex
Target: v10/
Mode: Max orchestration mode (scheduler-first)

---

## Scope

Tasks covered:
- task_337
- task_338
- task_339
- task_340
- task_341
- task_342
- task_343
- task_344
- task_345
- task_346
- task_347
- task_348
- task_349

---

## File-Conflict Aware Wave Plan

### Wave 0 (serial foundation)
- `task_337`

### Wave 1 (parallel, no hot-file overlap)
- `task_338` (template adapter)
- `task_339` (store bridge)
- `task_340` (input bridge scaffold)

### Wave 2 (mixed)
- serial: `task_341` (pointer/wheel in `useViewportInteraction.ts`)
- parallel lane: `task_343` (toolbar policy path)
- parallel lane: `task_346` (guardrails/CI)

### Wave 3 (serial + parallel)
- serial: `task_342` (keyboard on same viewport hot-file)
- parallel lane: `task_344` (ui-host package filtering)

### Wave 4 (parallel convergence)
- `task_345` (studio diagnostics)
- `task_347` (regression matrix/check convergence)

### Wave 5
- `task_348` (docs/operator guide)

### Wave 6 (final retirement)
- `task_349`

---

## Sub-agent Slot Strategy (max 6)

- Default split:
  - 3 implementers
  - 1 reviewer/verifier
  - 1 guardrail lane
  - 1 spare slot (hot-file fallback)

- Hot-file rule:
  - `useViewportInteraction.ts`, `FloatingToolbar.tsx`, `panelAdapters.tsx`, `templatePackRegistry.ts` are single-owner files.

- Reassignment policy:
  - soft ping at 90s, reassignment check at 180s.
  - do not reassign while lint/build process is running.

---

## Exit Criteria

- All tasks `Status: COMPLETED`.
- Full gate pass on final wave:
  - `bash scripts/check_layer_rules.sh`
  - `bash scripts/check_mod_contract.sh`
  - `cd v10 && npm run lint`
  - `cd v10 && npm run build`
- No unresolved dual-axis runtime ownership path remains after task_349.
