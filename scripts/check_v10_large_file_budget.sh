#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

budget_file="codex_tasks/workflow/large_file_budget.env"
if [[ ! -f "$budget_file" ]]; then
  echo "[check_v10_large_file_budget] FAIL: missing budget file: $budget_file"
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$budget_file"
set +a

validate_int() {
  local key="$1"
  local value="$2"
  if ! [[ "$value" =~ ^[0-9]+$ ]]; then
    echo "[check_v10_large_file_budget] FAIL: ${key} must be integer"
    exit 1
  fi
}

app_layout_max="${APP_LAYOUT_MAX:-0}"
ext_runtime_max="${EXTENSION_RUNTIME_BOOTSTRAP_MAX:-0}"
data_input_max="${DATA_INPUT_PANEL_MAX:-0}"

validate_int "APP_LAYOUT_MAX" "$app_layout_max"
validate_int "EXTENSION_RUNTIME_BOOTSTRAP_MAX" "$ext_runtime_max"
validate_int "DATA_INPUT_PANEL_MAX" "$data_input_max"

target_files=(
  "v10/src/features/chrome/layout/AppLayout.tsx"
  "v10/src/features/platform/extensions/ui/ExtensionRuntimeBootstrap.tsx"
  "v10/src/features/chrome/layout/DataInputPanel.tsx"
)

for file in "${target_files[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "[check_v10_large_file_budget] FAIL: missing target file: $file"
    exit 1
  fi
done

app_layout_lines="$(wc -l < "${target_files[0]}")"
ext_runtime_lines="$(wc -l < "${target_files[1]}")"
data_input_lines="$(wc -l < "${target_files[2]}")"

printf '[check_v10_large_file_budget] budget_wave=%s app_layout=%s/%s extension_runtime_bootstrap=%s/%s data_input_panel=%s/%s\n' \
  "${BUDGET_WAVE:-unknown}" \
  "$app_layout_lines" "$app_layout_max" \
  "$ext_runtime_lines" "$ext_runtime_max" \
  "$data_input_lines" "$data_input_max"

if (( app_layout_lines > app_layout_max )); then
  echo "[check_v10_large_file_budget] FAIL: AppLayout.tsx exceeded budget"
  exit 1
fi

if (( ext_runtime_lines > ext_runtime_max )); then
  echo "[check_v10_large_file_budget] FAIL: ExtensionRuntimeBootstrap.tsx exceeded budget"
  exit 1
fi

if (( data_input_lines > data_input_max )); then
  echo "[check_v10_large_file_budget] FAIL: DataInputPanel.tsx exceeded budget"
  exit 1
fi

echo "[check_v10_large_file_budget] PASS"
