#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

fail=0

check_file() {
  local file="$1"
  if [[ ! -f "$file" ]]; then
    echo "[FAIL] missing file: $file"
    fail=1
  fi
}

check_file "v10/src/core/foundation/policies/coreModBoundary.ts"
check_file "v10/src/core/foundation/policies/coreModBoundary.guards.ts"
check_file "v10/src/features/extensions/ui/registerCoreSlots.ts"
check_file "v10/src/features/extensions/ui/coreTemplates.ts"

if [[ "$fail" -eq 1 ]]; then
  exit 1
fi

for marker in \
  "engine.toolbar.mode-selector-shell" \
  "engine.command.dispatch-shell" \
  "engine.policy.role-gate-bridge" \
  "engine.window-host.mount-bridge"; do
  if ! rg -q "$marker" v10/src/core/foundation/policies/coreModBoundary.ts; then
    echo "[FAIL] core allowlist marker missing: $marker"
    fail=1
  fi
done

if ! rg -q "assertRuntimeSurfaceClassOrThrow" \
  v10/src/features/extensions/ui/registerCoreSlots.ts; then
  echo "[FAIL] registerCoreSlots.ts is not guarded by runtime boundary assertion"
  fail=1
fi

if ! rg -q "assertRuntimeSurfaceClassOrThrow" \
  v10/src/features/extensions/ui/coreTemplates.ts; then
  echo "[FAIL] coreTemplates.ts is not guarded by runtime boundary assertion"
  fail=1
fi

if rg -n "from \"@features/toolbar|from '@features/toolbar" \
  v10/src/core -g '*.ts' -g '*.tsx' >/dev/null; then
  echo "[FAIL] core layer imports toolbar feature directly"
  rg -n "from \"@features/toolbar|from '@features/toolbar" \
    v10/src/core -g '*.ts' -g '*.tsx'
  fail=1
fi

if [[ "$fail" -eq 1 ]]; then
  echo "[check_core_mod_boundary] FAIL"
  exit 1
fi

echo "[check_core_mod_boundary] PASS"
