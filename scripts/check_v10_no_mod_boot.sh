#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "[check_v10_no_mod_boot] validating no-mod bootstrap guard path"

if ! rg -n "NEXT_PUBLIC_TEMPLATE_PACK_BOOTSTRAP|isRuntimeTemplatePackBootstrapEnabled" \
  v10/src/mod/bridge/packRegistryBridge.ts >/dev/null; then
  echo "[check_v10_no_mod_boot] FAIL: template-pack bootstrap toggle not found" >&2
  exit 1
fi

echo "[check_v10_no_mod_boot] PASS: bootstrap toggle exists"

if rg -n "@/mod/packs/base-education" v10/src/features/chrome/toolbar/toolbarModePolicy.ts >/dev/null; then
  echo "[check_v10_no_mod_boot] FAIL: toolbarModePolicy still directly imports base-education pack" >&2
  exit 1
fi

echo "[check_v10_no_mod_boot] PASS: toolbarModePolicy pack direct import removed"

if ! rg -n "selectResolvedToolbarPlanInputFromRuntimeResolver" \
  v10/src/features/chrome/toolbar/FloatingToolbar.tsx \
  v10/src/core/runtime/modding/package/selectors.ts >/dev/null; then
  echo "[check_v10_no_mod_boot] FAIL: runtime resolver single-path hook missing" >&2
  exit 1
fi

echo "[check_v10_no_mod_boot] PASS: runtime resolver path wired"

echo "[check_v10_no_mod_boot] running build with NEXT_PUBLIC_TEMPLATE_PACK_BOOTSTRAP=0"
(
  cd v10
  NEXT_PUBLIC_TEMPLATE_PACK_BOOTSTRAP=0 npm run build >/tmp/check_v10_no_mod_boot_build.log 2>&1
)

echo "[check_v10_no_mod_boot] PASS: build succeeds with no-mod bootstrap toggle"
echo "[check_v10_no_mod_boot] RESULT: PASS"
