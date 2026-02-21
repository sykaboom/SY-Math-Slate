#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

fail_count=0

pass() { echo "[check_toolbar_contract] PASS: $1"; }
fail() { echo "[check_toolbar_contract] FAIL: $1"; fail_count=$((fail_count+1)); }
warn() { echo "[check_toolbar_contract] WARN: $1"; }

TOOLBAR_FILES=(
  "v10/src/features/chrome/toolbar/FloatingToolbar.tsx"
  "v10/src/features/chrome/toolbar/PageNavigator.tsx"
  "v10/src/features/chrome/toolbar/PlaybackControls.tsx"
  "v10/src/features/chrome/toolbar/PenControls.tsx"
  "v10/src/features/chrome/toolbar/LaserControls.tsx"
  "v10/src/features/chrome/toolbar/EraserControls.tsx"
)

echo "[check_toolbar_contract] viewport-matrix: desktop(1440+), tablet(768-1180), mobile(<=430)"

if rg -n "window\\.alert|window\\.confirm" "${TOOLBAR_FILES[@]}" >/dev/null; then
  fail "blocking browser modal usage found in toolbar files"
else
  pass "no window.alert/window.confirm in toolbar files"
fi

if rg -n "catch\\(\\(\\) => undefined\\)" "${TOOLBAR_FILES[@]}" >/dev/null; then
  fail "silent command failure handlers found in toolbar files"
else
  pass "no silent catch(() => undefined) in toolbar files"
fi

if rg -n "resolveToolbarRenderPolicy" v10/src/features/chrome/toolbar/FloatingToolbar.tsx >/dev/null; then
  pass "FloatingToolbar uses centralized toolbar mode policy"
else
  fail "FloatingToolbar does not use resolveToolbarRenderPolicy"
fi

if rg -n "WINDOW_EDGE_SNAP_THRESHOLD_PX" v10/src/features/chrome/layout/windowing/windowRuntime.ts >/dev/null; then
  pass "window edge snap threshold is defined"
else
  fail "window edge snap threshold missing"
fi

if rg -n "allowOverflow" v10/src/features/chrome/layout/windowing/panelAdapters.tsx >/dev/null; then
  pass "window panel shell supports overflow visibility override"
else
  fail "window panel shell overflow override missing"
fi

if rg -n "COMPACT_MORE_PANEL_CLASSNAME" v10/src/features/chrome/toolbar/ThumbZoneDock.tsx >/dev/null; then
  pass "compact panel height policy centralized"
else
  fail "compact panel height policy not centralized"
fi

if rg -n "NAVIGATION_LABELS" \
  v10/src/features/chrome/toolbar/PageNavigator.tsx \
  v10/src/features/chrome/toolbar/PlaybackControls.tsx >/dev/null; then
  pass "navigation labels are centralized"
else
  fail "navigation labels are not centralized"
fi

if rg -n "TOOLBAR_DOCK_OPTIONS|toolbarDockSelector|canvas\\.dock\\.(left|center|right)|toolbarDockPosition" \
  v10/src/features/chrome/toolbar \
  v10/src/features/platform/store/useUIStoreBridge.ts \
  v10/src/features/chrome/layout/AppLayout.tsx >/dev/null; then
  fail "legacy toolbar dock selector references detected"
else
  pass "legacy left/center/right toolbar dock selector references removed"
fi

if [ "$fail_count" -gt 0 ]; then
  echo "[check_toolbar_contract] RESULT: FAIL ($fail_count issue(s))"
  exit 1
fi

echo "[check_toolbar_contract] RESULT: PASS"
