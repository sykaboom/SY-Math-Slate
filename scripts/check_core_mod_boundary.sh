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
check_file "v10/src/features/platform/extensions/ui/registerCoreSlots.ts"
check_file "v10/src/features/platform/extensions/ui/coreTemplates.ts"
check_file "v10/src/core/runtime/modding/index.ts"
check_file "v10/src/core/runtime/modding/api/index.ts"
check_file "v10/src/core/runtime/modding/host/index.ts"
check_file "v10/src/core/runtime/modding/package/index.ts"
check_file "v10/src/core/runtime/modding/builtin/index.ts"

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

for marker in \
  "export * from \"./api\"" \
  "export * from \"./host\"" \
  "export * from \"./package\"" \
  "export * from \"./builtin\""; do
  if ! rg -F -q "$marker" v10/src/core/runtime/modding/index.ts; then
    echo "[FAIL] runtime modding root export missing: $marker"
    fail=1
  fi
done

for marker in \
  "export * from \"./types\"" \
  "export * from \"./manager\"" \
  "export * from \"./inputRoutingBridge\"" \
  "export * from \"./registry\"" \
  "export * from \"./templatePackAdapter\"" \
  "export const registerBuiltinMods"; do
  if ! rg -F -q "$marker" \
    v10/src/core/runtime/modding/api/index.ts \
    v10/src/core/runtime/modding/host/index.ts \
    v10/src/core/runtime/modding/package/index.ts \
    v10/src/core/runtime/modding/builtin/index.ts; then
    echo "[FAIL] runtime modding export missing: $marker"
    fail=1
  fi
done

if ! rg -q "assertRuntimeSurfaceClassOrThrow" \
  v10/src/features/platform/extensions/ui/registerCoreSlots.ts; then
  echo "[FAIL] registerCoreSlots.ts is not guarded by runtime boundary assertion"
  fail=1
fi

if ! rg -q "assertRuntimeSurfaceClassOrThrow" \
  v10/src/features/platform/extensions/ui/coreTemplates.ts; then
  echo "[FAIL] coreTemplates.ts is not guarded by runtime boundary assertion"
  fail=1
fi

if rg -n "from \"@features/chrome/toolbar|from '@features/chrome/toolbar" \
  v10/src/core -g '*.ts' -g '*.tsx' >/dev/null; then
  echo "[FAIL] core layer imports toolbar feature directly"
  rg -n "from \"@features/chrome/toolbar|from '@features/chrome/toolbar" \
    v10/src/core -g '*.ts' -g '*.tsx'
  fail=1
fi

if [[ "$fail" -eq 1 ]]; then
  echo "[check_core_mod_boundary] FAIL"
  exit 1
fi

echo "[check_core_mod_boundary] PASS (runtime-modding boundary verified)"
