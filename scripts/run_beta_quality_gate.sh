#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

perf_budget_file="codex_tasks/workflow/perf_budget.env"
if [[ -f "$perf_budget_file" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$perf_budget_file"
  set +a
fi

echo "[beta-gate] Active JS budget: ${BETA_JS_BUNDLE_MAX_BYTES:-3200000}"

echo "[beta-gate] Running layer guard ..."
scripts/check_layer_rules.sh

echo "[beta-gate] Running theme visual gate ..."
scripts/check_v10_theme_visual_gate.sh

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
