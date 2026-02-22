# Batch Dispatch Plan — 2026-02-23 (P6 Slicing Wave2)

## Wave Layout

- Wave 2.1 (serial)
  - `task_509_mod_package_selectors_slicing_stage1.md`
- Wave 2.2 (finalize)
  - `task_510_large_file_budget_wave2_selectors.md`

## Why serial
- `task_510`은 `task_509` 결과 라인 수 기준 예산 고정이므로 선행 완료 필요.

## Gate checklist
- `bash scripts/check_mod_contract.sh`
- `bash scripts/check_v10_large_file_budget.sh`
- `cd v10 && npm run lint && npm run build`
- `bash scripts/run_repo_verifications.sh --stage end`
