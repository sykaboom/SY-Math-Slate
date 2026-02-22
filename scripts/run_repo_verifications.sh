#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

verify_stage="${VERIFY_STAGE:-mid}"
if [[ "${1:-}" == "--stage" ]]; then
  verify_stage="${2:-}"
fi

if [[ "$verify_stage" != "mid" && "$verify_stage" != "end" ]]; then
  echo "[verify-sh] FAIL: VERIFY_STAGE must be 'mid' or 'end'."
  exit 1
fi

export VERIFY_STAGE="$verify_stage"
echo "[verify-sh] Stage: ${verify_stage}"

required_scripts=(
  "scripts/check_layer_rules.sh"
  "scripts/check_mod_contract.sh"
  "scripts/check_v10_large_file_budget.sh"
)

mapfile -t candidates < <(
  {
    find scripts -maxdepth 1 -type f -name "*.sh" 2>/dev/null
    find . -maxdepth 1 -type f -name "*.sh" 2>/dev/null
  } | sort -u
)

# Theme/module scope guard scripts are auto-discovered via `check_*.sh` naming.

selected=()
for script in "${candidates[@]}"; do
  base_name="$(basename "$script")"

  if [[ "$base_name" =~ ^(check_|verify_|validate_|scan_|lint_|test_|guardrail).*\.sh$ ]]; then
    selected+=("$script")
  fi
done

contains_selected_script() {
  local needle="$1"
  local item
  for item in "${selected[@]}"; do
    if [[ "$item" == "$needle" ]]; then
      return 0
    fi
  done
  return 1
}

for script in "${required_scripts[@]}"; do
  if [[ ! -f "$script" ]]; then
    echo "[verify-sh] FAIL: required verification script missing: $script"
    exit 1
  fi
  if ! contains_selected_script "$script"; then
    selected+=("$script")
  fi
done

mapfile -t selected < <(printf '%s\n' "${selected[@]}" | sort -u)

if ((${#selected[@]} == 0)); then
  echo "[verify-sh] No verification scripts matched."
  exit 0
fi

for script in "${selected[@]}"; do
  if [[ ! -x "$script" ]]; then
    echo "[verify-sh] Note: running non-executable script via bash: $script"
  fi
  echo "[verify-sh] Running: $script"
  if [[ "$(basename "$script")" == "check_v10_changed_lint.sh" ]]; then
    if [[ "$verify_stage" == "end" ]]; then
      VERIFY_LINT_SCOPE="${VERIFY_LINT_SCOPE:-full}" \
      VERIFY_FULL_BUILD="${VERIFY_FULL_BUILD:-1}" \
      bash "$script"
    else
      VERIFY_LINT_SCOPE="${VERIFY_LINT_SCOPE:-changed}" \
      VERIFY_FULL_BUILD="${VERIFY_FULL_BUILD:-0}" \
      bash "$script"
    fi
  else
    bash "$script"
  fi
done

echo "[verify-sh] Done"
