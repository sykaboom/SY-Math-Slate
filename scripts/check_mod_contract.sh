#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

FAIL=0
WARN_COUNT=0
RUNTIME_MATRIX_FILE="codex_tasks/workflow/mod_package_runtime_regression_matrix.csv"
RUNTIME_MATRIX_THRESHOLD_FILE="codex_tasks/workflow/mod_package_runtime_thresholds.env"

DEFAULT_REQUIRED_VIEWPORTS="desktop tablet mobile"
DEFAULT_REQUIRED_CHECK_IDS="activation_policy input_routing host_policy"
DEFAULT_MIN_ROWS_PER_VIEWPORT=3

runtime_min_rows_per_viewport="$DEFAULT_MIN_ROWS_PER_VIEWPORT"
declare -a runtime_required_viewports=()
declare -a runtime_required_check_ids=()

trim() {
  local value="${1-}"
  value="${value#"${value%%[![:space:]]*}"}"
  value="${value%"${value##*[![:space:]]}"}"
  printf '%s' "$value"
}

contains_value() {
  local needle="$1"
  shift
  local candidate
  for candidate in "$@"; do
    if [[ "$candidate" == "$needle" ]]; then
      return 0
    fi
  done
  return 1
}

check_forbidden_imports() {
  local label="$1"
  local target_glob="$2"
  local pattern="$3"
  local matches
  matches="$(rg -n "$pattern" $target_glob -g '*.ts' -g '*.tsx' || true)"
  if [[ -n "$matches" ]]; then
    echo "[FAIL] $label"
    echo "$matches"
    FAIL=1
  else
    echo "[PASS] $label"
  fi
}

check_required_symbol() {
  local label="$1"
  local file="$2"
  local pattern="$3"
  if rg -n -q "$pattern" "$file"; then
    echo "[PASS] $label"
  else
    echo "[FAIL] $label"
    FAIL=1
  fi
}

load_runtime_matrix_thresholds() {
  if [[ ! -f "$RUNTIME_MATRIX_THRESHOLD_FILE" ]]; then
    echo "[FAIL] runtime matrix threshold file missing: $RUNTIME_MATRIX_THRESHOLD_FILE"
    FAIL=1
    return
  fi

  set -a
  # shellcheck disable=SC1090
  source "$RUNTIME_MATRIX_THRESHOLD_FILE"
  set +a

  local required_viewports_raw="${MOD_RUNTIME_REQUIRED_VIEWPORTS:-$DEFAULT_REQUIRED_VIEWPORTS}"
  local required_check_ids_raw="${MOD_RUNTIME_REQUIRED_CHECK_IDS:-$DEFAULT_REQUIRED_CHECK_IDS}"
  runtime_min_rows_per_viewport="${MOD_RUNTIME_MIN_ROWS_PER_VIEWPORT:-$DEFAULT_MIN_ROWS_PER_VIEWPORT}"

  read -r -a runtime_required_viewports <<< "$required_viewports_raw"
  read -r -a runtime_required_check_ids <<< "$required_check_ids_raw"

  if [[ "${#runtime_required_viewports[@]}" -eq 0 ]]; then
    echo "[FAIL] runtime matrix threshold config must define MOD_RUNTIME_REQUIRED_VIEWPORTS"
    FAIL=1
  fi

  if [[ "${#runtime_required_check_ids[@]}" -eq 0 ]]; then
    echo "[FAIL] runtime matrix threshold config must define MOD_RUNTIME_REQUIRED_CHECK_IDS"
    FAIL=1
  fi

  if ! [[ "$runtime_min_rows_per_viewport" =~ ^[0-9]+$ ]]; then
    echo "[FAIL] runtime matrix threshold MOD_RUNTIME_MIN_ROWS_PER_VIEWPORT must be an integer"
    FAIL=1
    return
  fi

  echo "[check_mod_contract] runtime-matrix-thresholds viewports=${runtime_required_viewports[*]} checks=${runtime_required_check_ids[*]} min_rows_per_viewport=${runtime_min_rows_per_viewport}"
}

check_runtime_regression_matrix() {
  if [[ ! -f "$RUNTIME_MATRIX_FILE" ]]; then
    echo "[FAIL] runtime matrix file missing: $RUNTIME_MATRIX_FILE"
    FAIL=1
    return
  fi

  if [[ "$FAIL" -eq 1 ]]; then
    return
  fi

  local row_count=0
  local line_no=0
  local raw_line=""
  declare -A viewport_row_count=()
  declare -A viewport_check_seen=()

  while IFS= read -r raw_line || [[ -n "$raw_line" ]]; do
    line_no=$((line_no + 1))
    raw_line="${raw_line%$'\r'}"
    local trimmed_line
    trimmed_line="$(trim "$raw_line")"

    if [[ -z "$trimmed_line" ]]; then
      continue
    fi
    if [[ "$trimmed_line" == \#* ]]; then
      continue
    fi

    if [[ "$line_no" -eq 1 && "$trimmed_line" == viewport,* ]]; then
      continue
    fi

    local viewport=""
    local check_id=""
    local file=""
    local pattern=""
    local extra=""
    IFS=',' read -r viewport check_id file pattern extra <<< "$trimmed_line"

    viewport="$(trim "$viewport")"
    check_id="$(trim "$check_id")"
    file="$(trim "$file")"
    pattern="$(trim "$pattern")"
    extra="$(trim "$extra")"

    if [[ -n "$extra" ]]; then
      echo "[FAIL] runtime matrix line $line_no has unexpected extra column(s): $trimmed_line"
      FAIL=1
      continue
    fi

    if [[ -z "$viewport" || -z "$check_id" || -z "$file" || -z "$pattern" ]]; then
      echo "[FAIL] runtime matrix line $line_no has empty required field(s): $trimmed_line"
      FAIL=1
      continue
    fi

    if ! contains_value "$viewport" "${runtime_required_viewports[@]}"; then
      echo "[FAIL] runtime matrix line $line_no has unknown viewport '$viewport'"
      FAIL=1
      continue
    fi

    if ! contains_value "$check_id" "${runtime_required_check_ids[@]}"; then
      echo "[FAIL] runtime matrix line $line_no has unknown check id '$check_id'"
      FAIL=1
      continue
    fi

    if [[ ! -f "$file" ]]; then
      echo "[FAIL] runtime matrix target file missing ($viewport/$check_id): $file"
      FAIL=1
      continue
    fi

    row_count=$((row_count + 1))
    viewport_row_count["$viewport"]=$(( ${viewport_row_count["$viewport"]:-0} + 1 ))
    viewport_check_seen["$viewport:$check_id"]=1

    if rg -n -F -q "$pattern" "$file"; then
      echo "[PASS] runtime-matrix $viewport/$check_id"
    else
      echo "[FAIL] runtime-matrix $viewport/$check_id missing pattern '$pattern' in $file"
      FAIL=1
    fi
  done < "$RUNTIME_MATRIX_FILE"

  if [[ "$row_count" -eq 0 ]]; then
    echo "[FAIL] runtime matrix contains no executable rows"
    FAIL=1
    return
  fi

  local viewport=""
  local check_id=""
  for viewport in "${runtime_required_viewports[@]}"; do
    local rows_for_viewport="${viewport_row_count["$viewport"]:-0}"
    if (( rows_for_viewport < runtime_min_rows_per_viewport )); then
      echo "[FAIL] runtime matrix viewport '$viewport' rows=$rows_for_viewport threshold=$runtime_min_rows_per_viewport"
      FAIL=1
    fi
    for check_id in "${runtime_required_check_ids[@]}"; do
      if [[ -z "${viewport_check_seen["$viewport:$check_id"]+x}" ]]; then
        echo "[FAIL] runtime matrix missing required row for viewport='$viewport' check='$check_id'"
        FAIL=1
      fi
    done
  done

  echo "[check_mod_contract] runtime-matrix rows=$row_count"
}

echo "[check_mod_contract] validating mod runtime contract boundaries"
echo "[check_mod_contract] section=import-boundary"

check_forbidden_imports \
  "core/runtime/modding builtin lanes must not import feature layout/store/windowing" \
  "v10/src/core/runtime/modding/builtin" \
  "@features/(layout|store|layout/windowing)"

check_forbidden_imports \
  "core/runtime/modding host lanes must not import features" \
  "v10/src/core/runtime/modding/host" \
  "@features/"

check_forbidden_imports \
  "features/ui-host must not import runtime modding internal paths" \
  "v10/src/features/chrome/ui-host" \
  "@core/runtime/modding/.*/internal/"

check_forbidden_imports \
  "core/runtime/modding package lanes must not import features" \
  "v10/src/core/runtime/modding/package" \
  "@features/"

check_forbidden_imports \
  "core/runtime/modding package lanes must not import host layer" \
  "v10/src/core/runtime/modding/package" \
  "@core/runtime/modding/host"

check_forbidden_imports \
  "features must not deep-import runtime modding package internals" \
  "v10/src/features" \
  "@core/runtime/modding/package/"

check_forbidden_imports \
  "features must not deep-import runtime modding host input routing bridge path" \
  "v10/src/features" \
  "@core/runtime/modding/host/inputRoutingBridge"

echo "[check_mod_contract] section=required-symbol"

check_required_symbol \
  "ModManager class exists" \
  "v10/src/core/runtime/modding/host/manager.ts" \
  "export class ModManager"

check_required_symbol \
  "Runtime mod registration API exists" \
  "v10/src/core/runtime/modding/host/manager.ts" \
  "export const registerRuntimeMod"

check_required_symbol \
  "UI host bridge resolver exists" \
  "v10/src/features/chrome/ui-host/modContributionBridge.ts" \
  "export const listResolvedModToolbarContributions"

check_required_symbol \
  "Runtime mod package registration API exists" \
  "v10/src/core/runtime/modding/package/registry.ts" \
  "export const registerRuntimeModPackage"

check_required_symbol \
  "Mod package public registry export exists" \
  "v10/src/core/runtime/modding/package/index.ts" \
  "export \\* from \"./registry\""

check_required_symbol \
  "Host public input routing bridge export exists" \
  "v10/src/core/runtime/modding/host/index.ts" \
  "export \\* from \"./inputRoutingBridge\""

check_required_symbol \
  "Runtime modding API public export exists" \
  "v10/src/core/runtime/modding/api/index.ts" \
  "export \\* from \"./types\""

check_required_symbol \
  "Runtime modding host public export exists" \
  "v10/src/core/runtime/modding/host/index.ts" \
  "export \\* from \"./manager\""

check_required_symbol \
  "Runtime modding package public export exists" \
  "v10/src/core/runtime/modding/package/index.ts" \
  "export \\* from \"./registry\""

check_required_symbol \
  "Runtime modding builtin public API exists" \
  "v10/src/core/runtime/modding/builtin/index.ts" \
  "export const registerBuiltinMods"

echo "[check_mod_contract] section=runtime-regression-matrix"
load_runtime_matrix_thresholds
check_runtime_regression_matrix

if [[ "$FAIL" -eq 1 ]]; then
  echo "[check_mod_contract] FAIL"
  exit 1
fi

if [[ "$WARN_COUNT" -gt 0 ]]; then
  echo "[check_mod_contract] WARN deprecated-imports=$WARN_COUNT"
fi

echo "[check_mod_contract] PASS"
exit 0
