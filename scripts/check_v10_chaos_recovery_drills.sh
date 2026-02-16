#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

runbook="codex_tasks/workflow/chaos_recovery_drills.md"
if [[ ! -f "$runbook" ]]; then
  echo "[check_v10_chaos_recovery_drills] FAIL: missing runbook $runbook"
  exit 1
fi

for drill in "Drill 1" "Drill 2" "Drill 3" "Drill 4" "Drill 5"; do
  if ! rg -n --fixed-strings "$drill" "$runbook" >/dev/null; then
    echo "[check_v10_chaos_recovery_drills] FAIL: runbook missing section '$drill'"
    exit 1
  fi
done

(
  cd v10
  node tests/chaos_recovery_drills.mjs
)

echo "[check_v10_chaos_recovery_drills] PASS"
