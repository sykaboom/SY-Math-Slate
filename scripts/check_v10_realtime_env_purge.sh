#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

legacy_keys=(
  "NEXT_PUBLIC_REALTIME_SYNC_URL"
  "NEXT_PUBLIC_SYNC_BACKPLANE_URL"
)

targets=(
  "v10/src"
  "codex_tasks/workflow/feature_flag_registry.env"
)

for key in "${legacy_keys[@]}"; do
  if rg -n --fixed-strings "$key" "${targets[@]}" >/dev/null; then
    echo "[check_v10_realtime_env_purge] FAIL: deprecated key still present: $key"
    rg -n --fixed-strings "$key" "${targets[@]}" || true
    exit 1
  fi
done

if ! rg -n --fixed-strings "NEXT_PUBLIC_SYNC_REALTIME_URL" v10/src/features/sync/realtime/backplane.ts >/dev/null; then
  echo "[check_v10_realtime_env_purge] FAIL: canonical key missing in backplane"
  exit 1
fi

echo "[check_v10_realtime_env_purge] PASS"
