#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

echo "[check_v10_theme_visual_gate] validating theme preset/token contract ..."
(
  cd v10
  node tests/theme_visual_gate.mjs
)

echo "[check_v10_theme_visual_gate] validating style/module guard chain ..."
scripts/check_v10_hardcoding_budget.sh
scripts/check_v10_module_theme_scope.sh

echo "[check_v10_theme_visual_gate] PASS"
