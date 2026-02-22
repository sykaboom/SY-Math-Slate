# Task 626: mod-package base parse core slicing (stage3)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `baseFields/parse/parse.ts`를 facade-only로 축소하고 core lane(`parse/core.ts`)으로 분리한다.
- What must NOT change:
  - base parse contract/validation 실패 코드/시그니처 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/guards/validateDefinition/baseFields/parse/parse.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/baseFields/parse/parse/core.ts`
- `codex_tasks/task_626_mod_package_base_parse_core_slicing_stage3.md`

Out of scope:
- activation/modIds/rootFields validator 내부 구현 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - base parse lane 내부 분리만 수행
- Compatibility:
  - `parseValidationBase` export 시그니처 유지

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W36
- Depends on tasks:
  - `task_624`
- Enables tasks:
  - `task_628`
- Parallel group:
  - G-P6-SLICE-W36-B
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
  - parse pipeline orchestration core 분리 단일 작업.

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

- [x] AC-1: `baseFields/parse/parse.ts`가 facade-only(<=20 lines)로 축소된다.
- [x] AC-2: parse orchestration 로직이 `baseFields/parse/parse/core.ts`로 이동된다.
- [x] AC-3: lint/build PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `wc -l v10/src/core/runtime/modding/package/guards/validateDefinition/baseFields/parse/parse.ts`
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
  - core import 상대경로 오타 가능.
- Roll-back:
  - 기존 단일 `baseFields/parse/parse.ts`로 즉시 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/guards/validateDefinition/baseFields/parse/parse.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/baseFields/parse/parse/core.ts`
- `codex_tasks/task_626_mod_package_base_parse_core_slicing_stage3.md`

Commands run:
- `bash scripts/check_v10_large_file_budget.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `bash scripts/run_repo_verifications.sh --stage end`

Manual verification notes:
- `parse.ts`는 core re-export facade로 축소됨.
- root/modIds/activation/builder orchestration은 `parse/core.ts`로 이동.
- lint/build/repo verification PASS.
