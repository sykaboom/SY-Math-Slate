# Hotfix 2026-02-14: Layer Boundary Verification Script

**Status:** COMPLETED
**Context:** `scripts/check_layer_rules.sh` 부재로 레이어 경계 검증이 반복적으로 N/A 처리되던 상태를 해소.

## Hotfix Approval
- Explicit user hotfix approval quote:
  - "응. 스크립트 핫픽스로 바로 만들어버려."

## Scope (Exact Files)
- `scripts/check_layer_rules.sh` (new)
- `codex_tasks/hotfix/hotfix_049_layer_rules_script.md`

## Changes
- Added executable `scripts/check_layer_rules.sh`.
- Script verifies layer import boundaries under `v10/src`:
  - `core -> core only`
  - `ui -> ui/core only`
  - `features -> features/ui/core only`
  - `app -> app/features/ui only`
- Also flags deprecated `src/lib` imports and unknown `@/` alias targets outside known layers.
- Output format is deterministic `file:line` violations with non-zero exit on failure.

## Commands Run
- `chmod +x scripts/check_layer_rules.sh`
- `scripts/check_layer_rules.sh`
- `bash scripts/run_repo_verifications.sh`

## Manual Verification Notes
- `scripts/check_layer_rules.sh`: PASS (`no layer violations`)
- `scripts/run_repo_verifications.sh`: now discovers and runs `scripts/check_layer_rules.sh` automatically.

