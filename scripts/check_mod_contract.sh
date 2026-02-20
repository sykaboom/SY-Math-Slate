#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

FAIL=0

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

echo "[check_mod_contract] validating mod runtime contract boundaries"

check_forbidden_imports \
  "core/mod/builtin must not import feature layout/store/windowing" \
  "v10/src/core/mod/builtin" \
  "@features/(layout|store|layout/windowing)"

check_forbidden_imports \
  "core/mod/host must not import features" \
  "v10/src/core/mod/host" \
  "@features/"

check_forbidden_imports \
  "features/ui-host must not import core/mod internal paths" \
  "v10/src/features/ui-host" \
  "@core/mod/.*/internal/"

check_required_symbol \
  "ModManager class exists" \
  "v10/src/core/mod/host/manager.ts" \
  "export class ModManager"

check_required_symbol \
  "Runtime mod registration API exists" \
  "v10/src/core/mod/host/manager.ts" \
  "export const registerRuntimeMod"

check_required_symbol \
  "UI host bridge resolver exists" \
  "v10/src/features/ui-host/modContributionBridge.ts" \
  "export const listResolvedModToolbarContributions"

if [[ "$FAIL" -eq 1 ]]; then
  echo "[check_mod_contract] FAIL"
  exit 1
fi

echo "[check_mod_contract] PASS"
exit 0

