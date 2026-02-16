#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

required_paths=(
  "v10/src/core/config/experiments.ts"
  "v10/src/features/experiments/abFlags.ts"
  "codex_tasks/workflow/experiment_registry.env"
)

for required in "${required_paths[@]}"; do
  if [[ ! -f "$required" ]]; then
    echo "[check_v10_experiment_registry] FAIL: missing $required"
    exit 1
  fi
done

node v10/tests/experiment_registry_guard.mjs

echo "[check_v10_experiment_registry] PASS"
