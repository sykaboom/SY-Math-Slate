#!/usr/bin/env bash
set -euo pipefail

if [[ "${SKIP_AI_READ_ME_SYNC:-0}" == "1" ]]; then
  echo "[check_ai_read_me_sync] SKIP_AI_READ_ME_SYNC=1 -> skipped."
  exit 0
fi

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

staged_files="${AI_READ_ME_SYNC_STAGED_FILES:-}"
if [[ -z "$staged_files" ]]; then
  staged_files="$(git diff --cached --name-only --diff-filter=ACMR)"
fi

if [[ -z "$staged_files" ]]; then
  echo "[check_ai_read_me_sync] No staged files; skip."
  exit 0
fi

has_v10_src_change=0
has_ai_read_me_update=0

while IFS= read -r path; do
  [[ -z "$path" ]] && continue

  if [[ "$path" == v10/src/* ]]; then
    has_v10_src_change=1
  fi
  if [[ "$path" == "v10/AI_READ_ME.md" ]]; then
    has_ai_read_me_update=1
  fi
done <<< "$staged_files"

if [[ "$has_v10_src_change" -eq 0 ]]; then
  echo "[check_ai_read_me_sync] No staged v10/src changes; pass."
  exit 0
fi

if [[ "$has_ai_read_me_update" -eq 1 ]]; then
  echo "[check_ai_read_me_sync] PASS (v10/src changes include v10/AI_READ_ME.md update)."
  exit 0
fi

echo "[check_ai_read_me_sync] FAIL: staged v10/src changes detected without staged v10/AI_READ_ME.md update." >&2
echo "[check_ai_read_me_sync] Add/update v10/AI_READ_ME.md or bypass intentionally with SKIP_AI_READ_ME_SYNC=1." >&2
exit 1
