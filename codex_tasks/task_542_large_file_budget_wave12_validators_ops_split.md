# Task 542: Large-file Budget Wave12 (validators + merge-ops split)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - Wave12 split 파일 budget 항목을 추가하고 facade budget을 tighten한다.
- What must NOT change:
  - runtime behavior 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `scripts/check_v10_large_file_budget.sh`
- `codex_tasks/workflow/large_file_budget.env`
- `codex_tasks/task_542_large_file_budget_wave12_validators_ops_split.md`

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
  - W-P6-SLICE-W12
- Depends on tasks:
  - `task_540`, `task_541`
- Enables tasks:
  - `[]`
- Parallel group:
  - G-P6-SLICE-W12-C
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

- [x] AC-1: Wave12 split 파일 budget이 체크 스크립트에 반영된다.
- [x] AC-2: Wave12 env 기준 `check_v10_large_file_budget.sh` PASS.

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
  - budget 과도 설정 시 개발 속도 저하.
- Roll-back:
  - env threshold 조정 또는 split 항목 제거.

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
- `codex_tasks/task_542_large_file_budget_wave12_validators_ops_split.md`

Commands run:
- `bash scripts/check_v10_large_file_budget.sh`
- `bash scripts/check_mod_contract.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`

Manual verification notes:
- facade budget tighten 반영 (`GUARDS_UI_POLICY_PARSE_VALIDATORS_MAX`, `SELECTORS_RESOURCE_COMMAND_MERGE_OPERATIONS_MAX`)
- Wave12 세부 split 파일 budget 키 6개 추가 및 PASS 확인
