#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

budget_file="codex_tasks/workflow/command_path_budget.env"
if [[ ! -f "$budget_file" ]]; then
  echo "[check_v10_command_write_path] FAIL: missing budget file: $budget_file"
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$budget_file"
set +a

for key in CANVAS_GETSTATE_CALLS_MAX UI_GETSTATE_CALLS_MAX CANVAS_DIRECT_HYDRATE_CALLS_MAX; do
  value="${!key:-}"
  if ! [[ "$value" =~ ^[0-9]+$ ]]; then
    echo "[check_v10_command_write_path] FAIL: $key must be integer"
    exit 1
  fi
done

canvas_getstate_calls="$(( $( { rg -n --no-heading 'useCanvasStore\.getState\(\)\.[a-zA-Z_]+' v10/src || true; } | wc -l) ))"
ui_getstate_calls="$(( $( { rg -n --no-heading 'useUIStore\.getState\(\)\.[a-zA-Z_]+' v10/src || true; } | wc -l) ))"
canvas_hydrate_calls="$(( $( { rg -n --no-heading 'useCanvasStore\.getState\(\)\.hydrate\(' v10/src || true; } | wc -l) ))"

printf '[check_v10_command_write_path] wave=%s canvas_getstate=%s/%s ui_getstate=%s/%s canvas_hydrate=%s/%s\n' \
  "${COMMAND_BUDGET_WAVE:-unknown}" \
  "$canvas_getstate_calls" "$CANVAS_GETSTATE_CALLS_MAX" \
  "$ui_getstate_calls" "$UI_GETSTATE_CALLS_MAX" \
  "$canvas_hydrate_calls" "$CANVAS_DIRECT_HYDRATE_CALLS_MAX"

if (( canvas_getstate_calls > CANVAS_GETSTATE_CALLS_MAX )); then
  echo "[check_v10_command_write_path] FAIL: canvas getState call count regressed"
  rg -n --no-heading 'useCanvasStore\.getState\(\)\.[a-zA-Z_]+' v10/src || true
  exit 1
fi

if (( ui_getstate_calls > UI_GETSTATE_CALLS_MAX )); then
  echo "[check_v10_command_write_path] FAIL: ui getState call count regressed"
  rg -n --no-heading 'useUIStore\.getState\(\)\.[a-zA-Z_]+' v10/src || true
  exit 1
fi

if (( canvas_hydrate_calls > CANVAS_DIRECT_HYDRATE_CALLS_MAX )); then
  echo "[check_v10_command_write_path] FAIL: direct canvas hydrate call count regressed"
  rg -n --no-heading 'useCanvasStore\.getState\(\)\.hydrate\(' v10/src || true
  exit 1
fi

echo "[check_v10_command_write_path] PASS"
