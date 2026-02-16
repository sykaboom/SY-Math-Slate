#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-.}"
FAIL=0

if ! command -v rg >/dev/null 2>&1; then
  echo "rg (ripgrep) is required." >&2
  exit 2
fi

check_matches() {
  local label="$1"
  local pattern="$2"
  local path="$3"
  local matches
  matches=$(rg -n "$pattern" "$path" || true)
  if [ -n "$matches" ]; then
    echo "[VIOLATION] $label"
    echo "$matches"
    echo
    FAIL=1
  fi
}

# core must not import features or ui
check_matches "core imports @features" "from ['\"]@features/" "$ROOT/v10/src/core"
check_matches "core imports @ui" "from ['\"]@ui/" "$ROOT/v10/src/core"

# ui must not import features
check_matches "ui imports @features" "from ['\"]@features/" "$ROOT/v10/src/ui"

# no prisma client inside src
check_matches "prisma client import in v10/src" "@prisma/client|prisma/client" "$ROOT/v10/src"

# no v10/src/lib directory
if [ -d "$ROOT/v10/src/lib" ]; then
  echo "[VIOLATION] v10/src/lib exists (deprecated)"
  FAIL=1
fi

if [ "$FAIL" -ne 0 ]; then
  exit 1
fi

echo "Layer rules check: OK"
