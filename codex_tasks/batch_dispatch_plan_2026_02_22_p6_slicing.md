# Batch Dispatch Plan — 2026-02-22 — P6 Large-file Slicing + Stabilization

## Scope
- task_504
- task_505
- task_506
- task_507
- task_508

## File lock constraints
- `task_505` and `task_506` share `ExtensionRuntimeBootstrap.tsx` -> strict serial (`505 -> 506`)
- `task_504` and `task_507` are parallel-safe (no shared file)
- `task_508` must run after `504 + 506 + 507`

## Recommended Wave Order

### Wave 1 (parallel)
- task_504 (`AppLayout` slicing)
- task_507 (`DataInputPanel` slicing)

### Wave 2 (serial)
- task_505 (`ExtensionRuntimeBootstrap` stage1)
- task_506 (`ExtensionRuntimeBootstrap` stage2)

### Wave 3 (finalize)
- task_508 (large-file budget guardrail)

## Estimated runtime
- Serial total: ~225 min
- Planned batch total: ~145 min
- Estimated reduction: ~35%

## Verification policy
- Every task runs end-stage gates (`lint`, `build`, relevant scripts).
- Wave handoff requires green state before next wave starts.
