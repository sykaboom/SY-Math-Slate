#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  scripts/update_legacy_budget.sh \
    --wave <label> \
    --use-ui-max <int> \
    --use-canvas-max <int> \
    --dispatch-min <int> \
    [--file <path>]

Example:
  scripts/update_legacy_budget.sh \
    --wave W146 \
    --use-ui-max 100 \
    --use-canvas-max 68 \
    --dispatch-min 18
USAGE
}

is_non_negative_int() {
  [[ "$1" =~ ^[0-9]+$ ]]
}

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

budget_file="codex_tasks/workflow/legacy_budget.env"
wave=""
use_ui_max=""
use_canvas_max=""
dispatch_min=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --wave)
      wave="${2:-}"
      shift 2
      ;;
    --use-ui-max)
      use_ui_max="${2:-}"
      shift 2
      ;;
    --use-canvas-max)
      use_canvas_max="${2:-}"
      shift 2
      ;;
    --dispatch-min)
      dispatch_min="${2:-}"
      shift 2
      ;;
    --file)
      budget_file="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "[update-legacy-budget] FAIL: unknown arg: $1"
      usage
      exit 1
      ;;
  esac
done

if [[ -z "$wave" || -z "$use_ui_max" || -z "$use_canvas_max" || -z "$dispatch_min" ]]; then
  echo "[update-legacy-budget] FAIL: missing required args."
  usage
  exit 1
fi

if ! is_non_negative_int "$use_ui_max"; then
  echo "[update-legacy-budget] FAIL: --use-ui-max must be non-negative integer."
  exit 1
fi
if ! is_non_negative_int "$use_canvas_max"; then
  echo "[update-legacy-budget] FAIL: --use-canvas-max must be non-negative integer."
  exit 1
fi
if ! is_non_negative_int "$dispatch_min"; then
  echo "[update-legacy-budget] FAIL: --dispatch-min must be non-negative integer."
  exit 1
fi

mkdir -p "$(dirname "$budget_file")"

tmp_file="$(mktemp)"
cat > "$tmp_file" <<EOF
# Legacy budget thresholds (wave-scoped)
# Updated by scripts/update_legacy_budget.sh
BUDGET_WAVE=${wave}
USE_UISTORE_MAX=${use_ui_max}
USE_CANVASSTORE_MAX=${use_canvas_max}
DISPATCH_COMMAND_MIN=${dispatch_min}
EOF

mv "$tmp_file" "$budget_file"
echo "[update-legacy-budget] Updated: ${budget_file}"
cat "$budget_file"
