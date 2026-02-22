# Batch Dispatch Plan — 2026-02-23 (P6 Slicing Wave5)

## Wave Layout

- Wave 5.1 (parallel-safe)
  - `task_515_mod_package_package_selection_slicing_stage2.md`
  - `task_516_mod_package_validate_definition_slicing_stage2.md`
- Wave 5.2 (finalize)
  - `task_517_large_file_budget_wave5_selection_validation.md`

## Why this layout
- `task_515`와 `task_516`는 파일 락이 분리되어 병렬 가능.
- `task_517`은 515/516 결과 라인 수 기준 예산 고정이라 후행 필수.

## Gate checklist
- `bash scripts/check_mod_contract.sh`
- `bash scripts/check_v10_large_file_budget.sh`
- `cd v10 && npm run lint && npm run build`
- `bash scripts/run_repo_verifications.sh --stage end`
