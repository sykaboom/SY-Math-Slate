#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

budget_file="codex_tasks/workflow/style_budget.env"
if [[ ! -f "$budget_file" ]]; then
  echo "[check_v10_hardcoding_budget] FAIL: missing budget file: $budget_file"
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$budget_file"
set +a

max_allowed="${HARDCODING_STYLE_MAX:-0}"
if ! [[ "$max_allowed" =~ ^[0-9]+$ ]]; then
  echo "[check_v10_hardcoding_budget] FAIL: HARDCODING_STYLE_MAX must be integer"
  exit 1
fi

pattern='bg-[a-z]+-[0-9]{2,3}|text-[a-z]+-[0-9]{2,3}|border-[a-z]+-[0-9]{2,3}|#[0-9a-fA-F]{3,8}'
count="$(( $(rg -n --no-heading "$pattern" v10/src/features v10/src/ui | wc -l) ))"

printf '[check_v10_hardcoding_budget] budget_wave=%s count=%s max=%s\n' "${BUDGET_WAVE:-unknown}" "$count" "$max_allowed"

if (( count > max_allowed )); then
  echo "[check_v10_hardcoding_budget] FAIL: hardcoding usage regressed"
  rg -n --no-heading "$pattern" v10/src/features v10/src/ui | cut -d: -f1 | sort | uniq -c | sort -nr | head -n 20
  exit 1
fi

echo "[check_v10_hardcoding_budget] PASS"
