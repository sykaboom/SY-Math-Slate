# Task 631: mod-package activation core slicing (stage3)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `validateDefinition/activation.ts`를 facade-only로 축소하고 core lane(`activation/core.ts`)으로 분리한다.
- What must NOT change:
  - toolbarModeMap parse/normalize 규칙과 에러 코드 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/guards/validateDefinition/activation.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/activation/core.ts`
- `codex_tasks/task_631_mod_package_activation_core_slicing_stage3.md`

Out of scope:
- `activation/entry.ts` 내부 규칙 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - activation lane 내부 분리만 수행
- Compatibility:
  - `parseActivationToolbarModeMap` export/반환 타입 유지

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W37
- Depends on tasks:
  - `task_628`
- Enables tasks:
  - `task_632`
- Parallel group:
  - G-P6-SLICE-W37-C
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 3
- Files shared with other PENDING tasks:
  - none
- Cross-module dependency:
  - NO
- Parallelizable sub-units:
  - 0
- Estimated single-agent duration:
  - `~15min`
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - YES
- Rationale:
  - activation parse lane facade/core 분리 단일 작업.

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

- [x] AC-1: `validateDefinition/activation.ts`가 facade-only(<=20 lines)로 축소된다.
- [x] AC-2: toolbarModeMap parse loop 로직이 `activation/core.ts`로 이동된다.
- [x] AC-3: lint/build PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `wc -l v10/src/core/runtime/modding/package/guards/validateDefinition/activation.ts`
   - Expected result:
     - <= 20
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
  - core import 경로 오타 가능.
- Roll-back:
  - 기존 단일 `validateDefinition/activation.ts` 구조로 즉시 revert.

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
- `v10/src/core/runtime/modding/package/guards/validateDefinition/activation/core.ts`
- `codex_tasks/task_631_mod_package_activation_core_slicing_stage3.md`

Commands run:
- `bash scripts/check_v10_large_file_budget.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `bash scripts/run_repo_verifications.sh --stage end`

Manual verification notes:
- `activation.ts`는 core re-export facade로 축소됨.
- toolbarModeMap object 검사/loop normalize는 `activation/core.ts`로 이동.
- lint/build/repo verification PASS.
