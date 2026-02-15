#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

if [[ ! -d "v10/src" ]]; then
  echo "[check_v10_legacy_freeze] FAIL: v10/src not found."
  exit 1
fi

if ! command -v rg >/dev/null 2>&1; then
  echo "[check_v10_legacy_freeze] FAIL: 'rg' (ripgrep) is required but not installed."
  exit 1
fi

is_non_negative_int() {
  [[ "$1" =~ ^[0-9]+$ ]]
}

budget_file="${LEGACY_BUDGET_FILE:-codex_tasks/workflow/legacy_budget.env}"

if [[ -f "$budget_file" ]]; then
  # shellcheck disable=SC1090
  source "$budget_file"
fi

budget_wave="${BUDGET_WAVE:-inline-default}"
baseline_use_ui_store_max="${USE_UISTORE_MAX:-111}"
baseline_use_canvas_store_max="${USE_CANVASSTORE_MAX:-76}"
baseline_dispatch_command_min="${DISPATCH_COMMAND_MIN:-13}"

if ! is_non_negative_int "$baseline_use_ui_store_max"; then
  echo "[check_v10_legacy_freeze] FAIL: USE_UISTORE_MAX must be non-negative integer."
  exit 1
fi
if ! is_non_negative_int "$baseline_use_canvas_store_max"; then
  echo "[check_v10_legacy_freeze] FAIL: USE_CANVASSTORE_MAX must be non-negative integer."
  exit 1
fi
if ! is_non_negative_int "$baseline_dispatch_command_min"; then
  echo "[check_v10_legacy_freeze] FAIL: DISPATCH_COMMAND_MIN must be non-negative integer."
  exit 1
fi

use_ui_store_count="$(rg -n --no-heading "useUIStore" v10/src | wc -l | tr -d ' ')"
use_canvas_store_count="$(rg -n --no-heading "useCanvasStore" v10/src | wc -l | tr -d ' ')"
dispatch_command_count="$(rg -n --no-heading "dispatchCommand\\(" v10/src | wc -l | tr -d ' ')"

echo "[check_v10_legacy_freeze] Budget wave: ${budget_wave}"
echo "[check_v10_legacy_freeze] Baseline thresholds:"
echo "[check_v10_legacy_freeze] useUIStore <= ${baseline_use_ui_store_max}"
echo "[check_v10_legacy_freeze] useCanvasStore <= ${baseline_use_canvas_store_max}"
echo "[check_v10_legacy_freeze] dispatchCommand >= ${baseline_dispatch_command_min}"

failure_count=0

if (( use_ui_store_count <= baseline_use_ui_store_max )); then
  echo "[check_v10_legacy_freeze] PASS useUIStore count=${use_ui_store_count} threshold<=${baseline_use_ui_store_max}"
else
  echo "[check_v10_legacy_freeze] FAIL useUIStore count=${use_ui_store_count} threshold<=${baseline_use_ui_store_max}"
  failure_count=$((failure_count + 1))
fi

if (( use_canvas_store_count <= baseline_use_canvas_store_max )); then
  echo "[check_v10_legacy_freeze] PASS useCanvasStore count=${use_canvas_store_count} threshold<=${baseline_use_canvas_store_max}"
else
  echo "[check_v10_legacy_freeze] FAIL useCanvasStore count=${use_canvas_store_count} threshold<=${baseline_use_canvas_store_max}"
  failure_count=$((failure_count + 1))
fi

if (( dispatch_command_count >= baseline_dispatch_command_min )); then
  echo "[check_v10_legacy_freeze] PASS dispatchCommand count=${dispatch_command_count} threshold>=${baseline_dispatch_command_min}"
else
  echo "[check_v10_legacy_freeze] FAIL dispatchCommand count=${dispatch_command_count} threshold>=${baseline_dispatch_command_min}"
  failure_count=$((failure_count + 1))
fi

if (( failure_count > 0 )); then
  echo "[check_v10_legacy_freeze] FAIL: ${failure_count} baseline check(s) failed."
  exit 1
fi

echo "[check_v10_legacy_freeze] PASS: all baseline freeze checks passed."
