#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

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
  "$script"
done

echo "[verify-sh] Done"
