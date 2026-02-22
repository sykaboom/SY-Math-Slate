# Task 586: mod-package validate activation slicing (stage2)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `guards/validateDefinition/activation.ts`를 facade + entry validation internals로 분해한다.
- What must NOT change:
  - toolbarModeMap parse/validation semantics 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/guards/validateDefinition/activation.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/activation/`
- `codex_tasks/task_586_mod_package_validate_activation_slicing_stage2.md`

Out of scope:
- activation contract 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - validateDefinition lane 내부 분해 only
- Compatibility:
  - `parseActivationToolbarModeMap` signature unchanged

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W26
- Depends on tasks:
  - `task_584`
- Enables tasks:
  - `task_588`
- Parallel group:
  - G-P6-SLICE-W26-B
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 3~5
- Files shared with other PENDING tasks:
  - none
- Cross-module dependency:
  - NO
- Parallelizable sub-units:
  - 0
- Estimated single-agent duration:
  - `~20min`
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - YES
- Rationale:
  - activation entry validation 분리.

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

- [ ] AC-1: `activation.ts`가 facade 수준으로 축소된다(<=40 lines 목표).
- [ ] AC-2: toolbarModeMap 엔트리 검증이 하위 모듈로 분리된다.
- [ ] AC-3: lint/build PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `wc -l v10/src/core/runtime/modding/package/guards/validateDefinition/activation.ts`
   - Expected result:
     - <= 40
   - Covers: AC-1

2) Step:
   - Command / click path:
     - `cd v10 && npm run lint && npm run build`
   - Expected result:
     - PASS
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - invalid-toolbar-mode-map failure path drift 가능.
- Roll-back:
  - 기존 단일 `activation.ts`로 즉시 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/guards/validateDefinition/activation.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/activation/entry.ts`
- `codex_tasks/task_586_mod_package_validate_activation_slicing_stage2.md`

Commands run:
- `wc -l v10/src/core/runtime/modding/package/guards/validateDefinition/activation.ts v10/src/core/runtime/modding/package/guards/validateDefinition/activation/entry.ts`
- `bash scripts/check_v10_large_file_budget.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `bash scripts/run_repo_verifications.sh --stage end`

Manual verification notes:
- PASS: `activation.ts` is now 36 lines (<=40 target).
- PASS: toolbarModeMap entry validation moved to `activation/entry.ts` with failure semantics unchanged.
