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

echo "[verify-sh] Stage: ${verify_stage}"

mapfile -t candidates < <(
  {
    find scripts -maxdepth 1 -type f -name "*.sh" 2>/dev/null
    find . -maxdepth 1 -type f -name "*.sh" 2>/dev/null
  } | sort -u
)

selected=()
for script in "${candidates[@]}"; do
  base_name="$(basename "$script")"

  if [[ "$base_name" =~ ^(check_|verify_|validate_|scan_|lint_|test_|guardrail).*\.sh$ ]]; then
    selected+=("$script")
  fi
done

if ((${#selected[@]} == 0)); then
  echo "[verify-sh] No verification scripts matched."
  exit 0
fi

for script in "${selected[@]}"; do
  if [[ ! -x "$script" ]]; then
    echo "[verify-sh] Skipping non-executable script: $script"
    continue
  fi
  echo "[verify-sh] Running: $script"
  if [[ "$(basename "$script")" == "check_v10_changed_lint.sh" ]]; then
    if [[ "$verify_stage" == "end" ]]; then
      VERIFY_LINT_SCOPE="${VERIFY_LINT_SCOPE:-full}" \
      VERIFY_FULL_BUILD="${VERIFY_FULL_BUILD:-1}" \
      "$script"
    else
      VERIFY_LINT_SCOPE="${VERIFY_LINT_SCOPE:-changed}" \
      VERIFY_FULL_BUILD="${VERIFY_FULL_BUILD:-0}" \
      "$script"
    fi
  else
    "$script"
  fi
done

echo "[verify-sh] Done"
