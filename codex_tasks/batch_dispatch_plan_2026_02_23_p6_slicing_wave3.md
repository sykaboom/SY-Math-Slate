# Batch Dispatch Plan — 2026-02-23 (P6 Slicing Wave3)

## Wave Layout

- Wave 3.1 (serial)
  - `task_511_mod_package_guards_slicing_stage1.md`
- Wave 3.2 (finalize)
  - `task_512_large_file_budget_wave3_guards.md`

## Why serial
- `task_512`은 `task_511` 결과 라인 수 기준 예산 고정이므로 선행 완료 필요.

## Gate checklist
- `bash scripts/check_mod_contract.sh`
- `bash scripts/check_v10_large_file_budget.sh`
- `cd v10 && npm run lint && npm run build`
- `bash scripts/run_repo_verifications.sh --stage end`
