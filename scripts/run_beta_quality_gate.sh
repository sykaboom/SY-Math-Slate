#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

echo "[beta-gate] Running layer guard ..."
scripts/check_layer_rules.sh

echo "[beta-gate] Running lint/build ..."
(
  cd v10
  npm run lint
  npm run build
)

echo "[beta-gate] Running smoke/perf/a11y checks ..."
(
  cd v10
  node tests/beta_gate_smoke.mjs
  node tests/beta_gate_perf_a11y.mjs
)

echo "[beta-gate] PASS"
