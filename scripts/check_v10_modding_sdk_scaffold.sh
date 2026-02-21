#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

required_paths=(
  "v10/src/core/runtime/plugin-runtime/sdk/moddingSdk.ts"
  "v10/src/core/runtime/plugin-runtime/sdk/index.ts"
  "scripts/modding_sdk_cli.mjs"
  "codex_tasks/workflow/modding_sdk_cli_scaffold.md"
)

for required in "${required_paths[@]}"; do
  if [[ ! -f "$required" ]]; then
    echo "[check_v10_modding_sdk_scaffold] FAIL: missing $required"
    exit 1
  fi
done

slot_output="$(node scripts/modding_sdk_cli.mjs list-slots)"
if [[ "$slot_output" != *"toolbar-bottom"* ]]; then
  echo "[check_v10_modding_sdk_scaffold] FAIL: list-slots missing toolbar-bottom"
  exit 1
fi

tmp_manifest="$(mktemp)"
trap 'rm -f "$tmp_manifest"' EXIT

node scripts/modding_sdk_cli.mjs init \
  --plugin-id sdk-check \
  --slot toolbar-bottom \
  --command setTool \
  --out "$tmp_manifest" >/dev/null

node scripts/modding_sdk_cli.mjs validate --manifest "$tmp_manifest" >/dev/null

echo "[check_v10_modding_sdk_scaffold] PASS"
