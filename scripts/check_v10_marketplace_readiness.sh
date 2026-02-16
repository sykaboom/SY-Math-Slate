#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

required_paths=(
  "v10/src/core/contracts/extensionMarketplace.ts"
  "v10/src/core/extensions/marketplaceCatalog.ts"
  "v10/src/app/api/extensions/marketplace/route.ts"
  "v10/src/features/extensions/marketplace/useMarketplaceCatalog.ts"
  "v10/tests/marketplace_readiness.mjs"
)

for required in "${required_paths[@]}"; do
  if [[ ! -f "$required" ]]; then
    echo "[check_v10_marketplace_readiness] FAIL: missing $required"
    exit 1
  fi
done

node v10/tests/marketplace_readiness.mjs

echo "[check_v10_marketplace_readiness] PASS"
