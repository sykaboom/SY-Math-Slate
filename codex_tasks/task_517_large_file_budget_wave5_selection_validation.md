# Task 517: Large-file Budget Wave5 (selection/validation split guard update)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - Wave5 기준 대형 파일 budget에 selection/validation split 파일 임계치를 반영한다.
  - 검증 체인에서 regression을 즉시 탐지하도록 유지한다.
- What must NOT change:
  - runtime behavior 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `scripts/check_v10_large_file_budget.sh`
- `codex_tasks/workflow/large_file_budget.env`
- `codex_tasks/task_517_large_file_budget_wave5_selection_validation.md`

Out of scope:
- app/runtime source 코드 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - shell script/env only

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-SELECTION-VALIDATION-3
- Depends on tasks:
  - `task_515`
  - `task_516`
- Enables tasks:
  - `[]`
- Parallel group:
  - G-P6-SLICE-W5
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
  - `~10min`
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - YES
- Rationale:
  - guardrail finalize 단계.

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

- [x] AC-1: `check_v10_large_file_budget.sh`가 새 split 파일들을 budget 대상으로 검사한다.
- [x] AC-2: Wave5 budget env 값 기준 PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `bash scripts/check_v10_large_file_budget.sh`
   - Expected result:
     - PASS.
   - Covers: AC-1, AC-2

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - budget 과도 제한 시 개발 속도 저하
- Roll-back:
  - env threshold 조정

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `scripts/check_v10_large_file_budget.sh`
- `codex_tasks/workflow/large_file_budget.env`
- `codex_tasks/task_517_large_file_budget_wave5_selection_validation.md`

Commands run (only if user asked or required by spec):
- `bash scripts/check_v10_large_file_budget.sh`
- `bash scripts/check_mod_contract.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `bash scripts/run_repo_verifications.sh --stage end`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - PASS

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - none
- Newly introduced failures:
  - none
- Blocking:
  - NO
- Mitigation:
  - N/A
