#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

contract_file="v10/src/core/config/viewportContract.ts"
if [[ ! -f "$contract_file" ]]; then
  echo "[check_v10_viewport_contract] FAIL: missing contract file: $contract_file"
  exit 1
fi

required_ids=(
  "tablet-768x1024"
  "tablet-820x1180"
  "tablet-1024x768"
  "tablet-1180x820"
)

for id in "${required_ids[@]}"; do
  if ! rg -q "$id" "$contract_file"; then
    echo "[check_v10_viewport_contract] FAIL: missing viewport id '$id'"
    exit 1
  fi
done

if ! rg -q 'MOBILE_VIEWPORT_BASELINE' "$contract_file"; then
  echo "[check_v10_viewport_contract] FAIL: missing MOBILE_VIEWPORT_BASELINE"
  exit 1
fi

if ! rg -q 'MIN_TOUCH_TARGET_PX' "$contract_file"; then
  echo "[check_v10_viewport_contract] FAIL: missing MIN_TOUCH_TARGET_PX"
  exit 1
fi

echo "[check_v10_viewport_contract] PASS"
