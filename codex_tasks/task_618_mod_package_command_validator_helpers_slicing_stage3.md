# Task 618: mod-package command validator helpers slicing (stage3)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `commandRules/validators/entry/helpers.ts`를 facade + helper 디렉터리로 분해한다.
- What must NOT change:
  - command validator entry semantics 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/guards/resourcePolicy/commandRules/validators/entry/helpers.ts`
- `v10/src/core/runtime/modding/package/guards/resourcePolicy/commandRules/validators/entry/helpers/shape.ts`
- `v10/src/core/runtime/modding/package/guards/resourcePolicy/commandRules/validators/entry/helpers/build.ts`
- `codex_tasks/task_618_mod_package_command_validator_helpers_slicing_stage3.md`

Out of scope:
- `entry.ts` contract 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - command validator lane 내부 분해 only
- Compatibility:
  - `validateCommandRuleEntryShape`, `buildCommandRule` export 유지

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W34
- Depends on tasks:
  - `task_616`
- Enables tasks:
  - `task_620`
- Parallel group:
  - G-P6-SLICE-W34-B
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 4
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
  - helper facade + shape/build 분리.

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

- [ ] AC-1: `entry/helpers.ts`가 facade 수준(<=40 lines)으로 축소된다.
- [ ] AC-2: `entry/helpers/shape.ts`, `entry/helpers/build.ts`로 분해된다.
- [ ] AC-3: lint/build PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `wc -l v10/src/core/runtime/modding/package/guards/resourcePolicy/commandRules/validators/entry/helpers.ts`
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
  - helper deep path 타입 import 오타 가능.
- Roll-back:
  - 기존 단일 helpers.ts 구현으로 즉시 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/guards/resourcePolicy/commandRules/validators/entry/helpers.ts`
- `v10/src/core/runtime/modding/package/guards/resourcePolicy/commandRules/validators/entry/helpers/shape.ts`
- `v10/src/core/runtime/modding/package/guards/resourcePolicy/commandRules/validators/entry/helpers/build.ts`
- `codex_tasks/task_618_mod_package_command_validator_helpers_slicing_stage3.md`

Commands run:
- `bash scripts/check_v10_large_file_budget.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `bash scripts/run_repo_verifications.sh --stage end`

Manual verification notes:
- `entry/helpers.ts` facade-only export로 축소(<= 40 lines) 확인.
- command validator helpers가 `shape.ts` + `build.ts`로 분리됨.
- lint/build/repo verifications PASS.
