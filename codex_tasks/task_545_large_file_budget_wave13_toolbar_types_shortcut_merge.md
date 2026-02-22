# Task 545: Large-file Budget Wave13 (toolbar types + shortcut merge split)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - Wave13 split 파일 budget 항목을 추가하고 facade budget을 tighten한다.
- What must NOT change:
  - runtime behavior 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `scripts/check_v10_large_file_budget.sh`
- `codex_tasks/workflow/large_file_budget.env`
- `codex_tasks/task_545_large_file_budget_wave13_toolbar_types_shortcut_merge.md`

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
  - W-P6-SLICE-W13
- Depends on tasks:
  - `task_543`, `task_544`
- Enables tasks:
  - `[]`
- Parallel group:
  - G-P6-SLICE-W13-C
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

- [x] AC-1: Wave13 split 파일 budget이 체크 스크립트에 반영된다.
- [x] AC-2: Wave13 env 기준 `check_v10_large_file_budget.sh` PASS.

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
- `codex_tasks/task_545_large_file_budget_wave13_toolbar_types_shortcut_merge.md`

Commands run:
- `bash scripts/check_v10_large_file_budget.sh`
- `bash scripts/check_mod_contract.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`

Manual verification notes:
- facade budget tighten 반영 (`PACKAGE_TYPES_TOOLBAR_PLAN_MAX`, `SELECTORS_RESOURCE_SHORTCUT_MERGE_MERGE_MAX`)
- Wave13 세부 split 파일 budget 키 7개 추가 및 PASS 확인
