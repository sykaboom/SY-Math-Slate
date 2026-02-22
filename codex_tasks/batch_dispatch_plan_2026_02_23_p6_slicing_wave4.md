# Batch Dispatch Plan — 2026-02-23 (P6 Slicing Wave4)

## Wave Layout

- Wave 4.1 (serial)
  - `task_513_mod_package_template_pack_adapter_slicing_stage1.md`
- Wave 4.2 (finalize)
  - `task_514_large_file_budget_wave4_template_pack_adapter.md`

## Why serial
- `task_514`은 `task_513` 결과 라인 수 기준 예산 고정이므로 선행 완료 필요.

## Gate checklist
- `bash scripts/check_mod_contract.sh`
- `bash scripts/check_v10_large_file_budget.sh`
- `cd v10 && npm run lint && npm run build`
- `bash scripts/run_repo_verifications.sh --stage end`
