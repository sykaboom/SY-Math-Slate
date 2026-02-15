#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

isolation_file="v10/src/features/mod-studio/theme/themeIsolation.ts"
config_file="v10/src/core/config/themeTokens.ts"

if [[ ! -f "$isolation_file" ]]; then
  echo "[check_v10_module_theme_scope] FAIL: missing $isolation_file"
  exit 1
fi
if [[ ! -f "$config_file" ]]; then
  echo "[check_v10_module_theme_scope] FAIL: missing $config_file"
  exit 1
fi

if ! rg -q 'THEME_MODULE_PREFIX = "--mod-"' "$isolation_file"; then
  echo "[check_v10_module_theme_scope] FAIL: module prefix constant missing"
  exit 1
fi

if ! rg -q 'sanitizeThemeModuleId\(moduleId\)' "$isolation_file"; then
  echo "[check_v10_module_theme_scope] FAIL: module id sanitize path missing"
  exit 1
fi

if ! rg -q 'sanitizeThemeTokenKey\(tokenKey\)' "$isolation_file"; then
  echo "[check_v10_module_theme_scope] FAIL: token key sanitize path missing"
  exit 1
fi

if rg -q 'setProperty\("--mod-' "$isolation_file"; then
  echo "[check_v10_module_theme_scope] FAIL: direct --mod-* writes detected"
  exit 1
fi

if rg -q 'setProperty\("--theme-' "$isolation_file"; then
  echo "[check_v10_module_theme_scope] FAIL: direct --theme-* writes detected"
  exit 1
fi

if ! rg -q 'toModuleScopedThemeVariable\(moduleId, tokenKey\)' "$isolation_file"; then
  echo "[check_v10_module_theme_scope] FAIL: module variable helper usage missing"
  exit 1
fi

if ! rg -q 'toGlobalThemeVariable\(tokenKey\)' "$isolation_file"; then
  echo "[check_v10_module_theme_scope] FAIL: global variable helper usage missing"
  exit 1
fi

echo "[check_v10_module_theme_scope] PASS"
