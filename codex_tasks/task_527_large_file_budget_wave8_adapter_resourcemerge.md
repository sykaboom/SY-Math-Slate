# Task 527: Large-file Budget Wave8 (adapter + resource merge split guard update)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - Wave8 기준 large-file budget에 toolbarDefinition/resourceItemMerge/resourceCommandMerge split 파일 budget을 추가한다.
  - facade 파일(`toolbarDefinition.ts`, `resourceItemMerge.ts`, `resourceCommandMerge.ts`) budget을 tighten한다.
- What must NOT change:
  - runtime behavior 변경 금지.

---

## Scope (Base Required)
Touched files/directories:
- `scripts/check_v10_large_file_budget.sh`
- `codex_tasks/workflow/large_file_budget.env`
- `codex_tasks/task_527_large_file_budget_wave8_adapter_resourcemerge.md`

Out of scope:
- app/runtime source 코드 변경

---

## Dependencies / Constraints (Base Required)
- New dependencies allowed: NO

---

## DAG / Wave Metadata (Base Required)
- Wave ID: W-P6-SLICE-W8
- Depends on tasks: `task_524`, `task_525`, `task_526`
- Enables tasks: `[]`
- Parallel group: G-P6-SLICE-W8
- Max parallel slots: 6
- Verification stage for this task: `end`

---

## Acceptance Criteria (Base Required)
- [x] AC-1: budget script가 split 파일까지 검사
- [x] AC-2: Wave8 budget 기준 PASS

---

## Manual Verification Steps (Base Required)
1) `bash scripts/check_v10_large_file_budget.sh`

---

## Risks / Roll-back Notes (Base Required)
- Risks: budget 과도 설정
- Roll-back: env threshold 조정

---

## Approval Gate (Base Required)
- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

---

## Implementation Log (Codex fills)
Status: COMPLETED
Changed files:
- `scripts/check_v10_large_file_budget.sh`
- `codex_tasks/workflow/large_file_budget.env`
- `codex_tasks/task_527_large_file_budget_wave8_adapter_resourcemerge.md`
Commands run:
- `bash scripts/check_v10_large_file_budget.sh`
- `bash scripts/check_mod_contract.sh`
- `cd v10 && npm run lint && npm run build`
- `bash scripts/run_repo_verifications.sh --stage end`
Gate Results:
- Lint: PASS
- Build: PASS
- Script checks: PASS
Failure Classification:
- Pre-existing failures: none
- Newly introduced failures: none
- Blocking: NO
- Mitigation: n/a
