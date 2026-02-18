#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

runbook="codex_tasks/workflow/release_rollback_runbook.md"
checklist="codex_tasks/workflow/release_candidate_signoff_checklist.md"

if [[ ! -f "$runbook" ]]; then
  echo "[check_v10_release_rollback_guard] FAIL: missing $runbook"
  exit 1
fi

required_headings=(
  "## Trigger Conditions"
  "## Pre-Rollback Snapshot"
  "## Rollback Procedure"
  "## Post-Rollback Verification"
)

for heading in "${required_headings[@]}"; do
  if ! rg -n --fixed-strings "$heading" "$runbook" >/dev/null; then
    echo "[check_v10_release_rollback_guard] FAIL: missing heading '$heading'"
    exit 1
  fi
done

required_commands=(
  'git rev-parse --short HEAD'
  'git revert --no-edit'
  'VERIFY_STAGE=end bash scripts/run_repo_verifications.sh'
  'bash scripts/run_beta_quality_gate.sh'
)

for command_pattern in "${required_commands[@]}"; do
  if ! rg -n --fixed-strings "$command_pattern" "$runbook" >/dev/null; then
    echo "[check_v10_release_rollback_guard] FAIL: runbook missing command '$command_pattern'"
    exit 1
  fi
done

if [[ ! -f "$checklist" ]]; then
  echo "[check_v10_release_rollback_guard] FAIL: missing $checklist"
  exit 1
fi

if ! rg -n --fixed-strings 'release_rollback_runbook.md' "$checklist" >/dev/null; then
  echo "[check_v10_release_rollback_guard] FAIL: RC checklist must reference rollback runbook"
  exit 1
fi

echo "[check_v10_release_rollback_guard] PASS"
