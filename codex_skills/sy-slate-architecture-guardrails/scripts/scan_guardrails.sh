#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-.}"

if ! command -v rg >/dev/null 2>&1; then
  echo "rg (ripgrep) is required." >&2
  exit 2
fi

echo "== Guardrail scan (info only) =="

echo "\n[HTML usage] innerHTML / dangerouslySetInnerHTML"
rg -n "innerHTML|dangerouslySetInnerHTML" "$ROOT/v10/src" || true

echo "\n[Code execution] eval / new Function"
rg -n "eval\(|new Function" "$ROOT/v10/src" || true

echo "\n[Window globals] assignments (excluding MathJax loader)"
rg -n "window\.[A-Za-z0-9_]+\s*=" "$ROOT/v10/src" --glob '!v10/src/core/math/loader.ts' || true

echo "\n[Direct window globals] window['x'] ="
rg -n "window\[['\"][A-Za-z0-9_]+['\"]\]\s*=" "$ROOT/v10/src" || true

